// simple server listening for rendering messages in the queue, and spawning headless electron renderer

const { spawn } = require("child_process");
const amqp = require("amqplib/callback_api");

const logger = require("./logger");

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
  electron.on("close", () => callback(null));
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

    channel.consume(RENDER_QUEUE, msg => {
      const renderConfig = JSON.parse(msg.content.toString());

      logger.debug("renderer received message", renderConfig);

      runElectron(msg.content.toString(), error => {
        logger.debug("electron rendering finsished");

        if (error) {
          logger.error(error);
          channel.nack(msg);
        } else {
          const replyMsg = JSON.stringify({
            email: renderConfig.email,
            dir: renderConfig.dir
          });

          logger.debug("renderer replying to server", { msg: replyMsg });

          // if all went ok, notify back that we are done
          channel.sendToQueue(msg.properties.replyTo, Buffer.from(replyMsg), {
            correlationId: msg.properties.correlationId
          });

          channel.ack(msg);
        }
      });
    });
  });
});
