// simple server listening for rendering messages in the queue, and spawning headless electron renderer

const { spawn } = require("child_process");
const amqp = require("amqplib/callback_api");

const runElectron = (renderingConfig, callback) => {
  const electron = spawn(
    "./scripts/xvfb-run",
    [
      "--auto-servernum",
      "--server-args='-screen 0 1280x720x24'",
      "./scripts/run-electron",
      `'${renderingConfig}'` // computers are terrible - block shell from dropping quotes
    ],
    { cwd: __dirname, shell: true }
  );

  electron.stdout.on("data", data => console.log(data.toString()));
  electron.stderr.on("data", data => console.log(data.toString()));

  electron.on("error", error => callback(error));
  electron.on("close", () => callback(null));
};

amqp.connect("amqp://rabbitmq", (err, connection) => {
  if (err) {
    // exit if we can't connect to rabbitmq
    // docker-compose will pick this up and restart
    console.log(err);
    process.exit(1);
  }

  connection.createChannel((err, channel) => {
    channel.assertQueue("renderer", { durable: true });

    channel.consume(
      "renderer",
      msg => {
        console.log("received message, rendering:");
        console.log(JSON.parse(msg.content.toString()));

        runElectron(msg.content.toString(), error => {
          if (!error) {
            channel.ack(msg);
          } else {
            channel.nack(msg);
          }
        });
      },
      { noAck: false }
    );
  });
});
