const Video = require("../models/video.model");
const User = require("../models/AuthUsers.model");
const { transcribeVideo } = require("./transcription");
const { generateSocialMediaContent } = require("./social-media");
const { generateVideoThumbnail } = require("./thumbnailGenerator");
exports.transcribe = async (videoId) => {
  let video;
  try {
    video = await Video.findById(videoId);
    if (!video) throw new Error("Video not found");
    video.processingStatus = "transcribing";
    await video.save();

    const transcription = await transcribeVideo(video.filePath);
    video.transcription = transcription;
    video.processingStatus = "transcribed";
    await video.save();
  } catch (error) {
    if (video) {
      video.processingStatus = "error";
      video.processingError = `Transcription error: ${error.message}`;
      await video.save();
    }
    throw error;
  }
};

exports.generateSocialMedia = async (videoId) => {
  let video;
  try {
    video = await Video.findById(videoId);
    if (!video) throw new Error("Video not found");
    if (!video.transcription) throw new Error("Video not transcribed yet");

    const user = await User.findById(video.uploadedBy);
    if (!user) throw new Error("User not found");

    // Generate thumbnail
    video.processingStatus = "generating thumbnail";
    await video.save();

    video.processingStatus = "generating social media";
    await video.save();

    const content = await generateSocialMediaContent(
      video.transcription,
      video.description || "",
      video.tags || [],
      ["twitter", "instagram", "linkedin"],
      "neutral",
      true
      // user.isPremium
    );

    video.tldr = content.tldr;
    video.suggestedTags = Array.isArray(content.suggestedTags)
      ? content.suggestedTags
      : [];

    const platforms = content.platforms || {};
    video.socialMediaContent = {
      twitter: {
        title: content.twitter?.title || "Video Title",
        description: content.twitter?.description || "Check out this video!",
        hashtags: Array.isArray(platforms.twitter?.hashtags)
          ? content.twitter.hashtags
          : [],
      },
      instagram: {
        title: content.instagram?.title || "Video Title",
        description: content.instagram?.description || "Check out this video!",
        hashtags: Array.isArray(content.instagram?.hashtags)
          ? content.instagram.hashtags
          : [],
      },
      linkedin: {
        title: content.linkedin?.title || "Video Title",
        description:
          content.linkedin?.description ||
          "Check out this professional video content!",
        hashtags: Array.isArray(content.linkedin?.hashtags)
          ? content.linkedin.hashtags
          : [],
      },
    };

    // Delete original video file only for non-premium users
    if (!user.isPremium) {
      await fs.unlink(video.filePath);
      video.filePath = null; // Clear the file path as the video no longer exists
    }

    video.processingStatus = "completed";
    await video.save();
  } catch (error) {
    if (video) {
      video.processingStatus = "error";
      video.processingError = `Social media generation error: ${error.message}`;
      await video.save();
    }
    throw error;
  }
};
