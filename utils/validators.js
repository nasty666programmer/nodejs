const { body } = require("express-validator/check");
const User = require('../models/user')


exports.registerValidators = [
  body("email").isEmail().withMessage("Введите корректный email").custom(async(value,{req}) => {
      try {
        const user = await User.findOne({email:value});
        if (user) {
            return Promise.reject('Пользователь с таким email уже существует')
        }
      }catch(e) {
          console.log(e)
      }
  }).normalizeEmail(),
  body("password",'Пароль должен быть минимум 6 символов').isLength({ min: 4, max: 56 }).isAlphanumeric().trim(),
  body('confirm').custom((value,{req}) => {
    if (value !== req.body.password) {
        throw new Error('Пароли должны совпадать')
    }
    return true
  }).trim(),
  body('name').isLength({min:3}).withMessage('Имя должно быть минимум 3 символа').trim()
];


exports.loginValidators = [
    body('email').isEmail().withMessage("Введите корректный email").normalizeEmail().custom(async (value,{req}) => {
        try {
            const candidate = await User.findOne({ email:req.body.email });
            if (!candidate) {
                return Promise.reject('Такого пользователя не существует')
            }
    }catch(e) {
        console.log(e)
    }
    }),
    body('password','Неправильный пароль').isLength({ min: 4, max: 56 }).isAlphanumeric().trim()
]

exports.courseValidators = [
    body('title').isLength({min: 3}).withMessage('Минимальная длинна названия 3 символа').trim(),
    body('price').isNumeric().withMessage('Введите корректную цену'),
    body('images', 'Введите корректный Url картинки').isURL()
  ]
