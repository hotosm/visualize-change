const MBTiles = require("@mapbox/mbtiles");
const express = require("express");

const router = express.Router();

module.exports = ({ channel }) => {
  // setup renderer queue - durable channel should handle renderer crashing, and re-render when it's up again
  // renderer should have { noAck: false } and channel.ack(msg) when done rendering
  channel.assertQueue("renderer", { durable: true });
  const queueRender = msg =>
    channel.sendToQueue("renderer", Buffer.from(JSON.stringify(msg)));

  // main api
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
  new MBTiles("./tiles/tiles.mbtiles", (err, mbtiles) => {
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
