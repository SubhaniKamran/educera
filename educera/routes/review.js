const express = require("express");
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview
} = require("../controller/review");

const router = express.Router({ mergeParams: true });
const Review = require("../models/Review");

const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");
router
  .route("/")
  .get(
    advancedResults(Review, {
      //selected model you wanna populate
      path: "bootcamp",
      //selected fields you wanna populate of selected models
      select: "name description"
    }),
    getReviews
  )
  .post(protect, authorize("user", "admin"), addReview);
router
  .route("/:id")
  .get(
    advancedResults(Review, {
      //selected model you wanna populate
      path: "bootcamp",
      //selected fields you wanna populate of selected models
      select: "name description"
    }),
    getReview
  )
  .put(protect, authorize("user", "admin"), updateReview)
  .delete(protect, authorize("user", "admin"), deleteReview);

module.exports = router;
