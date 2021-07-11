const { Router } = require("express");
const router = Router();
const User = require("../models/user");
const crypto = require('crypto')
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgrid = require("nodemailer-sendgrid-transport");
const keys = require("../keys");
const reqEmail = require("../emails/registration");
const sgMail = require("@sendgrid/mail");
const reset = require('../emails/reset');
const {validationResult} = require('express-validator/check');
const {registerValidators} = require('../utils/validators');
const {loginValidators} = require('../utils/validators')

router.get("/login", async (req, res) => {
  res.render("auth/login", {
    title: "Auth",
    isLogin: true,
    error: req.flash("error"),
    loginError: req.flash("loginError"),
  });
});

router.get("/logout", async (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login#login");
  });
});

router.post("/login", loginValidators,async (req, res) => {
  try {
    const { email, password } = req.body;

    const error = validationResult(req);

    if(!error.isEmpty()) {
      req.flash('loginError',error.array()[0].msg)
      return res.status(422).redirect('/auth/login#register')
    }

    const candidate = await User.findOne({ email });

    if (candidate) {
      const isSame = await bcrypt.compare(password, candidate.password);
      if (isSame) {
        req.session.user = candidate;
        req.session.isAuthenticated = true;
        req.session.save((err) => {
          if (err) {
            throw err;
          }
          res.redirect("/");
        });
      } else {
        res.redirect("/auth/login#login");
        req.flash("loginError", "Password incorrect");
      }
    } else {
      res.redirect("/auth/login#login");
      req.flash("loginError", "This user is not defined");
    }
  } catch (e) {
    console.log(e);
  }
});

router.post("/register",registerValidators, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const error = validationResult(req);

    if(!error.isEmpty()) {
      req.flash('error',error.array()[0].msg)
      return res.status(422).redirect('/auth/login#register')
    }

    
      const hashPassword = await bcrypt.hash(password, 10);
      const user = new User({
        email,
        name,
        password: hashPassword,
        cart: { items: [] },
      });
      await user.save();
      sgMail
        .setApiKey(keys.SEND_GRID_API_KEY)

        .send(reqEmail(email))
        .then(() => {
          console.log("Email sent");
        })
        .catch((error) => {
          console.error(error);
        });

      res.redirect("/auth/login#login");
  } catch (e) {
    console.log(e)
  }
});


router.get('/reset',(req,res) => {
  res.render('auth/reset',{
    title:'Forget Password',
    error:req.flash('error')
  })
})


router.post('/reset', (req,res) => {
    try {
      crypto.randomBytes(32, async (err,buffer) => {
        if (err) {
          req.flash('error','Что-то пошло не так,повторите попытку  ')
          return res.redirect('/auth/reset')
        }

        const token = buffer.toString('hex');

        const candidate = await User.findOne({email: req.body.email})

        if (candidate) {
          candidate.resetToken = token;
          candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
          await candidate.save();

          sgMail
          .setApiKey(keys.SEND_GRID_API_KEY)
  
          .send(reset(candidate.email,token))
          .then(() => {
            console.log("Email sent");
          })
          .catch((error) => {
            console.error(error);
          });

          res.redirect('/auth/login')

        }else {
            req.flash('error','This email is not found')
            res.redirect('/auth/reset')
          }

      })
    }catch(e) {
      console.log(e)
    }

    
})

router.get('/password/:token',async (req,res) => {
  if (!req.params.token) {
    return res.redirect('/auth/login');
  }
try {
  const user = await User.findOne({
    resetToken: req.params.token,
    resetTokenExp:{$gt: Date.now()}
  })

  if (!user) {
    res.redirect('/auth/login')
  }else {
    res.render('auth/password',{
      title:'Восстановление пароля',
      error:req.flash('error'),
      userId:user._id.toString(),
      token:req.params.token
    })
  }
  
}catch(e) {
  console.log(e)
}

  


})

router.post('/password',async (req,res) => {
  try {
    const user = await User.findOne({
      _id:req.body.userId,
      resetToken:req.body.token,
      resetTokenExp:{$gt:Date.now()}
    })

    if (user) {
      user.password = await bcrypt.hash(req.body.password,10);
      user.resetToken = undefined;
      user.resetTokenExp = undefined;

      await user.save();

      res.redirect('/auth/login');
    }else {
      req.flash('loginError','Время жизни токена истекло')
      res.redirect('/auth/login')
    } 
  }catch(e) {
    console.log(e)
  }
})

module.exports = router;
