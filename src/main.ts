import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import {
  LoggingInterceptor,
  TimeoutInterceptor,
  ErrorInterceptor,
} from './interceptors';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
  });
  app.enableCors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
    methods: 'GET,PUT,POST,DELETE',
    maxAge: 24 * 60 * 60,
  });

  app.use(helmet());
  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Register global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TimeoutInterceptor(),
    new ErrorInterceptor(),
  );

  const config = new DocumentBuilder()
    .setTitle('Stoplyte API')
    .setDescription('The Stoplyte API description')
    .setVersion('1.0')
    .addTag('Stoplyte')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3006, () => {
    console.log(
      `Server running on port http://localhost:${process.env.PORT ?? 3006}`,
    );
  });
}

bootstrap();
