const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { sendMail } = require("../config/mailer.js");



const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // console.log('password', password, user.password); 

const isMatch = await bcrypt.compare(password, user.password);
console.log('isMatch', isMatch);  
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user.id, user.role);

    res.status(200).json({
      message: "Login successful",
      role: user.role,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

 
const sendForgotPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

  
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

   
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10);

    await user.update({ resetOtp: otp, resetOtpExpiry: expiry });

 
    const subject = "OTP for Password Reset";
    const text = `Your OTP for password reset is: ${otp}\nIt is valid for 10 minutes.\nIf you did not request this, please ignore this email.`;

    await sendMail(email, subject, text);

    return res.status(200).json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};


const verifyOtpAndUpdatePassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    const newPassword = password;
    // console.log('Received Data:', email, otp, newPassword, req.body);

    // if (!email || !otp || !newPassword) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Email, OTP and new password are required",
    //   });
    // }

    const user = await User.findOne({ where: { email } });
    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please resend OTP.",
      });
    }

    const otpFromReq = String(otp).trim();
    const otpFromDB = String(user.resetOtp).trim();

    if (otpFromDB !== otpFromReq) {
      return res.status(400).json({
        success: false,
        message: "Incorrect OTP",
      });
    }

    if (new Date(user.resetOtpExpiry).getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    console.log('Hashed New Password:', hashedPassword);
    console.log('new Password:', newPassword);
    const compare = await bcrypt.compare(newPassword, hashedPassword);
    console.log('Password Match after Hashing New Password:', compare);

    await user.update({
      password: hashedPassword,
      resetOtp: null,
      resetOtpExpiry: null,
    });

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



module.exports = { loginUser, sendForgotPasswordOTP, verifyOtpAndUpdatePassword };
