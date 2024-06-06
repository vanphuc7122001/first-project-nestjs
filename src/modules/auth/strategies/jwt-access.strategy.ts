import { ExtractJwt, Strategy } from "passport-jwt";
import { Injectable, UnauthorizedException } from "@nestjs/common";

import { AccountStatus } from "./../enums/account-status.enum";
import { AuthService } from "../services";
import { CONFIG_VAR } from "@config/index";
import { ConfigService } from "@nestjs/config";
import { JwtAccessPayload } from "../dtos";
import { PassportStrategy } from "@nestjs/passport";

export const JWT_ACCESS_STRATEGY = "jwt-access";

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  JWT_ACCESS_STRATEGY
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
    const user = await this._authService.validatePermissionUser(payload);

    if (user.deletedAt || user.userStatus === AccountStatus.BLOCK) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
