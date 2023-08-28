import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';
import { contentParser } from 'fastify-multer';

import { AppModule } from './app.module';
import { SentryInterceptor } from './config/sentry/sentry.interceptor';

const API_VERSION = 'v1';

async function bootstrap() {
  Sentry.init({
    release: process.env.npm_package_version,
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.2,
    debug: true,
    environment: process.env.NODE_ENV,
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix(API_VERSION);

  const configService: ConfigService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get('CORS_ORIGIN'),
  });

  if (configService.get('NODE_ENV') === 'dev') {
    const config = new DocumentBuilder()
      .setTitle('Trueprofile Notification')
      .setDescription('Trueprofile Notification')
      .setVersion('2.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(API_VERSION, app, document);
  }

  app.useGlobalInterceptors(new SentryInterceptor());
  app.register(contentParser);

  await app.listen(configService.get('port'), '0.0.0.0');
}

bootstrap();
