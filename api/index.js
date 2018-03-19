const amqp = require("amqplib/callback_api");
const express = require("express");
const knex = require("knex");
const morgan = require("morgan");
const cookieSession = require("cookie-session");
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
  const connection = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@db:5432/postgres`;

  const db = knex({
    client: "pg",
    connection
  });

  // test connection and callback if ok
  db
    .raw("select 1 + 1 as result")
    .then(() => callback(null, db))
    .catch(e => callback(e));
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

    // app.use(morgan("combined"));

    app.set("trust proxy", 1);
    // app.set("trust proxy", 2);

    app.use(
      cookieSession({
        name: "hot-session",
        secret: "abcefdjahjkfahdiowkhvjgioyfhjvughcjyiughvgiyhjvoiupghjvguy9uihvgiuyu9icgy80ugch",
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      })
    );

    createRoutes(results, routes => app.use("/", routes));

    app.listen(4000, () => logger.info("api listening on port 4000"));
  }
);
