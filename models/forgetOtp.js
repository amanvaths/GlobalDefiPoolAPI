const mongoose = require("mongoose");

const ForgotOtpSchema = new mongoose.Schema(
  {
    email: { type: String },
    otp:{ type: Number, required: true, default: 0},
    isExpired:{type: Boolean, default: false}
  },
  { timestamps: true, collection: "ForgotOtp" }
);

module.exports = mongoose.model("ForgotOtp", ForgotOtpSchema);
