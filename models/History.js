const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    member_id: { type: String },
    income_from: { type: String },
    income_type: { type: String},
    amount: { type: Number, default:0 },
    investment: { type: Number, default:0},
    coin_wallet: { type: Number, default:0},
    income_wallet: { type: Number, default:0},
    level: { type: Number, default:0}
  },
  { timestamps: true, collection: "history" }
);

module.exports = mongoose.model("history", historySchema);
