const { createLogger, format, transports } = require("winston");

module.exports = createLogger({
  level: "silly", // dev only
  transports: [
    new transports.Console({
      format: format.combine(format.colorize({ all: true }), format.simple())
    })
  ]
});
