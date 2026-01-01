import { Request, Response, NextFunction } from 'express';
import client from 'prom-client';

const register = client.register;
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'code'],
});

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  // Don't track metrics endpoint itself
  if (req.path === '/metrics') {
    return next();
  }

  const start = process.hrtime();
  const originalEnd = res.end;
  
  // @ts-ignore
  res.end = function (chunk?: any, encoding?: any) {
    const diff = process.hrtime(start);
    const duration = diff[0] + diff[1] / 1e9;
    
    httpRequestDuration.labels(req.method, req.path, String(res.statusCode)).observe(duration);
    httpRequestsTotal.labels(req.method, req.path, String(res.statusCode)).inc();
    
    // @ts-ignore
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
}
