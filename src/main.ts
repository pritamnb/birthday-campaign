import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createLogger, enableLoggerInstance, enableDebugger } from './libs/logger';
import loggerConfig from './config/loggerConfig';
import configurations from './config/configuration';
import { config } from './libs/documentation/swaggerConfig';
import { SwaggerModule } from '@nestjs/swagger';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   app.useGlobalPipes(new ValidationPipe());
//   await app.listen(process.env.PORT ?? 3000);
// }
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const logInstance = createLogger.createLogInstance(loggerConfig);
  app.use(
    enableLoggerInstance(logInstance, [
      { location: 'headers', key: 'x-trace-id' },
    ]),
  );
  enableDebugger(app, logInstance);

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(configurations.port, () => {
    console.info(`Server started on ${configurations.port} port`);
  });
}
bootstrap();
