import winston from "winston";
import "winston-daily-rotate-file";
import "./transports/mongodb";
import path from "path";
import config from "@lib/config";
import graylogHttp from "./transports/graylog_http";
import mongoTransport from "./transports/mongodb";
// import GelfTransport from "winston-gelf";
// import WinstonGraylog2 from "winston-graylog2";
import util from "util";
const { combine, timestamp, label, printf } = winston.format;
import ip from "ip";
import Queue from "@lib/queue";

const logPath = path.resolve(
  __dirname,
  config.log.folder === "internal" ? "../../../logs" : "../../../../logs"
);
const logPathCombined = path.resolve(logPath, "combined");
const logPathError = path.resolve(logPath, "error");
const logPathFile = path.resolve(logPathCombined, "combined-%DATE%.log");
const logPathErrorFile = path.resolve(logPathError, "error-%DATE%.log");
const auditFile = path.resolve(logPath, "audit");

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3
};

const colors = {
  error: "white redBG",
  warn: "white magentaBG",
  info: "white greenBG",
  http: "white cyanBG"
};
winston.addColors(colors);

const myFormat = printf(({ level, message, timestamp }) => {
  let output = `\t${timestamp} ${level} ${message.message}`;

  if (message.stack) output += `\n ${message.stack}`;
  if (message.details)
    output += `:\n${JSON.stringify(message.details, null, 2)}`;
  return output;
});

const transports = [
  new winston.transports.Console({
    level: config.log.consoleLogLevel || "http",
    format: winston.format.combine(
      timestamp(),
      winston.format.colorize(),
      winston.format.simple(),
      myFormat
    )
  })
];
if (config.log.transports) {
  if (config.log.transports.file)
    transports.push(
      new winston.transports.DailyRotateFile({
        filename: logPathFile,
        level: "http",
        format: combine(timestamp(), winston.format.prettyPrint()),
        auditFile,
        datePattern: "YYYY-MM-DD",
        maxSize: config.log.fileMaxSize,
        maxFiles: config.log.storagePeriod
      }),
      new winston.transports.DailyRotateFile({
        filename: logPathErrorFile,
        level: "error",
        format: combine(timestamp(), winston.format.prettyPrint()),
        auditFile,
        datePattern: "YYYY-MM-DD",
        maxSize: config.log.fileMaxSize,
        maxFiles: config.log.storagePeriod
      })
    );

  if (config.log.transports.graylog) transports.push(new graylogHttp());
  if (config.log.transports.mongo)
    transports.push(new mongoTransport({ level: "http" }));
}

const logger = winston.createLogger({ transports, levels, level: "info" });

export const write = function(message) {
  if (!message) throw "Log message object is missing";
  if (typeof message !== "object") throw "Message should be of object type";
  const level = message.level || "info";
  if (!Object.keys(levels).includes(level))
    throw `Unaccessible log level: ${level}`;
  logger.log({
    level,
    message
  });
};

export const log = async function(message, args, options) {
  const data = {
    app: "Repogen",
    env: process.env.NODE_ENV,
    message,
    level: "info",
    server_ip: ip.address(),
    timestamp: new Date()
  };

  if (args) {
    if (args[1]) data.realm = args[1];
    if (args[2]) data.profile = args[2];
    if (args[4]) {
      if (args[4].service) data.process = args[4].service;
      if (args[4].method) data.method = args[4].method;
    }
  }

  if (options) {
    if (options.level) data.level = options.level;
    if (options.details) data.details = options.details;
    if (options.stack) data.stack = options.stack;
    if (options.process) data.process = options.process;
    if (options.realm) data.realm = options.realm;
    if (options.profile) data.profile = options.profile;
    if (options.method) data.method = options.method;
  }

  write(data);
  Queue.publish("alarm", data);
};

export const capture = function() {
  console.log = function() {
    return main(arguments, "info");
  };
  console.error = function() {
    return main(arguments, "error");
  };
  console.warn = function() {
    return main(arguments, "warn");
  };
  function main(args, level) {
    const values = Object.entries(args).map((i) => i[1]);
    const strings = values.filter((v) => typeof v !== "object").join(", ");
    const details = [];
    values
      .filter((v) => typeof v === "object")
      .forEach((obj) => {
        details.push(obj);
      });
    const data = {
      level,
      process: process.env.npm_package_name
    };
    if (details.length) data.details = details;
    log(strings, null, data);
  }
};
