import { config } from 'dotenv';
import { IConfig } from './IConfig';

config();

export const configurations: IConfig = Object.freeze({
  env: process.env.NODE_ENV,
  mongo: process.env.MONGO_URI,
  port: process.env.PORT,
  SECRET_KEY: process.env.SECRET_KEY
}) as IConfig;

export default configurations;
