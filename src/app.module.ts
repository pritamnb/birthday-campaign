import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import configurations from './config/configuration';
import { JwtStrategy } from './auth/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { CronService } from './cron/cron.service';
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(configurations.mongo),
    ScheduleModule.forRoot(),

    JwtModule
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy, CronService],
})
export class AppModule {
  static async registerModules() {
    return {
      module: AppModule,
      imports: [
        (await import('./auth/auth.module')).AuthModule,
        (await import('./user/user.module')).UserModule,
        (await import('./product/product.module')).ProductModule,
        (await import('./discount/discount.module')).DiscountModule,
        (await import('./notification/notification.module')).NotificationModule
      ]
    }
  }
}
