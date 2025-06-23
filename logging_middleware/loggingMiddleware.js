const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "log.txt");

const loggingMiddleware = (req, res, next) => {
  const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;
  fs.appendFileSync(logFile, logMessage);
  next();
};

module.exports = loggingMiddleware;
