import { ExtractJwt, Strategy } from 'passport-jwt';
import { CONFIG_VAR } from '@config/index';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { JwtAccessPayload } from '../dtos';

export const JWT_ACCESS_STRATEGY = 'jwt-access';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  JWT_ACCESS_STRATEGY
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get(CONFIG_VAR.JWT_SECRET),
    });
  }

  async validate(payload: JwtAccessPayload) {
    return payload;
  }
}
