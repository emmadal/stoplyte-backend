import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const now = Date.now();

    return next.handle().pipe(
      catchError((error) => {
        const delay = Date.now() - now;
        const status =
          error instanceof HttpException
            ? error.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
          error instanceof HttpException
            ? error.message
            : 'Internal server error';

        const response = {
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
          message,
          ...(process.env.NODE_ENV !== 'production' && {
            stack: error.stack,
          }),
        };

        this.logger.error(
          `${request.method} ${request.url} - delay: ${delay}ms - Error: ${message}`,
        );

        return throwError(() => new HttpException(response, status));
      }),
    );
  }
}
