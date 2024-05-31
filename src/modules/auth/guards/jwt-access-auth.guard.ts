import { Observable } from 'rxjs';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JWT_ACCESS_STRATEGY } from '../strategies';

@Injectable()
export class JwtAccessAuthGuard extends AuthGuard(JWT_ACCESS_STRATEGY) {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }
}
