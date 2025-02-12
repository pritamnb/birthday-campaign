import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';

import { NotificationModule } from './notification/notification.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { DiscountModule } from './discount/discount.module';
import { ProductModule } from './product/product.module';
import configurations from './config/configuration';
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(configurations.mongo),

    // MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/birthdayCampaign'),
    ScheduleModule.forRoot(),
    UserModule,
    NotificationModule,
    DiscountModule,
    ProductModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
