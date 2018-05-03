// simple server listening for rendering messages in the queue, and spawning headless electron renderer

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const amqp = require("amqplib/callback_api");

const logger = require("./logger");
const { getCaptureDir, FINISHED_FLAG_FILENAME } = require("./common");

const RENDER_QUEUE = process.env.RENDER_QUEUE || "render_queue";

const runElectron = (renderingConfig, callback) => {
  const electron = spawn(
    "./scripts/xvfb-run",
    [
      "--auto-servernum",
      "--server-args='-screen 0 1280x720x24'",
      "./scripts/run-electron",
      `'${renderingConfig}'` // computers are terrible - block shell from dropping quotes
    ],
    { cwd: __dirname, shell: true, env: process.env }
  );

  electron.stdout.on("data", data => logger.info(`electron process: ${data.toString()}`));
  electron.stderr.on("data", data => logger.error(`electron process: ${data.toString()}`));

  electron.on("error", error => callback(error));
  electron.on("close", code => callback(code === 0 ? null : `exited with ${code}`));
};

amqp.connect("amqp://rabbitmq", (err, connection) => {
  if (err) {
    // exit if we can't connect to rabbitmq
    // docker-compose will pick this up and restart
    logger.error(err);
    process.exit(1);
  }

  connection.createChannel((err, channel) => {
    channel.assertQueue(RENDER_QUEUE, { durable: true });
    channel.prefetch(1);

    channel.consume(RENDER_QUEUE, msg => {
      const renderConfig = JSON.parse(msg.content.toString());
      const captureDir = getCaptureDir(renderConfig.dir);
      const finishedFile = path.join(captureDir, FINISHED_FLAG_FILENAME);

      const successRender = () => {
        const replyMsg = JSON.stringify({
          email: renderConfig.email,
          dir: renderConfig.dir,
          format: renderConfig.format
        });

        logger.debug("renderer replying to server", { msg: replyMsg });

        channel.sendToQueue(msg.properties.replyTo, Buffer.from(replyMsg), {
          correlationId: msg.properties.correlationId
        });

        channel.ack(msg);
      };

      logger.debug("renderer received message", renderConfig);

      if (fs.existsSync(finishedFile)) {
        logger.debug("this config was previously rendered");
        successRender();
      } else {
        runElectron(msg.content.toString(), error => {
          logger.debug("electron rendering finsished");

          if (error) {
            logger.error(error);
            channel.nack(msg);
          } else {
            fs.writeFileSync(finishedFile);
            successRender();
          }
        });
      }
    });
  });
});
