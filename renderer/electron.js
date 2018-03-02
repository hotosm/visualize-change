const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const leftPad = require("left-pad");
const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");

const logger = require("./logger");
const { RENDERING_SHOT, RENDERING_DONE } = require("./common");

if (!process.argv[2]) {
  logger.info("pass stringified JSON data for rendering");
  process.exit(1);
}

let renderingConfig;

try {
  renderingConfig = JSON.parse(process.argv[2]);
} catch (err) {
  logger.error(err);
  process.exit(1);
}

// TODO: get that from renderingConfig
const width = 1280;
const height = 720;

// "/data/capture" is docker volume, env.captureDir allows us to test outside of docker
const captureDir = path.join(process.env.CAPTURE_DIR || "/data/capture", renderingConfig.dir);

if (!fs.existsSync(captureDir)) {
  fs.mkdirSync(captureDir);
}

const FORMATS = {
  video: "mp4",
  gif: "gif"
};

const convertToVideo = callback => {
  const outputFile = path.join(captureDir, `render.${FORMATS[renderingConfig.format]}`);
  const imageFiles = path.join(captureDir, "%04d.png");

  // in the future just return if we already have that rendered?
  try {
    fs.unlinkSync(outputFile);
  } catch (e) {}

  const command = ffmpeg(imageFiles)
    .inputFPS(10) // TODO: fps?
    .fps(10) // TODO: fps?
    .format(FORMATS[renderingConfig.format])
    .size(`${width}x${height}`);

  if (renderingConfig.format === FORMATS.video) {
    command
      .noAudio()
      .videoCodec("libx264")
      .outputOptions(["-pix_fmt yuv420p", "-preset veryslow", "-tune stillimage", "-crf 24"]);
  }

  command
    .on("error", err => {
      console.log("ffmpeg error", err);
    })
    .on("end", () => callback())
    .save(outputFile);
};

let mainWindow;

app.on("ready", () => {
  // hide window if we are not debugging
  const show = process.env.LOCAL_DEBUG ? true : false;
  mainWindow = new BrowserWindow({ show });

  mainWindow.setContentSize(width, height);
  mainWindow.setResizable(false);
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // share renderer config with window (https://github.com/electron/electron/issues/1095#issuecomment-300767465)
  mainWindow.mapConfig = renderingConfig.map;

  // open dev tools only in debug mode
  if (process.env.LOCAL_DEBUG) {
    mainWindow.openDevTools();
  }

  mainWindow.on("closed", () => (mainWindow = null));
});

ipcMain.on(RENDERING_SHOT, (event, arg) => {
  mainWindow.webContents.capturePage(image => {
    const imgPath = path.join(captureDir, `${leftPad(arg, 4, "0")}.png`);
    fs.writeFileSync(imgPath, image.toPNG());

    // we need return value because we do this synchronously
    event.returnValue = true;
  });
});

ipcMain.on(RENDERING_DONE, () => {
  convertToVideo(() => {
    logger.debug("rendering finished");

    if (!process.env.LOCAL_DEBUG) {
      app.quit();
    }
  });
});

app.on("window-all-closed", () => {
  app.quit();
});
