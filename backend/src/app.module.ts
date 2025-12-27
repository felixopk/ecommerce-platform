import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { MetricsModule } from './metrics/metrics.module';
import { HealthController } from './health.controller';

@Module({
  imports: [ProductsModule, MetricsModule],
  controllers: [HealthController],
})
export class AppModule {}
