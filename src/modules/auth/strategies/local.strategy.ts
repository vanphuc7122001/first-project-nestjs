import { Injectable, UnauthorizedException } from "@nestjs/common";

import { AuthService } from "../services";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";

export const LOCAL_STRATEGY = "local";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly _authService: AuthService) {
    super({ usernameField: "email", passwordField: "password" });
  }

  async validate(email: string, password: string) {
    const user = await this._authService.validateUser(email, password);

    return user;
  }
}
