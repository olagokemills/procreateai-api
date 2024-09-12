// videoQueue.js
const Queue = require("bull");
const Redis = require("ioredis");
const videoProcessing = require("./video-processing");

require("dotenv").config();

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  enableReadyCheck: false, // Disable ready check
  maxRetriesPerRequest: null,
});

// Separate Redis clients for the Queue, as Bull/BullMQ requires different Redis clients for different roles
const videoQueue = new Queue("video transcoding", {
  createClient: function (type) {
    switch (type) {
      case "client":
        return redisClient; // Reuse the general Redis client for normal operations
      case "subscriber":
        return new Redis({
          // Separate Redis client for subscriber mode
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT,
          password: process.env.REDIS_PASSWORD,
          enableReadyCheck: false,
          maxRetriesPerRequest: null,
        });
      case "bclient":
        return new Redis({
          // Another Redis client for blocking commands (like BRPOP)
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT,
          password: process.env.REDIS_PASSWORD,
          enableReadyCheck: false,
          maxRetriesPerRequest: null,
        });
      default:
        return redisClient; // Fallback to the general Redis client
    }
  },
});

videoQueue.process(async (job) => {
  console.log("Processing video from line 47s", job.data);
  const { videoId } = job.data;
  await videoProcessing.process(videoId);
});

module.exports = {
  addVideo: (videoId) => {
    return videoQueue.add({ videoId });
  },
};
