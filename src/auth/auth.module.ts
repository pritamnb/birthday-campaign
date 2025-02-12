import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import configurations from 'src/config/configuration';
import { UserRepository } from 'src/user/user.repository';
import { NotificationService } from 'src/notification/notification.service';
import { DiscountService } from 'src/discount/discount.service';
import { ProductService } from 'src/product/product.service';
import { UserModule } from 'src/user/user.module';
import { DiscountModule } from 'src/discount/discount.module';

@Module({
    imports: [
        forwardRef(() => UserModule),
        DiscountModule,
        JwtModule.register({
            secret: configurations.secretKey,
            signOptions: { expiresIn: '1h' }, // expires in 1h
        })],
    providers: [AuthService],
    exports: [AuthService, JwtModule],
})
export class AuthModule { }
