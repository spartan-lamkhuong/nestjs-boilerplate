import '@sentry/tracing';

import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import * as Sentry from '@sentry/node';

import { ErrorsInterceptor } from './common/interceptors/error.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import configuration from './config/configuration';
import { HealthModule } from './config/health/health.module';
import { LoggerMiddleware } from './config/logger/logger.middleware';
import { PrismaModule } from './config/prisma/prisma.module';
import { SentryInterceptor } from './config/sentry/sentry.interceptor';

@UseInterceptors(SentryInterceptor)
@Module({
  imports: [
    CacheModule.register({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.development'],
      load: [configuration],
      isGlobal: true,
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    PrismaModule,
    HttpModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    LoggerMiddleware,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorsInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(Sentry.Handlers.requestHandler()).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
