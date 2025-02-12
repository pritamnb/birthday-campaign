import * as winston from 'winston';

export default {
  format: winston.format.json(),
  defaultMeta: true,
  default: true,
  transports: [new winston.transports.Console()],
};
