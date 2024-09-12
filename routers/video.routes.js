// videoRoutes.js
const multer = require("multer");
const path = require("path");
const videoController = require("../controllers/video.controller");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

module.exports = (app) => {
  app.post(
    "/api/videos/upload",
    upload.single("video"),
    videoController.uploadVideo
  );
  app.get("/api/videos/:id", videoController.getUserVideos);

  app.get("/api/videos/status/:id", videoController.getVideoStatus);
};
