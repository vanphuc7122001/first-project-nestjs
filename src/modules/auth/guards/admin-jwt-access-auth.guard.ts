import { Observable } from 'rxjs';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ADMIN_JWT_ACCESS_STRATEGY } from '../strategies';

@Injectable()
export class AdminJwtAccessAuthGuard extends AuthGuard(ADMIN_JWT_ACCESS_STRATEGY) {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }
}
