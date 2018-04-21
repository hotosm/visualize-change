const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const leftPad = require("left-pad");
const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");

const logger = require("./logger");
const { getCaptureDir, RENDERING_SHOT, RENDERING_DONE, RENDERER_TIMEOUT } = require("./common");

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

const captureDir = getCaptureDir(renderingConfig.dir);

if (!fs.existsSync(captureDir)) {
  fs.mkdirSync(captureDir);
}

const FORMATS = {
  mp4: "mp4",
  gif: "gif"
};

const [width, height] = renderingConfig.size.split("x").map(d => parseInt(d));

const convertToVideo = callback => {
  const outputFile = path.join(captureDir, `render.${FORMATS[renderingConfig.format]}`);
  const imageFiles = path.join(captureDir, "%04d.png");

  // in the future just return if we already have that rendered?
  try {
    fs.unlinkSync(outputFile);
  } catch (e) {}

  const command = ffmpeg(imageFiles)
    .inputFPS(renderingConfig.speed)
    .fps(1)
    .format(FORMATS[renderingConfig.format])
    .size(`${width}x${height}`);

  if (renderingConfig.format === FORMATS.mp4) {
    command
      .noAudio()
      .videoCodec("libx264")
      .outputOptions(["-pix_fmt yuv420p", "-preset veryslow", "-tune stillimage", "-crf 20"]);
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

let lastShotTime = Date.now();

ipcMain.on(RENDERING_SHOT, (event, arg) => {
  mainWindow.webContents.capturePage(image => {
    const imgPath = path.join(captureDir, `${leftPad(arg, 4, "0")}.png`);
    fs.writeFileSync(imgPath, image.toPNG());

    // update last show time
    lastShotTime = Date.now();

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

setInterval(() => {
  const time = Date.now() - lastShotTime;

  if (time > RENDERER_TIMEOUT) {
    logger.error("renderer timeouted, exiting...");
    process.exit(1);
  }
}, 1000);

app.on("window-all-closed", () => {
  app.quit();
});
