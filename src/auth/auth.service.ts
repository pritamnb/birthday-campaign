import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {


    constructor(
        private jwtService: JwtService,
    ) { }

    async generateToken(user: CreateUserDto) {
        const payload = { email: user.email, name: user.name, _id: user['_id'] };
        return await this.jwtService.sign(payload);
    }
}
