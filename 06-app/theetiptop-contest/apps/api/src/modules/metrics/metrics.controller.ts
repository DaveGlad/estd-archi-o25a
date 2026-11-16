import { Controller, Get, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Response } from 'express';

import { Public } from '../../common/decorators/public.decorator.js';
import { MetricsService } from './metrics.service.js';

/**
 * Prometheus scrape endpoint.
 *
 * Outside the `/v1` prefix, like `/health`: this is operational plumbing, not part of the
 * versioned contract the tills and the future e-commerce site are written against. A
 * scrape configuration should not have to be rewritten because the business API moved to
 * v2.
 *
 * `@Public()` because Prometheus carries no session. It is NOT public in the network
 * sense: the API publishes no port of its own, and the `backend` compose network is
 * `internal: true`, so the only things that can reach this route are the containers on
 * that network. Putting a token in front of it would add a secret to manage and would
 * stop exactly nobody who was already inside.
 *
 * Excluded from Swagger: it is not an endpoint an API consumer calls, and its payload is
 * a text exposition format rather than JSON.
 */
@ApiExcludeController()
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  @Public()
  @Get()
  async scrape(@Res() response: Response): Promise<void> {
    const { contentType, body } = await this.metrics.scrape();

    // Written straight to the response: the exposition format is `text/plain` with a
    // version parameter that Prometheus checks, and returning a string would have Nest
    // serialise it as JSON.
    response.setHeader('Content-Type', contentType);
    response.send(body);
  }
}
