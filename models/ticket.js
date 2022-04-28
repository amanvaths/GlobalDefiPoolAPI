const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    member_id: { type: String },
    franchise_id: { type: String },
    user_message:{ type: String, required: true},
    admin_reply:{ type: String, default:""},
    status: { type: Number, default:0},
    role: { type: String, default: "user"}

  },
  { timestamps: true, collection: "ticket" }
);

module.exports = mongoose.model("ticket", ticketSchema);
