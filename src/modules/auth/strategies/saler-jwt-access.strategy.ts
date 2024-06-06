import { ExtractJwt, Strategy } from "passport-jwt";
import { Injectable, UnauthorizedException } from "@nestjs/common";

import { AccountStatus } from "../enums";
import { AuthService } from "../services";
import { CONFIG_VAR } from "@config/index";
import { ConfigService } from "@nestjs/config";
import { JwtAccessPayload } from "../dtos";
import { PassportStrategy } from "@nestjs/passport";

export const SALER_JWT_ACCESS_STRATEGY = "saler-jwt-access";

@Injectable()
export class SalerJwtAccessStrategy extends PassportStrategy(
  Strategy,
  SALER_JWT_ACCESS_STRATEGY
) {
  constructor(
    configService: ConfigService,
    private readonly _authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get(CONFIG_VAR.JWT_SECRET),
    });
  }

  async validate(payload: JwtAccessPayload) {
    const saler = await this._authService.validatePermissionSaler(payload);
    console.log("saler validator");
    if (saler.deletedAt || saler.userStatus === AccountStatus.BLOCK) {
      throw new UnauthorizedException();
    }

    return saler;
  }
}
