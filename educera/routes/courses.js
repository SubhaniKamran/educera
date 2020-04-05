const express = require("express");
const {
  getCourses,
  addCourse,
  getCoursebyId,
  courseUpdate,
  deleteCourse
} = require("../controller/courses");

const Course = require("../models/Course");
const router = express.Router({ mergeParams: true });
const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");
router
  .route("/")
  .get(
    advancedResults(Course, {
      //selected model you wanna populate
      path: "bootcamp",
      //selected fields you wanna populate of selected models
      select: "name description"
    }),
    getCourses
  )
  .post(protect, authorize("publisher", "admin"), addCourse);
router
  .route("/:id")
  .get(getCoursebyId)
  .put(protect, authorize("publisher", "admin"), courseUpdate)
  .delete(protect, authorize("publisher", "admin"), deleteCourse);
module.exports = router;
