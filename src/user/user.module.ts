import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './user.schema';
import { NotificationModule } from 'src/notification/notification.module';
import { DiscountModule } from 'src/discount/discount.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    forwardRef(() => ProductModule),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    NotificationModule,
    DiscountModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, MongooseModule],
})
export class UserModule { }
