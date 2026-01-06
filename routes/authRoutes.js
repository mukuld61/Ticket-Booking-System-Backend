const express = require("express");
const {loginUser,sendForgotPasswordOTP,verifyOtpAndUpdatePassword } = require("../controllers/authController");

const router = express.Router();


router.post("/login", loginUser);

router.post("/forgot-password-otp", sendForgotPasswordOTP);

router.post("/verify-otp-update-password", verifyOtpAndUpdatePassword);

module.exports = router;
