import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';
import {
  LoggingInterceptor,
  TimeoutInterceptor,
  ErrorInterceptor,
} from './interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.use(bodyParser.json());
  app.use(helmet());

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Register global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TimeoutInterceptor(),
    new ErrorInterceptor(),
  );

  await app.listen(process.env.PORT ?? 3006, () => {
    console.log(
      `Server running on port http://localhost:${process.env.PORT ?? 3006}`,
    );
  });
}

bootstrap();
