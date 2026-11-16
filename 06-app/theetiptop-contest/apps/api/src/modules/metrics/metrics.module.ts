import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { MetricsController } from './metrics.controller.js';
import { MetricsInterceptor } from './metrics.interceptor.js';
import { MetricsService } from './metrics.service.js';

/**
 * Metrics, registered once for the whole application.
 *
 * `@Global()` so that any service can record a business event by injecting
 * `MetricsService`, without every feature module having to import this one. Metrics are
 * cross-cutting in the same way logging is; threading an import through a dozen modules
 * would add noise and would guarantee that the one module somebody forgot is the one that
 * stops reporting.
 */
@Global()
@Module({
  controllers: [MetricsController],
  providers: [MetricsService, { provide: APP_INTERCEPTOR, useClass: MetricsInterceptor }],
  exports: [MetricsService],
})
export class MetricsModule {}
