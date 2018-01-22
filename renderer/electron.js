const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const leftPad = require("left-pad");
const ffmpeg = require("fluent-ffmpeg");

const { RENDERING_SHOT, RENDERING_DONE } = require("./common");

// "/data/capture" is docker volume, env allows us to test outside of docker
const CAPTURE_DIR = process.env.CAPTURE_DIR || "/data/capture";

const width = 1280;
const height = 720;

if (!process.argv[2]) {
  console.log("pass stringified JSON data for rendering!");
  process.exit(1);
}

let renderingConfig;

try {
  renderingConfig = JSON.parse(process.argv[2]);
} catch (e) {
  console.log(e);
  process.exit(1);
}

const convertToVideo = callback => {
  try {
    fs.unlinkSync(`${CAPTURE_DIR}/out.mp4`);
  } catch (e) {}

  ffmpeg(`${CAPTURE_DIR}/%04d.png`)
    .inputFPS(10) // TODO: ?
    .fps(10)
    .format("mp4")
    .noAudio()
    .videoCodec("libx264")
    .outputOptions([
      "-pix_fmt yuv420p",
      "-preset veryslow",
      "-tune stillimage",
      "-crf 0"
    ])
    .size(`${width}x${height}`)
    .on("error", err => {
      console.log("ffmpeg error", err.message);
    })
    .on("end", () => callback())
    .save(`${CAPTURE_DIR}/out.mp4`);
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
  mainWindow.renderingConfig = renderingConfig;

  // open dev tools only in debug mode
  if (process.env.LOCAL_DEBUG) {
    mainWindow.openDevTools();
  }

  mainWindow.on("closed", () => (mainWindow = null));
});

ipcMain.on(RENDERING_SHOT, (event, arg) => {
  mainWindow.webContents.capturePage(image => {
    fs.writeFileSync(
      `${CAPTURE_DIR}/${leftPad(arg, 4, "0")}.png`,
      image.toPNG()
    );
    event.returnValue = true;
  });
});

ipcMain.on(RENDERING_DONE, () => {
  convertToVideo(() => {
    console.log("rendering done");

    if (!process.env.LOCAL_DEBUG) {
      console.log("exiting...");
      app.quit();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
