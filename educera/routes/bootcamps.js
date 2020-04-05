const express = require("express");
const {
  getbootCamps,
  editbootCamp,
  getbootCamp,
  deletebootCamp,
  createbootCamp,
  getbootCampsInRadius
} = require("../controller/bootcamps");

const Bootcamp = require("../models/Bootcamp");
//include other resourse router
const courseRouter = require("./courses");
const reviewRouter = require("./review");

const router = express.Router();

const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");

/// Re-route into other resource routers
router.use("/:bootcampId/courses", courseRouter);
router.use("/:bootcampId/reviews", reviewRouter);

router
  .route("/")
  //, "courses"
  .get(advancedResults(Bootcamp), getbootCamps)
  .post(protect, authorize("Publisher", "admin"), createbootCamp);
router
  .route("/:id")
  .get(getbootCamp)
  .put(protect, authorize("Publisher", "admin"), editbootCamp)
  .delete(protect, authorize("Publisher", "admin"), deletebootCamp);
router.route("/radius/:zipcode/:distance").get(getbootCampsInRadius);

module.exports = router;
