const mongoose = require("mongoose");
const announcementSchema  = new mongoose.Schema(
  {
    announcement: { type: String, required: true},
    announcement_for: { type: String },
  },
  { timestamps: true, collection: "announcements" }
);

module.exports = mongoose.model("announcements", announcementSchema);