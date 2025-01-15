const Queue = require("bull");
const Redis = require("ioredis");
const videoProcessing = require("./video-processing");

require("dotenv").config();

const redisConfig = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
};

const createRedisClient = () => new Redis(redisConfig);

const videoQueue = new Queue("video transcoding", {
  createClient: (type) => {
    switch (type) {
      case "client":
      case "subscriber":
      case "bclient":
        return createRedisClient();
      default:
        return createRedisClient();
    }
  },
});

const transcriptionQueue = new Queue("video transcription", {
  createClient: createRedisClient,
});
const socialMediaQueue = new Queue("social media generation", {
  createClient: createRedisClient,
});

videoQueue.process(async (job) => {
  await transcriptionQueue.add({ videoId: job.data.videoId });
});

transcriptionQueue.process(async (job) => {
  await videoProcessing.transcribe(job.data.videoId);
  await socialMediaQueue.add({ videoId: job.data.videoId });
});

socialMediaQueue.process(async (job) => {
  await videoProcessing.generateSocialMedia(job.data.videoId);
});

[videoQueue, transcriptionQueue, socialMediaQueue].forEach((queue) => {
  queue.on("completed", (job) => {});

  queue.on("failed", (job, err) => {});
});

module.exports = {
  addVideo: (videoId) => {
    return videoQueue.add({ videoId });
  },
};
