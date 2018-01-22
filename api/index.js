const express = require("express");
const mongojs = require("mongojs");
const amqp = require("amqplib/callback_api");
const { parallel } = require("async");

const createRoutes = require("./routes");

const app = express();

const createRabbitMQ = callback => {
  amqp.connect("amqp://rabbitmq", (err, connection) => {
    if (err) {
      callback(err);
    }

    connection.createChannel((err, channel) => {
      if (err) {
        callback(err);
      } else {
        callback(null, channel);
      }
    });
  });
};

const createDB = callback => {
  const db = mongojs("mongodb://db:27017", ["data", "healthCheck"]);

  db.on("error", err => {
    callback(err);
  });

  // FIXME: connect doesn't trigger when DB is opened?
  // db.on("connect", () => {
  //   console.log("connected");
  // });

  db.healthCheck.remove({ works: true }, err => {
    if (err) {
      console.log(err);
    } else {
      db.healthCheck.insert({ works: true, ts: new Date().getTime() }, err => {
        if (err) {
          console.log(err);
        } else {
          callback(null, db);
        }
      });
    }
  });
};

parallel(
  {
    db: createDB,
    channel: createRabbitMQ
  },
  (err, results) => {
    if (err) {
      // exit if we can't connect to db or rabbit
      // docker-compose will pick this up and restart
      console.log(err);
      process.exit(1);
    }

    app.use("/", createRoutes(results));

    app.listen(4000, () => console.log("api listening on port 4000"));
  }
);
