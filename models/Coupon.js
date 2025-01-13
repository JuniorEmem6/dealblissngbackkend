// models/Coupon.js
const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: String,
  description: String,
  discount: String,
  link: { type: String, default: "" }, // New link field
  used: { type: Number, default: 0 },
});

module.exports = mongoose.model("Coupon", couponSchema);
