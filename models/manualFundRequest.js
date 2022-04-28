const mongoose = require("mongoose");

const manualFundSchema = new mongoose.Schema(
  {
    member_id: { type: String, unique: true },
    amount: { type: Number, default: 0 },
    txn_hash: { type: String, required: true, unique: true },
    is_approved: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "manualFundRequests" }
);

module.exports = mongoose.model("manualFundRequests", manualFundSchema);
