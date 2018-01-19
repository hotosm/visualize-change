// TODO: react to rabbitmq and spawn electron
// TODO: run electron with xvfb: `xvfb-run -a --server-args='-screen 0, 1280x800x24' electron electron.js`

const amqp = require("amqplib/callback_api");

amqp.connect("amqp://rabbitmq", (err, conn) => {
  if (err) {
    // exit if we can't connect to rabbitmq
    // docker-compose will pick this up and restart
    console.log(err);
    process.exit(1);
  }

  conn.createChannel((err, ch) => {
    const queue = "test-queue";

    ch.assertQueue(queue, { durable: false });

    ch.consume(
      queue,
      msg => {
        console.log("Renderer received", msg.content.toString());
      },
      { noAck: true }
    );
  });
});

// const fs = require("fs");
// fs.writeFileSync("/capture/test", "test", "utf8");
