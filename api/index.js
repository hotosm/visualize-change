const amqp = require("amqplib/callback_api");
const express = require("express");
const mongojs = require("mongojs");
const morgan = require("morgan");
const { parallel } = require("async");

const createRoutes = require("./routes");
const logger = require("./logger");

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
      logger.error(err);
    } else {
      db.healthCheck.insert({ works: true, ts: new Date().getTime() }, err => {
        if (err) {
          logger.error(err);
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
      logger.error(err);
      process.exit(1);
    }

    const app = express();

    app.use(morgan("combined"));

    createRoutes(results, routes => app.use("/", routes));

    app.listen(4000, () => logger.info("api listening on port 4000"));
  }
);
