const express = require("express");
const mongojs = require("mongojs");
const amqp = require("amqplib/callback_api");

const app = express();

// rabbitmq
amqp.connect("amqp://rabbitmq", (err, conn) => {
  if (err) {
    // exit if we can't connect to rabbitmq
    // docker-compose will pick this up and restart
    console.log(err);
    process.exit(1);
  } else {
    console.log("RabbitMQ connected");

    conn.createChannel((err, ch) => {
      if (err) {
        console.log(err);
      } else {
        const queue = "test-queue";

        ch.assertQueue(queue, { durable: false });
        ch.sendToQueue(queue, Buffer.from("Hello World!"));

        console.log("sent message!");
      }
    });
  }
});

// db
const db = mongojs("mongodb://db:27017", ["data", "healthCheck"]);

db.on("error", err => {
  // exit if we can't connect to db
  // docker-compose will pick this up and restart
  console.log("couldn't connect to DB", err);
  process.exit(1);
});

db.on("connect", () => console.log("DB connection works"));

// db health check
db.healthCheck.remove({ works: true }, err => {
  if (err) {
    console.log(err);
  } else {
    db.healthCheck.insert({ works: true, ts: new Date().getTime() }, err => {
      if (err) {
        console.log(err);
      }
    });
  }
});

// api health check
app.get("/health-check", (req, res) => {
  res.send("OK");
});

app.listen(4000, () => console.log("api listening on port 4000"));
