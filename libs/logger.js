import winston from 'winston';
require('winston-daily-rotate-file');

const transport = new winston.transports.DailyRotateFile({
  filename: './debug',
  datePattern: 'yyyy-MM-dd.',
  prepend: true,
  level: process.env.ENV === 'development' ? 'debug' : 'info'
});
const logger = new (winston.Logger)({
  transports: [
    transport,
    new (winston.transports.Console)(),
  ]
});

export default logger;