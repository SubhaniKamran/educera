const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Review = require("../models/Review");
const Bootcamp = require("../models/Bootcamp");

//@desc get all courses
//@route GET /api/v1/course
//@route GET /api/v1/bootcamps/:bootcampid/reviews
//@acess Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    res
      .status(200)
      .json({ success: true, data: reviews, count: reviews.length });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//@desc get one review
//@route GET /api/v1/reviews/
//@acess Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse("Review not found ", 400));
  }
  res.status(200).json({ success: true, data: review });
});

//@desc add review
//@route GET /api/v1/course
//@route GET /api/v1/bootcamps/:bootcampid/add review
//@acess Public
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(new ErrorResponse("sorry there is not a bootcamp ", 400));
  }
  const review = await Review.create(req.body);
  res.status(200).json({ success: true, data: review });
});

//@desc add review
//@route GET /api/v1/course
//@route GET /api/v1/bootcamps/:bootcampid/add review
//@acess Public
exports.updateReview = asyncHandler(async (req, res, next) => {
  const review = await Bootcamp.findById(req.params.id);
  if (!review) {
    return next(new ErrorResponse("sorry there is no review ", 400));
  }
  //check review ownership and admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`sorry this user can't update  this review`, 401)
    );
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({ success: true, data: review });
});

//@route GET /api/v1/course
//@route GET /api/v1/bootcamps/:bootcampid/add review
//@acess Public
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Bootcamp.findById(req.params.id);
  if (!review) {
    return next(new ErrorResponse("sorry there is no review ", 400));
  }
  //check review ownership and admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`sorry this user can't delete  this review`, 401)
    );
  }

  await review.remove();
  res.status(200).json({ success: true, data: review });
});
