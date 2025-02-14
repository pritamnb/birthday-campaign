import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import configurations from 'src/config/configuration';
import { UserModule } from 'src/user/user.module';
import { DiscountModule } from 'src/discount/discount.module';

@Module({
    imports: [
        forwardRef(() => UserModule),
        DiscountModule,
        JwtModule.register({
            secret: configurations.SECRET_KEY,
            signOptions: { expiresIn: '1h' }, // expires in 1h
        })],
    providers: [AuthService],
    exports: [AuthService, JwtModule],
})
export class AuthModule { }
