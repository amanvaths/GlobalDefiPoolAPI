const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
  {
    member_id: { type: String },
    trans_hash: { type: String },
    amount: { type: Number, default: 0 },
    date: { type: Date, default:(new Date()).toLocaleDateString() },
  },
  { timestamps: true, collection: "investment" }
);

module.exports = mongoose.model("investment", investmentSchema);
