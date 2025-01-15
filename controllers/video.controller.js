// videoController.js
const Video = require("../models/video.model");
const User = require("../models/AuthUsers.model");
const videoQueue = require("../functions/video-queue.process");
const path = require("path");
exports.uploadVideo = async (req, res) => {
  try {
    const { description, tags, userId } = req.body;
    const videoPath = path.join(global.UPLOADS_DIR, req.file.filename);

    const UserInfo = await Video.find({ uploadedBy: userId });

    const userDeets = await User.findById(userId);

    if (userDeets.isPremium && userDeets.subscriptionStatus === "paid") {
      next();
    } else {
      if (UserInfo.length >= 3) {
        return res.status(403).json({
          message:
            "You have reached the maximum limit of 3 videos per account. Please upgrade to premium to upload more videos.",
        });
      }
    }

    // const videoPath = req.file.path;
    const video = new Video({
      title: req.file.originalname,
      description,
      tags: tags.split(",").map((tag) => tag.trim()),
      filePath: videoPath,
      uploadedBy: userId, // Assuming you have authentication middleware
      processingStatus: "pending",
    });
    await videoQueue.addVideo(video._id.toString());

    await video.save();

    // Here you would typically start the video processing job
    // For now, we'll just respond with success
    res
      .status(201)
      .json({ message: "Video uploaded successfully", videoId: video._id });
  } catch (error) {
    console.error("Video upload failed", error);
    res
      .status(500)
      .json({ message: "Error uploading video", error: error.message });
  }
};

exports.getUserVideos = async (req, res) => {
  try {
    const videos = await Video.find({ uploadedBy: req.params.id }).sort({
      createdAt: -1,
    });
    res.json({ videos });
  } catch (error) {
    console.error("Error fetching user videos", error);
    res
      .status(500)
      .json({ message: "Error fetching videos", error: error.message });
  }
};

exports.getVideoStatus = async (req, res) => {
  try {
    const videoId = req.params.id;
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.json({
      id: video._id,
      title: video.title,
      processingStatus: video.processingStatus,
      socialMediaTitle: video.socialMediaTitle,
      transcription: video.transcription,
      socialMediaDescription: video.socialMediaDescription,
    });
  } catch (error) {
    console.error("Error fetching video status", error);
    res
      .status(500)
      .json({ message: "Error fetching video status", error: error.message });
  }
};
