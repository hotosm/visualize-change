const MBTiles = require("@mapbox/mbtiles");
const crypto = require("crypto");
const express = require("express");
const j = require("joi");
const mailgunTransport = require("nodemailer-mailgun-transport");
const nodemailer = require("nodemailer");

const logger = require("./logger");

const RENDER_QUEUE = process.env.RENDER_QUEUE || "render_queue";
const SERVER_DOMAIN = process.env.SERVER_DOMAIN || "http://localhost:8080";
const EXPORTS_TABLE_NAME = "exports";

const MAP_CONFIG_SCHEMA = j.object().keys({
  lng: j
    .number()
    .min(-180)
    .max(180),
  lat: j
    .number()
    .min(-90)
    .max(90),
  zoom: j
    .number()
    .min(0)
    .max(18),
  startDate: j.number(), // timestamp
  endDate: j.number(), // timestamp
  interval: j.string().valid("hours", "days", "weeks"),
  style: j.object() // TODO: Need to add better validation for this
});

const RENDER_CONFIG_SCHEMA = j.object().keys({
  map: MAP_CONFIG_SCHEMA,
  dir: j.string(),
  format: j.string().valid("video", "gif"),
  fps: j
    .number()
    .min(1)
    .max(120),
  speed: j
    .number()
    .min(0.25)
    .max(2.0),
  size: j.string(),
  email: j.string().email()
});

const md5 = str =>
  crypto
    .createHash("md5")
    .update(str)
    .digest("hex");

const mapConfigFromReq = req => ({
  lat: req.body.lat,
  lng: req.body.lng,
  zoom: req.body.zoom,
  startDate: req.body.startDate,
  endDate: req.body.endDate,
  interval: req.body.interval,
  style: req.body.style
});

const initRoutes = ({ queueRender, exportsAdd, exportsGetById, exportsUpdate }, callback) => {
  // main api
  const router = express.Router();
  router.use(express.json());

  // api health check
  router.get("/health-check", (req, res) => {
    res.send("OK");
  });

  router.get("/exports/:id", (req, res) => {
    exportsGetById(req.params.id, item => res.send(item));
  });

  router.post("/exports", (req, res) => {
    exportsAdd(req.body, id => {
      res.json(id);
    });
  });

  router.patch("/exports/:id", (req, res) => {
    exportsUpdate(req.params.id, req.body, item => res.send(item));
  });

  router.post("/queue-render", (req, res) => {
    // this is more wordy than just passing `req.body` to `queueRender` but
    // allows us to validate, and see the keys clearly
    const mapConfig = mapConfigFromReq(req);
    const renderConfig = {
      email: req.body.email,
      map: mapConfig,
      format: req.body.format,
      fps: req.body.fps,
      speed: req.body.speed,
      size: req.body.size,
      dir: md5(
        JSON.stringify({
          mapConfig,
          email: req.body.email
        })
      )
    };

    j.validate(renderConfig, RENDER_CONFIG_SCHEMA, err => {
      if (err) {
        logger.error("queue render error", { err: err.toString() });
        res.status(400).send(err.toString());
      } else {
        logger.debug("queue render", { renderConfig });
        queueRender(renderConfig);
        res.send("OK");
      }
    });
  });

  // serve tiles
  new MBTiles("/data/tiles/tiles.mbtiles", (err, mbtiles) => {
    if (err) {
      logger.error(err);
      return;
    }

    router.get("/tile/:z/:x/:y", (req, res) => {
      const { z, x, y } = req.params;

      logger.info("tile", { z, x, y });

      mbtiles.getTile(z, x, y, (err, data, headers) => {
        if (err) {
          logger.error(err);
          res.status(404);
        } else {
          res.writeHead(200, headers);
          res.end(data);
        }
      });
    });
  });

  callback(router);
};

module.exports = ({ channel, db }, callback) => {
  const nodemailerMailgun = nodemailer.createTransport(
    mailgunTransport({
      auth: {
        ["api_key"]: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN
      }
    })
  );

  channel.assertQueue("", { exclusive: true }, (err, { queue }) => {
    channel.consume(queue, msg => {
      const replyContent = JSON.parse(msg.content.toString());

      logger.debug("channel consumed msg", {
        properties: msg.properties,
        replyContent
      });

      nodemailerMailgun.sendMail(
        {
          from: process.env.MAILGUN_FROM,
          to: replyContent.email,
          subject: "HOT Mapping Vis Render",
          text: `
            Hi,

            your render is ready at:

            ${SERVER_DOMAIN}/renders/${replyContent.dir}/render.mp4

            Cheers!
          `
        },
        (err, res) => {
          if (err) {
            logger.error("mail", { err });
          } else {
            logger.debug("mail", { res });
          }
        }
      );

      // TODO: store replyContent.dir in DB, and cleanup after N days
    });

    const queueRender = renderConfig => {
      // correlationId is now dir, which should be uniqe based on map config and email
      const correlationId = renderConfig.dir;
      const msg = JSON.stringify(renderConfig);

      logger.debug("sending msg to renderer", {
        renderConfig,
        correlationId
      });

      channel.sendToQueue(RENDER_QUEUE, Buffer.from(msg), {
        correlationId,
        replyTo: queue
      });
    };

    // FIXME: .catch()
    const exportsGetById = (id, respond) => {
      db(EXPORTS_TABLE_NAME)
        .select()
        .where({ id })
        .then(respond);
    };

    // FIXME: .catch()
    const exportsAdd = ({ parentId, config }, respond) => {
      db(EXPORTS_TABLE_NAME)
        .insert({ ["parent_id"]: parentId, config: JSON.stringify(config) })
        .returning("id")
        .then(respond);
    };

    // FIXME: .catch()
    const exportsUpdate = (id, body, respond) => {
      db(EXPORTS_TABLE_NAME)
        .update({ config: body })
        .where({ id })
        .returning("*")
        .then(respond);
    };

    initRoutes({ queueRender, exportsAdd, exportsGetById, exportsUpdate }, callback);
  });
};
