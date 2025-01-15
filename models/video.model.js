const mongoose = require("mongoose");

const socialMediaContentSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    hashtags: [String],
  },
  { _id: false }
);

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
  tldr: String,
  socialMediaContent: {
    twitter: socialMediaContentSchema,
    instagram: socialMediaContentSchema,
    linkedin: socialMediaContentSchema,
  },
  suggestedTags: [String],
  processingError: String,
  processingStatus: {
    type: String,
    enum: [
      "pending",
      "processing",
      "transcribing",
      "transcribed",
      "generating thumbnail",
      "generating social media",
      "completed",
      "error",
    ],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Video", videoSchema);
