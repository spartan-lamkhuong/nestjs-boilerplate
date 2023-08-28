import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    if (!request.query.include) {
      return next.handle().pipe(
        map((data) => {
          return {
            status_code: HttpStatus.OK,
            message: 'Success',
            data,
          };
        }),
      );
    }

    return next.handle().pipe(
      map((response) => {
        return {
          status_code: HttpStatus.OK,
          message: 'Success',
          data: response.data,
          included: response.included,
        };
      }),
    );
  }
}
