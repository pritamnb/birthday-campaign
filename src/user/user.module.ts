import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './user.schema';
import { NotificationModule } from 'src/notification/notification.module';
import { DiscountModule } from 'src/discount/discount.module';
import { ProductModule } from '../product/product.module';
import { UserRepository } from './user.repository';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    forwardRef(() => ProductModule),
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    NotificationModule,
    DiscountModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, MongooseModule],
})
export class UserModule { }
