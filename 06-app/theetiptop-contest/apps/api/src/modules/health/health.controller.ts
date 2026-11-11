import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator.js';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { RedisService } from '../../infra/redis/redis.service.js';

/**
 * Liveness and readiness probe.
 *
 * Not decoration: the brief requires a metrics stack (Prometheus / Grafana) and
 * automated deployments to dev and preprod. Both need an endpoint that answers "is this
 * container actually serving, or merely running". The Docker `HEALTHCHECK` and the
 * Jenkins post-deploy gate both hit this route.
 *
 * Outside the `/v1` prefix on purpose: it is operational plumbing, not part of the
 * versioned business contract, and must keep working across API versions.
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaIndicator: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly indicator: HealthIndicatorService
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'État de santé de l’API',
    description:
      'Vérifie la connexion PostgreSQL et la connexion Redis. Consommé par le HEALTHCHECK Docker, par la sonde Prometheus et par le contrôle post-déploiement du pipeline Jenkins.',
  })
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.prismaIndicator.pingCheck('postgres', this.prisma),
      async () => {
        const indicator = this.indicator.check('redis');
        // Redis being down degrades rate limiting and caching but does not stop the
        // contest, so it is reported as down without failing the whole probe body — the
        // overall status still turns "error", which is what an operator needs to see.
        return (await this.redis.ping())
          ? indicator.up()
          : indicator.down({ message: 'Redis unreachable' });
      },
    ]);
  }
}
