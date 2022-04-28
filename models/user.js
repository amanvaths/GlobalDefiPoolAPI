const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(
  {
    member_id: { type: String, unique: true },
    full_name: { type: String },
    sponsor_id: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    hash_password: { type: String },
    txn_password: { type: String },
    xcelpay_wallet: {type: String, required: true, unique: true },
    deposit_wallet: {type: String, unique: true },
    //country: { type: String, required: true},
    mobile: { type: String, required: true, unique: true },
    investment : { type: Number, default:0},
    bep20_wallet: { type: Number, default:0},
    coin_wallet: { type: Number, default:0},
    income_wallet: { type: Number, default:0},
    cashback_wallet : { type: Number, default:0},
    widthdrawl: { type: Number, default:0},
    level: { type: Number, default:-1},
    status: { type: Number, default: 0},
    direct_coin: { type: Number, default: 0 },
    total_coin: { type: Number, default: 0},
    direct_members: { type: Number, default: 0 },
    total_members: { type: Number, default: 0 },
    activation_date: {  type: Date, default:(new Date()).toISOString() }


  },
  { timestamps: true, collection: "user" }
);

module.exports = mongoose.model("User", userSchema);
