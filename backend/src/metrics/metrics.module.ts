import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { metricsMiddleware } from './metrics.middleware';
import { MetricsController } from './metrics.controller';

@Module({
  controllers: [MetricsController],
})
export class MetricsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(metricsMiddleware).forRoutes('*');
  }
}
