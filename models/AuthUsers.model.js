const mongoose = require("mongoose");

const authUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  googleId: { type: String },
  name: { type: String },
  subscriptionStatus: {
    type: String,
    enum: ["free", "on-hold", "paid"],
    default: "free",
  },
  videoCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  isPremium: { type: Boolean, default: false },
});

module.exports = mongoose.model("AuthUser", authUserSchema);
