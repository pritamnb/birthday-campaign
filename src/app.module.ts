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
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import configurations from './config/configuration';
import { JwtStrategy } from './auth/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(configurations.mongo),
    ScheduleModule.forRoot(),
    UserModule,
    NotificationModule,
    DiscountModule,
    ProductModule,
    AuthModule,
    JwtModule
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule { }
