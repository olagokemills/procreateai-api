// transcriptionService.js
const whisper = require("node-whisper").default;
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const fs = require("fs/promises");
const path = require("path");

ffmpeg.setFfmpegPath(ffmpegStatic);

async function transcribeVideo(videoPath, options = {}) {
  const {
    deleteVideo = false,
    language = "en",
    device = "cpu",
    model = "base",
    outputFormat = "txt",
  } = options;

  let audioPath;
  try {
    console.log("Starting video transcription...");

    // Generate audio file path (same name as video but with .wav extension)
    const audioFileName =
      path.basename(videoPath, path.extname(videoPath)) + ".wav";
    audioPath = path.join(global.UPLOADS_DIR, audioFileName);

    // Convert video to audio (wav format with 16000 Hz frequency)
    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .toFormat("wav")
        .audioFrequency(16000)
        .on("error", reject)
        .on("end", resolve)
        .save(audioPath);
    });
    console.log("Audio conversion completed:", audioPath);

    // Transcribe audio using node-whisper
    const result = await whisper(audioPath, {
      language,
      device,
      model,
      output_format: outputFormat,
    });

    console.log("Transcription result:", result);

    // Check for valid transcription result
    if (!result || !result[outputFormat]) {
      throw new Error(`Transcription failed: No ${outputFormat} output`);
    }
    const transcriptionContent = await result[outputFormat].getContent();

    // Clean up the temporary audio file
    await fs.unlink(audioPath);
    console.log("Audio file cleaned up:", audioPath);

    // Delete the original video if specified
    if (deleteVideo) {
      await fs.unlink(videoPath);
      console.log("Video file deleted:", videoPath);
    }

    return transcriptionContent;
  } catch (error) {
    console.error("Error in video transcription:", error);
    // Attempt to clean up temporary files even if an error occurred
    if (audioPath) {
      try {
        await fs.unlink(audioPath);
        console.log("Cleaned up audio file after error:", audioPath);
      } catch (cleanupError) {
        console.error("Error cleaning up audio file:", cleanupError);
      }
    }
    throw error;
  }
}

module.exports = { transcribeVideo };
