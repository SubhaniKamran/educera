const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");

//@desc get all users
//@route GET /api/v1/admin/users
//@acess Private
exports.getallUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

//@desc get all users
//@route GET /api/v1/admin/users
//@acess Private
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.status(200).json({ data: user });
});

//@desc get all users
//@route GET /api/v1/admin/users
//@acess Private
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(200).json({ data: user });
});

//@desc get all users
//@route GET /api/v1/admin/users
//@acess Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({ data: user });
});

//@desc get all users
//@route GET /api/v1/admin/users
//@acess Private
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ data: user });
});
