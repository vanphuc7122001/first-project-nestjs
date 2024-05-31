import { map } from 'rxjs/operators';
import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>) {
    context.switchToHttp().getResponse().status(HttpStatus.OK);
    return next.handle().pipe(
      map((data) => {
        // if data is null or undefined, return it as success response with null data
        if (!data) return {};

        // otherwise, return it as success response with data as object property
        return data;
      })
    );
  }
}
