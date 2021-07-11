const { Router } = require("express");
const router = Router();
const Course = require("../models/course");
const fs = require("fs");
const path = require("path");
const auth = require("../middleware/auth");

function isOwner(course, req) {
  return course.userId.toString() === req.user._id.toString();
}

router.get("/course", async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("userId", "email name")
      .select("price title images");
    res.render("course", {
      courses,
      isCourses: true,
      userId: req.user ? req.user._id.toString() : null,
    });
  } catch (e) {
    console.log(e);
  }
});

router.get("/course/:id/edit", auth, async (req, res) => {
  if (!req.query.allow) {
    return res.redirect("/");
  }
  try {
    const course = await Course.findById(req.params.id);

    if (!isOwner(course, req)) {
      return res.redirect("/course");
    }
    res.render("courseEdit", {
      title: `Edit ${course.title}`,
      course,
    });
  } catch (e) {
    console.log(e);
  }
});

router.post("/edit", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.body.id);
    if (!isOwner(course, req)) {
      return res.redirect("/course");
    }
    Object.assign(course, req.body);
    await course.save();
    await Course.findByIdAndUpdate(req.body.id, req.body);
    res.redirect("/course");
  } catch (e) {
    console.log(e);
  }
});

router.post("/remove", auth, async (req, res) => {
  try {
    await Course.deleteOne({
      _id: req.body.id,
      userId: req.user._id,
    });
    res.redirect("/course");
  } catch (e) {
    console.log(e);
  }
});

router.get("/course/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    res.render("courses", {
      course,
    });
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
