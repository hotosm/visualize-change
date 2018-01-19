const amqp = require("amqplib/callback_api");

amqp.connect("amqp://rabbitmq", (err, conn) => {
  if (err) {
    // exit if we can't connect to rabbitmq
    // docker-compose will pick this up and restart
    console.log(err);
    process.exit(1);
  }

  // TODO: spawn electron on message!
  // conn.createChannel((err, ch) => {
  //   const queue = "test-queue";

  //   ch.assertQueue(queue, { durable: false });

  //   ch.consume(
  //     queue,
  //     msg => {
  //       console.log("Renderer received", msg.content.toString());
  //     },
  //     { noAck: true }
  //   );
  // });
});

// this below works!

// const { spawn } = require("child_process");

// const electron = spawn(
//   "./scripts/xvfb-run",
//   [
//     "--auto-servernum",
//     "--server-args='-screen 0 1280x720x24'",
//     "-e /capture/error.log",
//     "./scripts/run-electron"
//   ],
//   { cwd: __dirname, shell: true }
// );

// electron.stdout.on("data", data => {
//   console.log("stdout", data.toString());
// });

// electron.stderr.on("data", data => {
//   console.log("stderr", data.toString());
// });

// electron.on("error", error => {
//   console.log({ error });
// });

// electron.on("close", close => {
//   console.log({ close });
// });

// console.log("renderer!");
