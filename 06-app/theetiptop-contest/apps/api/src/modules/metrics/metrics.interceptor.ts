import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

import { MetricsService } from './metrics.service.js';

/**
 * Times every request and records it against its ROUTE TEMPLATE.
 *
 * The template, not the URL. Express exposes the matched route as `/v1/participations/:id`
 * while the URL is `/v1/participations/clx7a…`; labelling by URL would create one time
 * series per participation and is the standard way to bring a Prometheus server down with
 * your own instrumentation.
 *
 * Registered globally in `MetricsModule` so no controller has to remember to ask for it.
 * An interceptor somebody must opt into measures only the routes somebody remembered.
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();

    // The scrape itself is skipped. Measuring it would feed the histogram a sample on
    // every scrape, inflating the request count with traffic no user generated.
    if (request.path === '/metrics') return next.handle();

    const startedAt = process.hrtime.bigint();

    const record = () => {
      const response = http.getResponse<Response>();
      // `route.path` is undefined on a 404 — nothing matched — and those collapse into a
      // single `unmatched` label rather than one series per probed URL. Otherwise a
      // scanner walking the site would create thousands of them.
      const route = request.route?.path ?? 'unmatched';
      const seconds = Number(process.hrtime.bigint() - startedAt) / 1e9;

      this.metrics.recordRequest(request.method, route, response.statusCode, seconds);
    };

    // Both paths: a request that ends in an exception is exactly the one worth timing, and
    // `tap({ next })` alone would silently drop every error.
    return next.handle().pipe(tap({ next: record, error: record }));
  }
}
