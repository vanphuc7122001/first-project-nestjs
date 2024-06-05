import {
  BadRequestException,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { ADMIN_JWT_ACCESS_STRATEGY } from "../strategies";
import { AuthGuard } from "@nestjs/passport";
import { JsonWebTokenError } from "jsonwebtoken";
import { Observable } from "rxjs";

@Injectable()
export class AdminJwtAccessAuthGuard extends AuthGuard(
  ADMIN_JWT_ACCESS_STRATEGY
) {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) throw err || new UnauthorizedException();

    if (info) {
      if (info instanceof JsonWebTokenError) {
        throw new UnauthorizedException(info.message);
      }
      throw new BadRequestException(info.message);
    }

    return user;
  }
}
