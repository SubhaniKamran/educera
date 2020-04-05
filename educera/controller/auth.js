const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

//@desc register a user
//@route Post /api/v1/auth/register
//@acess Public
exports.Register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({ name, email, password, role });
  const token = user.getJwtSignedToken();
  res.status(200).json({ success: true, user, token });
});

//@desc login a user
//@route POST /api/v1/auth/login
//@acess Public
exports.Login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate emil & password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select("+password");
  console.log(user);
  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  console.log(isMatch);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  sendTokenResponse(user, 200, res);
});

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getJwtSignedToken();
  const options = {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    )
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  console.log(token);
  res.status(statusCode).cookie("token", token, options);
  console.log(res);
};

//@desc get crrunt user
//@route Post /api/v1/auth/getme
//@acess Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({ success: true, user, user });
});

//@desc get crrunt user
//@route Post /api/v1/auth/getme
//@acess Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const valuetoUpdate = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findByIdAndUpdate(req.user.id, valuetoUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, user, user });
});

//@desc get crrunt user
//@route Post /api/v1/auth/getme
//@acess Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  if (!(await user.ComparePassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Sorry your password is incorrect", 400));
  }
  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});
//@desc get crrunt user
//@route Post /api/v1/auth/getme
//@acess Private
exports.logout = asyncHandler(async (req, res, next) => {
  const options = {
    httpOnly: true,
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRE + 1 * 1000)
  };
  res.cookie("token", "none", options);
  res.status(200).json({ success: true });
});

//@desc get password reset token
//@route Post /api/v1/auth/forgotpaasword
//@acess Private
exports.forgotpassword = asyncHandler(async (req, res, next) => {
  const user = await User.find({ email: req.params.email });
  if (!user) {
    return next(new ErrorResponse(`Wrong email, that user is not exist`, 404));
  }
  //get reset token
  const resettoken = user.passwordResetToken();

  //create reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resettoken}`;

  const message = `you are reciveing this mail, please make a put request to this URL ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subect: "password reset token",
      message
    });
    res.status(200).json({ success: true, msg: "Email sent" });
  } catch (error) {
    user.resetpasswordToken = undefined;
    user.resetTokenExpired = undefined;
    //user save
    await user.save({ validateBeforeSavve: false });
    return next(new ErrorResponse("Email could not sent", 500));
  }
  res.status(200).json({ success: true, data, user });
});

//@desc set reset password
//@route PUT /api/v1/auth/resetpassword/:resetToken
//@acess Private
exports.resetPassword = asyncHandler(async (req, res, next) => {
  //get hashtoke
  const resetpasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");
  const user = await User.findOne({
    resetpasswordToken,
    resetTokenExpired: { $gt: Date.now() }
  });
  if (!user) {
    return next(new ErrorResponse("Invalid Token", 400));
  }

  //set new password
  user.password = req.body.password;
  user.resetpasswordToken = undefined;
  user.resetTokenExpired = undefined;

  await user.save();

  sendTokenResponse(user, 200, res);
});
