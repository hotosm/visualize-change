const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const leftPad = require("left-pad");
const ffmpeg = require("fluent-ffmpeg");

// this is shared via docker volume
const CAPTURE_DIR = "/data/capture";

const width = 1280;
const height = 720;

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
  mainWindow = new BrowserWindow({ show: false });

  mainWindow.setContentSize(width, height);
  mainWindow.setResizable(false);
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  mainWindow.on("closed", () => (mainWindow = null));
});

ipcMain.on("SHOT", (event, arg) => {
  mainWindow.webContents.capturePage(image => {
    fs.writeFileSync(
      `${CAPTURE_DIR}/${leftPad(arg, 4, "0")}.png`,
      image.toPNG()
    );
    event.returnValue = true;
  });
});

ipcMain.on("DONE", () => {
  convertToVideo(() => app.quit());
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

console.log("electron!");
