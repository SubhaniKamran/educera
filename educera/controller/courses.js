const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");

//@desc get all courses
//@route GET /api/v1/course
//@route GET /api/v1/bootcamps/:bootcampid/courses
//@acess Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });
    res
      .status(200)
      .json({ success: true, data: courses, count: course.length });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//@desc get single course
//@route GET /api/v1/course
//@acess Public
exports.getCoursebyId = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description"
  });
  if (!course) {
    return next(
      new ErrorResponse(
        `Sorry we do'nt have a course with that id${req.params.id}`
      ),
      401
    );
  }
  res.status(200).json({ success: true, course });
});

//@desc post a course
//@route POST /api/v1/bootcamp/:bootcampid/courses
//@acess Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Sorry we don't have a bootcamp with that id${req.params.bootcampId}`
      ),
      401
    );
  }
  //check bootcamp ownership and admin
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `sorry this user can't add course in this bootcamp`,
        401
      )
    );
  }

  const course = await Course.create(req.body);
  res.status(200).json({ success: true, course });
});

//@desc update a course
//@route PUT /api/v1/course/:id
//@acess Private
exports.courseUpdate = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(
        `Sorry we do'nt have a course with that id${req.params.id}`
      ),
      401
    );
  }
  //check bootcamp ownership and admin
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`sorry this user can't update this course `, 401)
    );
  }
  await course.update(req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, course });
});

//@desc remove a course
//@route Delete /api/v1/course/:id
//@acess Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(
        `Sorry we do'nt have a course with that id${req.params.id}`
      ),
      401
    );
  }
  //check bootcamp ownership and admin
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`sorry this user can't delete this course `, 401)
    );
  }
  await course.remove();
  res.status(200).json({ success: true });
});
