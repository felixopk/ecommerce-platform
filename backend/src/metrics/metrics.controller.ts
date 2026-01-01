import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import * as client from 'prom-client';

@Controller()
export class MetricsController {
  private register = client.register;

  @Get('metrics')
  async getMetrics(@Res() res: Response) {
    res.setHeader('Content-Type', this.register.contentType);
    const metrics = await this.register.metrics();
    res.send(metrics);
  }
}
