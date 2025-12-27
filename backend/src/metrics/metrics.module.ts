import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { metricsMiddleware } from './metrics.middleware';

@Module({})
export class MetricsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(metricsMiddleware).forRoutes('*');
  }
}
