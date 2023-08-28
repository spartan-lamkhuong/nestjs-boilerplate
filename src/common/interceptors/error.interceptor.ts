import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { MyLogger } from '../../config/logger/custom.logger';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  private readonly logger = new MyLogger(ErrorsInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) =>
        throwError(() => {
          this.logger.error(err);
          return new HttpException(err.response || err.message, err.status);
        }),
      ),
    );
  }
}
