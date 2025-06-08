import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // First check cookies
        (request: Request) => {
          const cookieToken = request?.cookies?.['stk'];
          if (cookieToken) {
            return cookieToken;
          }
          return null;
        },
        // Then check the Authorization header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    // Return the user object that will be attached to the request
    return {
      userId: payload.sub,
      roles: payload.roles || [],
    };
  }
}
