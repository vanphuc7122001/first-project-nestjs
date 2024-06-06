import { ExtractJwt, Strategy } from "passport-jwt";
import { Injectable, UnauthorizedException } from "@nestjs/common";

import { AccountStatus } from "../enums";
import { AuthService } from "../services";
import { CONFIG_VAR } from "@config/index";
import { ConfigService } from "@nestjs/config";
import { JwtAccessPayload } from "../dtos";
import { PassportStrategy } from "@nestjs/passport";

export const ADMIN_JWT_ACCESS_STRATEGY = "admin-jwt-access";

@Injectable()
export class AdminJwtAccessStrategy extends PassportStrategy(
  Strategy,
  ADMIN_JWT_ACCESS_STRATEGY
) {
  constructor(
    configService: ConfigService,
    private readonly _authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get(CONFIG_VAR.ADMIN_JWT_SECRET),
    });
  }

  async validate(payload: JwtAccessPayload) {
    const admin = await this._authService.validatePermissionAdmin(payload);

    if (admin.deletedAt || admin.userStatus === AccountStatus.BLOCK) {
      throw new UnauthorizedException();
    }

    return admin;
  }
}
