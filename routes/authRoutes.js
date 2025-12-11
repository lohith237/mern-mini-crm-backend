const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp } =require("../controllers").otpControllers;
const {loginUser} = require("../controllers").loginUser
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/login',loginUser);
module.exports = router;
