// videoProcessing.js
const Video = require("../models/video.model");
const { transcribeVideo } = require("./transcription"); // You'll need to implement these
const { generateSocialMediaContent } = require("./social-media");
exports.process = async (videoId) => {
  try {
    console.log("i tried to process video", videoId);
    const video = await Video.findById(videoId);
    if (!video) throw new Error("Video not found");
    video.processingStatus = "processing";
    await video.save();
    // Transcribe video
    const transcription = await transcribeVideo(video.filePath);

    // For regular users
    // const regularResult = await transcribeVideo("/path/to/video.mp4");

    // For premium users (with video deletion)
    // const premiumResult = await transcribeVideo("/path/to/video.mp4", {
    //   deleteVideo: true,
    // });

    console.log("Transcription completed", transcription);
    video.transcription = transcription;

    // Generate social media content
    const { title, description } = await generateSocialMediaContent(
      transcription
    );

    // For regular users
    const regularContent = await generateSocialMediaContent(transcription, [
      "twitter",
      "instagram",
    ]);

    // For premium users (with custom tone)
    const premiumContent = await generateSocialMediaContent(transcription, [
      "twitter",
      "instagram",
      "linkedin",
    ]);

    video.socialMediaTitle = title;
    video.socialMediaDescription = description;
    console.log(
      "Social media content generated, saved now",
      title,
      description
    );
    video.processingStatus = "completed";
    await video.save();
  } catch (error) {
    console.error("Video processing failed", error);
    await Video.findByIdAndUpdate(videoId, { processingStatus: "error" });
  }
};
