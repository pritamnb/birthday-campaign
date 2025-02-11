import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';

import { CampaignModule } from './campaign/campaign.module';
import { NotificationModule } from './notification/notification.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/birthdayCampaign'),
    ScheduleModule.forRoot(),
    UserModule,
    CampaignModule,
    NotificationModule,
    RecommendationModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
