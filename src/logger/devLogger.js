const { createLogger, format, transports } = require("winston");
const { printf, combine, timestamp, errors, json } = format;

const logFormat = printf(({ level, stack, timestamp, message }) => {
  return `${timestamp} ${level}: ${stack} ${level}:${message}`;
});

const logger = createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YY/MM/DD HH:mm:ss" }),
    errors({ stack: true }),
    json(),
    logFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "logfile.log" }),
  ],
  exceptionHandlers: [new transports.File({ filename: "exceptions.log" })],
  rejectionHandlers: [new transports.File({ filename: "rejections.log" })],
});

module.exports = logger;
