const mongoose = require("mongoose");

const cashback_historySchema = new mongoose.Schema(
    {
        cashback_date: { type: Date, },
        staking_id: {type: String},
        member_id: { type: String },
        staking_amount: {type: Number},
        cashback_amount: {type: Number}
    },
    { timestamps: true, collection: "cashback_history" }
);

module.exports = mongoose.model("cashback_history", cashback_historySchema);
