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
  const isProd = process.env.NODE_ENV === 'production';

  // Use HTTPS in production
  const app = await NestFactory.create(
    AppModule,
    isProd
      ? {
          httpsOptions: {
            key: readFileSync(process.env.SSL_KEY_PATH),
            cert: readFileSync(process.env.SSL_CERT_PATH),
          },
          bodyParser: true,
        }
      : {
          bodyParser: true,
        },
  );
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
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    console.log(
      `Server running on port ${protocol}://localhost:${process.env.PORT ?? 3006}`,
    );
  });
}

bootstrap();
