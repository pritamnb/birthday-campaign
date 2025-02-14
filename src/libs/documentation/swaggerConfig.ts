import { DocumentBuilder } from '@nestjs/swagger';

export const config = new DocumentBuilder()
  .setTitle('Birthday Campaign')
  .setDescription('API description')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
