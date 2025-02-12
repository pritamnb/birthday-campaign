import { format, transports } from 'winston';

export const levels = {
  INFO: 'info',
  DEBUG: 'debug',
  ERROR: 'error',
};

export const loggerConfig = {
  format: format.json(),
  defaultMeta: true,
  default: true,
  transports: [new transports.Console()],
};