import { DocumentBuilder } from '@nestjs/swagger';

export const config = new DocumentBuilder()
  .setTitle('Birthday Campaign')
  .setDescription('Discount code generation a week before birthday and suggest products to buy.')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
