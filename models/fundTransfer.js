const mongoose = require("mongoose");

const fundTransferSchema = new mongoose.Schema(
  {
    from: { type: String },
    to: { type: String},
    amount: { type: Number, default:0 },
  },
  { timestamps: true, collection: "fundTransfer" }
);

module.exports = mongoose.model("fundTransfer", fundTransferSchema);
