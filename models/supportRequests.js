const mongoose = require("mongoose");


const supportRequestSchema = new mongoose.Schema(
  {
    member_id: { type: String },
    support_subject: { type: String },
    support_message: { type: String, required: true},
    admin_reply: { type: String },
  },
  { timestamps: true, collection: "supportRequests" }
);

module.exports = mongoose.model("supportRequests", supportRequestSchema);