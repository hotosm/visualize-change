const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const leftPad = require("left-pad");
const ffmpeg = require("fluent-ffmpeg");

const capturePath = `${__dirname}/capture/%04d.png`;

const width = 1280;
const height = 720;

const convertToVideo = callback => {
  try {
    fs.unlinkSync(`${__dirname}/capture/out.mp4`);
  } catch (e) {}

  ffmpeg(capturePath)
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
    .save(`${__dirname}/capture/out.mp4`);
};

let mainWindow;

app.on("ready", () => {
  mainWindow = new BrowserWindow();

  mainWindow.setContentSize(width, height);
  mainWindow.setResizable(false);
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => (mainWindow = null));
});

ipcMain.on("SHOT", (event, arg) => {
  mainWindow.webContents.capturePage(image => {
    fs.writeFileSync(`./capture/${leftPad(arg, 4, "0")}.png`, image.toPNG());
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
