const mongoose = require("mongoose");

const RoyaltySchema = new mongoose.Schema(
  {
    member_id: { type: String },
    income_type: { type: String, default: "royalty" },
    date: { type:String, default:(new Date()).toLocaleDateString()},
    level: { type: Number, default:0 },
    royalty_amount: { type: Number, default:0 },
  },
  { timestamps: true, collection: "royalty" }
);

module.exports = mongoose.model("royalty", RoyaltySchema);

