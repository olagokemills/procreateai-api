const ffmpeg = require("fluent-ffmpeg");
const path = require("path");

async function generateVideoThumbnail(videoPath, outputDir) {
  return new Promise((resolve, reject) => {
    const thumbnailPath = path.join(outputDir, `thumbnail_${Date.now()}.jpg`);
    ffmpeg(videoPath)
      .screenshots({
        timestamps: ["50%"], // Take screenshot at 50% of the video duration
        filename: path.basename(thumbnailPath),
        folder: outputDir,
        size: "320x240", // Adjust size as needed
      })
      .on("end", () => resolve(thumbnailPath))
      .on("error", (err) => reject(err));
  });
}

module.exports = { generateVideoThumbnail };
