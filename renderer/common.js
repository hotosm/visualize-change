const path = require("path");
const getCaptureDir = dir => path.join(process.env.CAPTURE_DIR || "/data/capture", dir);

module.exports = {
  RENDERING_DONE: "RENDERING_DONE",
  RENDERING_SHOT: "RENDERING_SHOT",
  RENDERER_TIMEOUT: 10 * 60 * 1000,
  FINISHED_FLAG_FILENAME: ".finished",
  getCaptureDir
};
