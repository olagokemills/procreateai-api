const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  tags: [String],
  filePath: { type: String, required: true },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AuthUsers",
    required: true,
  },
  transcription: String,
  socialMediaDescription: String,
  socialMediaTitle: String,
  processingStatus: {
    type: String,
    enum: ["pending", "processing", "completed", "error"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Video", videoSchema);
