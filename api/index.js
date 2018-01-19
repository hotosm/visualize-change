const express = require("express");
const mongojs = require("mongojs");

const app = express();
const db = mongojs("mongodb://db:27017", ["data", "healthCheck"]);

db.on("error", () => console.log("couldn't connect to DB"));
db.on("connect", () => console.log("DB connection works"));

// db health check
db.healthCheck.remove({ works: true }, err => {
  if (err) {
    console.log(err);
  } else {
    db.healthCheck.insert(
      { works: true, ts: new Date().getTime() },
      err => {
        if (err) {
          console.log(err);
        }
      }
    );
  }
});

// api health check
app.get("/health-check", (req, res) => {
  res.send("OK");
});

app.listen(4000, () => console.log("api listening on port 4000"));
