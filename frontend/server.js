const express = require("express");
const path = require("path");
const port = process.env.PORT || 3000;
const app = express();

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (request, response) => {
  response.sendFile(path.resolve(__dirname, "dist", "index.html"));
});

app.listen(port);

console.log("Server started on port: " + port);
