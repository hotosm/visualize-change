const express = require("express");
const morgan = require("morgan");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.use(morgan("combined"));
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (request, response) => {
  response.sendFile(path.resolve(__dirname, "dist", "index.html"));
});

app.listen(port);

console.log("Server started on port: " + port);
