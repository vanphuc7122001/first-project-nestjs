import { ExtractJwt, Strategy } from 'passport-jwt';
import { CONFIG_VAR } from '@config/index';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { JwtAccessPayload } from '../dtos';

export const ADMIN_JWT_ACCESS_STRATEGY = 'admin_jwt-access';

@Injectable()
export class AdminJwtAccessStrategy extends PassportStrategy(
  Strategy,
  ADMIN_JWT_ACCESS_STRATEGY
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get(CONFIG_VAR.ADMIN_JWT_SECRET),
    });
  }

  async validate(payload: JwtAccessPayload) {
    return payload;
  }
}
