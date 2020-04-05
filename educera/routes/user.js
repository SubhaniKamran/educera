const express = require("express");
const {
  getallUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require("../controller/user");

const router = express.Router({ mergeParams: true });
const User = require("../models/User");

const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

router.use(protect);
router.use(authorize("admin"));

router
  .route("/")
  .get(advancedResults(User), getallUsers)
  .post(createUser);
router
  .route("/:id")
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
