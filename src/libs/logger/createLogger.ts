import * as winston from 'winston';

export class Create {

  public createLogInstance = (loggerConfig) => {
    return winston.createLogger(loggerConfig);
  };
}

export default new Create();