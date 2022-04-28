const mongoose = require("mongoose");

const depositAddressHistorySchema = new mongoose.Schema(
  {
    member_id: { type: String, required:true },
    address: { type: String, required:true },
    gtype: {type: String}
  },
  { timestamps: true, collection: "depositAddressHistory" }
);

module.exports = mongoose.model("depositAddressHistory", depositAddressHistorySchema);
