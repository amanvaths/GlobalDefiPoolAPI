const mongoose = require("mongoose");

const withdrawlRequestSchema = new mongoose.Schema(
  {
    member_id: { type: String, required:true },
    amount: { type: Number, required:true, default: 0 },
    txn_hash: { type: String, default: "" },
    wallet_type: { type: String, required:true, default: "" },
    remark: { type: String, default: "" },
    is_approved: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "withdrawlRequests" }
);

module.exports = mongoose.model("withdrawlRequests", withdrawlRequestSchema);
