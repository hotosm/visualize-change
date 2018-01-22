const { spawn } = require("child_process");
const amqp = require("amqplib/callback_api");

amqp.connect("amqp://rabbitmq", (err, connection) => {
  if (err) {
    // exit if we can't connect to rabbitmq
    // docker-compose will pick this up and restart
    console.log(err);
    process.exit(1);
  }

  connection.createChannel((err, channel) => {
    // TODO: should we keep queue names in ENV? - typo can lead to problems
    channel.assertQueue("renderer", { durable: true });

    channel.consume(
      "renderer",
      msg => {
        console.log("received message");
        console.log(JSON.parse(msg.content.toString()));

        setTimeout(() => {
          console.log("sending ACK");
          channel.ack(msg);
        }, 1000);
      },
      { noAck: false }
    );
  });
});

// the code below works
const runElectron = () => {
  const electron = spawn(
    "./scripts/xvfb-run",
    [
      "--auto-servernum",
      "--server-args='-screen 0 1280x720x24'",
      "-e /capture/error.log",
      "./scripts/run-electron"
    ],
    { cwd: __dirname, shell: true }
  );

  electron.stdout.on("data", data => {
    console.log("stdout", data.toString());
  });

  electron.stderr.on("data", data => {
    console.log("stderr", data.toString());
  });

  electron.on("error", error => {
    console.log({ error });
  });

  electron.on("close", close => {
    console.log({ close });
  });
};
