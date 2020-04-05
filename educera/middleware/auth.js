const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

//protecting routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (req.cookies.token) {
    token = req.cookies.token;
  }
  //make sure token exists
  if (!token) {
    return next(new ErrorResponse(`You're not authorized to use this`, 404));
  }

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return next(new ErrorResponse(`You're not authorized to use this`, 404));
  }
});

//Grant access to use the rout
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse(`You're not authorized to use this`, 404));
    }
    next();
  };
};
