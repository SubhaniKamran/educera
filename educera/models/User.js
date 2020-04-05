const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "please add name"]
  },
  email: {
    type: String,
    required: [true, "please add email"],
    unique: true
  },
  role: {
    type: String,
    enum: ["user", "publisher"],
    default: "user"
  },
  password: {
    type: String,
    required: [true, "please add paasword"],
    minlength: 6,
    select: false
  },
  resetpasswordToken: String,
  resetTokenExpired: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

//hash password by bcrypt before saving
UserSchema.pre("save", async function(next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//get signed token
UserSchema.methods.getJwtSignedToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  console.log(enteredPassword);
  return await bcrypt.compare(enteredPassword, this.password);
};

//password reset token
UserSchema.methods.passwordResetToken = function() {
  //Genrate Token
  const resetToken = crypto.randomBytes(20).toString("hex");
  //hash token and set the reset password field
  this.resetpasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  //set expire
  this.resetTokenExpired = Date.now() * 60 * 10 * 1000;
  return resetToken;
};
module.exports = mongoose.model("User", UserSchema);
