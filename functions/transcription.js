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

    // Transcribe audio using node-whisper
    const result = await whisper(audioPath, {
      language,
      device,
      model,
      output_format: outputFormat,
    });
    // Check for valid transcription result
    if (!result || !result[outputFormat]) {
      throw new Error(`Transcription failed: No ${outputFormat} output`);
    }
    const transcriptionContent = await result[outputFormat].getContent();

    // Clean up the temporary audio file
    await fs.unlink(audioPath);

    // Delete the original video if specified
    if (deleteVideo) {
      await fs.unlink(videoPath);
    }

    return transcriptionContent;
  } catch (error) {
    // Attempt to clean up temporary files even if an error occurred
    if (audioPath) {
      try {
        await fs.unlink(audioPath);
      } catch (cleanupError) {}
    }
    throw error;
  }
}

module.exports = { transcribeVideo };
