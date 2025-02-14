import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createLogger, enableLoggerInstance, enableDebugger } from './libs/logger';
import loggerConfig from './config/loggerConfig';
import configurations from './config/configuration';
import { config } from './libs/documentation/swaggerConfig';
import { SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
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

  // Export Swagger JSON
  fs.writeFileSync('./swagger.json', JSON.stringify(document, null, 2));  // Save as a JSON file

  await app.listen(configurations.port, () => {
    console.info(`Server started on ${configurations.port} port`);
  });
}
bootstrap();
