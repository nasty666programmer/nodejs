const { Router } = require("express");
const router = Router();
const Order = require("../models/order");
const auth = require('../middleware/auth')


router.get('/', auth,async (req, res) => {
    try {
      console.log(req.user)
        const orders = await Order.find({
            'user.userId':req.user._id
        }).populate('user.userId')

    res.render("orders", {
        title: "Orders",
        orders:orders.map(el => {
            return {...el._doc,price:el.courses.reduce((total,c) => {
                return total += c.count * c.course.price
            },0)}
        })
        });
    }catch(e) {
      console.log(e)
    }
  
});

router.post('/',auth, async (req, res) => {
  try {
    const user = await req.user.populate("cart.items.courseId").execPopulate();
    console.log(user)

    const courses = user.cart.items.map((el) => ({
      count: el.count,
      course: { ...el.courseId._doc }
    }));
    const order = new Order({
      user: {
        name: req.user.name,
        userId: req.user,
      },
      courses,
    });

    await order.save();
    await req.user.clearCart();
    res.redirect("/orders");
  } catch (err) {
    console.log(err);
  }

 
});

module.exports = router;
