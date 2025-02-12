import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import configurations from 'src/config/configuration';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extracts token from Authorization header
            ignoreExpiration: false,
            secretOrKey: configurations.secretKey,
        });
    }

    async validate(payload: any) {
        return payload; // Return the decoded JWT payload (contains user info)
    }
}
