// const nodemailer = require("nodemailer");
const MBTiles = require("@mapbox/mbtiles");
const crypto = require("crypto");
const express = require("express");
const path = require("path");

const logger = require("./logger");

const RENDER_QUEUE = process.env.RENDER_QUEUE || "render_queue";

const md5 = str =>
  crypto
    .createHash("md5")
    .update(str)
    .digest("hex");

const initRoutes = ({ queueRender }, callback) => {
  // main api
  const router = express.Router();
  router.use(express.json());

  // api health check
  router.get("/health-check", (req, res) => {
    res.send("OK");
  });

  // queue rendering
  router.post("/queue-render", (req, res) => {
    logger.debug("queue renderer req body", req.body);
    queueRender(req.body);

    res.send("OK");
  });

  // serve tiles
  new MBTiles(
    path.join(__dirname, "tiles", "tiles.mbtiles"),
    (err, mbtiles) => {
      if (err) {
        logger.error(err);
        return;
      }

      router.get("/tile/:z/:x/:y", (req, res) => {
        const { z, x, y } = req.params;

        mbtiles.getTile(z, x, y, (err, data, headers) => {
          if (err) {
            logger.error(err);
            res.end();
          } else {
            res.writeHead(200, headers);
            res.end(data);
          }
        });
      });
    }
  );

  callback(router);
};

module.exports = ({ channel }, callback) => {
  // TODO: email stuff
  // const transporter = nodemailer.createTransport({})

  channel.assertQueue("", { exclusive: true }, (err, { queue }) => {
    channel.consume(queue, msg => {
      logger.debug("channel consumed msg", {
        properties: msg.properties,
        content: msg.content.toString()
      });

      // TODO: transporter.sendMail - we know the email to send to,
      // but maybe renderer should return the directory as well?
      // TODO: we also need to host the rendered mp4s, with ngnix?
    });

    const queueRender = renderConfig => {
      const msg = JSON.stringify(renderConfig);
      const correlationId = md5(msg);

      logger.debug("sending msg to renderer", {
        renderConfig,
        correlationId
      });

      channel.sendToQueue(RENDER_QUEUE, Buffer.from(msg), {
        correlationId,
        replyTo: queue
      });
    };

    initRoutes({ queueRender }, callback);
  });
};
