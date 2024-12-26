// models/Coupon.js
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: String,
    offer: String,
    used: { type: Number, default: 0 },
    today: { type: Number, default: 0 },
    thumbsUp: { type: Number, default: 0 },
    thumbsDown: { type: Number, default: 0 }
});

module.exports = mongoose.model('Coupon', couponSchema);
