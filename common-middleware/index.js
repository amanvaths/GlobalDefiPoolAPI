const jwt = require('jsonwebtoken')

exports.requireSignin = (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } else {
    return res.status(400).json({ message: "Authorization required" });
  }
  //jwt.decode()
};


exports.userMiddleware = (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(400).json({ message: 'User access denied' })
  }
  next();
}

exports.adminMiddleware = (req, res, next) => {

  if (req.user.role !== "admin") {
    return res.status(400).json({ message: 'Admin Access denied' })
  }
  next();
}

exports.verifyOTP = async (req, res, next) => {
  const ForgetOtpModel = require("../models/forgetOtp");
  const { email, otp } = req.body;
  const otpData = await ForgetOtpModel.findOne({
    email: email,
    otp: otp,
    isExpired: false,
  }).sort({createdAt: -1});
  if (!otpData) {
    return res.status(400).json({
      message: "OTP verification failed.",
    });
  }
  if (otpData) {
    await ForgetOtpModel.updateOne(
      { email: email },
      {
        $set: {
          isExpired: true,
        },
      }
    );
  }
  next();
};