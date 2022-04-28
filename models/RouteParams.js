const mongoose = require("mongoose");

const routeParamsSchema = new mongoose.Schema(
  {
    routePath: { type: String, required:true },
    details: { type: String, required:true }
  },
  { timestamps: true, collection: "routeParams" }
);

module.exports = mongoose.model("routeParams", routeParamsSchema);
