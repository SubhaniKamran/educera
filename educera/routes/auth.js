const express = require("express");
const {
  Register,
  Login,
  getMe,
  resetPassword,
  forgotpassword,
  logout,
  updatePassword,
  updateDetails
} = require("../controller/auth");
const { protect } = require("../middleware/auth");
const router = express.Router();
router.post("/register", Register);
router.post("/login", Login);
router.post("/logout", protect, logout);
router.post("/updatedetails", protect, updateDetails);
router.post("/updatepassword", protect, updatePassword);
router.get("/getMe", protect, getMe);
router.post("/forgotpassword", forgotpassword);
router.put("/resetassword/:resettoken", resetPassword);
module.exports = router;
