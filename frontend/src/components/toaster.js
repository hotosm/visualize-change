const { Position, Toaster } = require("@blueprintjs/core");

const AppToaster = Toaster.create({
  className: "recipe-toaster",
  position: Position.TOP
});

module.exports = AppToaster;
