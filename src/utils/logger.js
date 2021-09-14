const winston = require('winston');

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf((info) => {
    if (info.data) {
      return `${info.timestamp} [${info.level}] ${info.message}\n${info.data}`;
    }

    return `${info.timestamp} [${info.level}] ${info.message}`;
  }),
);

const transports = [
  new winston.transports.Console({
    format: consoleFormat,
    handleExceptions: true,
  }),
];

const logger = winston.createLogger({
  level: 'info',
  transports,
  exitOnError: false,
});

const error = (context, message, scope, data) => {
  const obj = {
    context,
    message,
    scope,
    data,
  };
  logger.error(JSON.stringify(obj));
};

const warn = (context, message, scope, data) => {
  const obj = {
    context,
    message,
    scope,
    data,
  };
  logger.warn(JSON.stringify(obj));
};

const info = (context, message, scope, data) => {
  const obj = {
    context,
    message,
    scope,
    data,
  };
  logger.info(JSON.stringify(obj));
};

module.exports = {
  error,
  warn,
  info,
};
