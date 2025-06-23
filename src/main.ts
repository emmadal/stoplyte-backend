import { NestFactory } from '@nestjs/core';
import { readFileSync } from 'fs';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import {
  LoggingInterceptor,
  TimeoutInterceptor,
  ErrorInterceptor,
} from './interceptors';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  // const isProd = process.env.NODE_ENV === 'production';

  // Use HTTPS in production
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
    .setDescription(
      'The Stoplyte API documentation - Complete endpoint reference with request/response schemas',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addCookieAuth('stk')
    .addTag('Accounts', 'User account management endpoints')
    .addTag('Admin', 'Administrative endpoints')
    .addTag('Buyers', 'Buyer-specific endpoints')
    .addTag('Partners', 'Partner integration endpoints')
    .addTag('Properties', 'Property management endpoints')
    .addTag('Storage', 'File storage endpoints')
    .addTag('Transaction', 'Transaction management endpoints')
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, {
      operationIdFactory: (controllerKey, methodKey) => methodKey,
      deepScanRoutes: true,
    });
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3006, () => {
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    console.log(`Server running on port ${process.env.PORT ?? 3006}`);
  });
}

bootstrap();
