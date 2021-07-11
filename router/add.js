const { Router } = require("express");
const router = Router();
const fs = require("fs");
const path = require("path");
const Course = require("../models/course");
const { validationResult } = require("express-validator/check");
const auth = require("../middleware/auth");
const { courseValidators } = require("../utils/validators");

router.get("/add", auth, (req, res) => {
  res.render("add-course", {
    title: "Добавить курс",
    isAdd: true,
  });
});

router.post("/add", auth, courseValidators, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('add-course', {
      title: "Добавить курс",
      isAdd: true,
      error:errors.array()[0].msg,
      data: {
        title: req.body.title,
        price: req.body.price,
        images: req.body.images,
      }
    });
  }

  const course = new Course({
    title: req.body.title,
    price: req.body.price,
    images: req.body.images,
    userId: req.user,
  });

  try {
    await course.save();
    res.redirect("/course");
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
