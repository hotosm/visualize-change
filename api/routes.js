const MBTiles = require("@mapbox/mbtiles");
const crypto = require("crypto");
const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

const RENDER_QUEUE = process.env.RENDER_QUEUE || "render_queue";

const md5 = str =>
  crypto
    .createHash("md5")
    .update(str)
    .digest("hex");

module.exports = ({ channel }) => {
  // TODO: email stuff
  // const transporter = nodemailer.createTransport({})

  // TODO: refactor so we don't use `let` here, api should be probably set up asynchronously?
  let queueRender;

  channel.assertQueue("", { exclusive: true }, (err, { queue }) => {
    channel.consume(queue, msg => {
      console.log("got back msg");
      console.log(msg.properties.correlationId);
      console.log(msg.content.toString());

      // TODO: transporter.sendMail - we know the email to send to, but maybe renderer should return the directory as well?
      // TODO: we also need to host the rendered mp4s, with ngnix?
    });

    queueRender = renderConfig => {
      const msg = JSON.stringify(renderConfig);
      const correlationId = md5(msg);

      console.log({ msg, correlationId });

      channel.sendToQueue(RENDER_QUEUE, Buffer.from(msg), {
        correlationId,
        replyTo: queue
      });
    };
  });

  // main api
  const router = express.Router();
  router.use(express.json());

  // api health check
  router.get("/health-check", (req, res) => {
    res.send("OK");
  });

  // queue rendering
  router.post("/queue-render", (req, res) => {
    console.log(req.body);
    queueRender(req.body);

    res.send("OK");
  });

  // serve tiles
  new MBTiles(path(__dirname, "tiles", "tiles.mbtiles"), (err, mbtiles) => {
    if (err) {
      console.log(err);
      return;
    }

    router.get("/tile/:z/:x/:y", (req, res) => {
      const { z, x, y } = req.params;

      mbtiles.getTile(z, x, y, (err, data, headers) => {
        if (err) {
          console.log(err);
          res.end();
        } else {
          res.writeHead(200, headers);
          res.end(data);
        }
      });
    });
  });

  return router;
};
