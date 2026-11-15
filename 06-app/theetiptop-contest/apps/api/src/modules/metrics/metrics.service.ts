import { Inject, Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

import { APP_CONFIG, type AppConfig } from '../../config/env.js';
import { PrismaService } from '../../infra/prisma/prisma.service.js';

/**
 * Prometheus metrics for the contest API.
 *
 * Requirement n° 3 of the brief asks the workflow to carry metrics, and dysfunction n° 7
 * of the état des lieux is that Furious Ducks currently has none — it learns about outages
 * from its clients. Infrastructure metrics (CPU, memory, container restarts) come from
 * node_exporter and cAdvisor and need nothing from us. What only the application can
 * publish is the state of the CONTEST, and that is what this service is for.
 *
 * The editorial rule is the same as for the alert file: every metric here answers a
 * question somebody asks during an incident. A dashboard of forty graphs nobody reads
 * costs storage and attention and buys neither diagnosis nor confidence.
 */
@Injectable()
export class MetricsService implements OnModuleDestroy {
  private readonly logger = new Logger(MetricsService.name);

  /**
   * A registry of our own rather than the global default.
   *
   * `prom-client` keeps a module-level singleton, and registering the same metric twice
   * against it throws. In a test suite that builds the Nest application more than once,
   * that turns into a failure in an unrelated test — and the usual workaround, clearing
   * the global registry, quietly breaks anything else that was using it.
   */
  private readonly registry = new Registry();

  /** Cached, because the gauges below run SQL and Prometheus scrapes every 15 seconds. */
  private cachedAt = 0;

  private readonly environment: string;

  // --- business metrics ------------------------------------------------------

  /**
   * Codes still available for the tills.
   *
   * The one metric with a hard operational deadline behind it. The pool CANNOT be topped
   * up: the 60/20/10/6/4 % split was fixed at generation and filed with the bailiff, so
   * running out means tills stop printing codes for the rest of the contest. Hence the
   * alert at 10,000 rather than at zero.
   */
  private readonly codesAvailable = new Gauge({
    name: 'theetiptop_codes_available',
    help: 'Codes still available in the pool, by status.',
    labelNames: ['environment', 'status'] as const,
    registers: [this.registry],
  });

  /**
   * Code submissions, by outcome.
   *
   * A counter per outcome, not a single total, because the six outcomes mean very
   * different things. A rise in `ALREADY_USED` is customers replaying receipts; a rise in
   * `ERROR` is us. Only the second is an incident, and a single total would hide it inside
   * the first.
   */
  private readonly participations = new Counter({
    name: 'theetiptop_participations_total',
    help: 'Code submissions, by outcome.',
    labelNames: ['environment', 'outcome'] as const,
    registers: [this.registry],
  });

  /** Codes handed out by the tills, by channel. Feeds the "codes left" burn-down. */
  private readonly codesDispensed = new Counter({
    name: 'theetiptop_codes_dispensed_total',
    help: 'Codes handed out by the tills, by channel.',
    labelNames: ['environment', 'channel'] as const,
    registers: [this.registry],
  });

  /** Prizes actually collected in store. The end of the customer journey. */
  private readonly prizesRedeemed = new Counter({
    name: 'theetiptop_prizes_redeemed_total',
    help: 'Prizes handed over to customers in store.',
    labelNames: ['environment'] as const,
    registers: [this.registry],
  });

  // --- technical metrics -----------------------------------------------------

  /**
   * HTTP latency, by route.
   *
   * By ROUTE TEMPLATE, never by URL: `/v1/participations/:id` is one label, while the
   * concrete ids would be one time series per participation. That is the classic way to
   * take Prometheus down with your own instrumentation.
   *
   * Buckets chosen from the measurements in BENCHMARK.md — an indexed lookup is ~540 µs
   * and the p(95) under load is 15 ms, so the interesting resolution is below 100 ms.
   * The default buckets would put nearly every request in the first one.
   */
  private readonly httpDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration, by route template.',
    labelNames: ['environment', 'method', 'route', 'status'] as const,
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    registers: [this.registry],
  });

  constructor(
    private readonly prisma: PrismaService,
    @Inject(APP_CONFIG) config: AppConfig
  ) {
    this.environment = config.nodeEnv;

    // Event loop lag, heap, open handles, GC pauses. Cheap, and the first thing worth
    // looking at when the API is slow but the database is not.
    collectDefaultMetrics({ register: this.registry, prefix: 'theetiptop_api_' });
  }

  onModuleDestroy(): void {
    this.registry.clear();
  }

  /** Called by the participation service, once per submission. */
  recordParticipation(outcome: string): void {
    this.participations.inc({ environment: this.environment, outcome });
  }

  /** Called by the till service when a code is handed out. */
  recordDispense(channel: string): void {
    this.codesDispensed.inc({ environment: this.environment, channel });
  }

  /** Called by the employee service when a prize is collected. */
  recordRedemption(): void {
    this.prizesRedeemed.inc({ environment: this.environment });
  }

  /** Called by the HTTP interceptor. */
  recordRequest(method: string, route: string, status: number, seconds: number): void {
    this.httpDuration.observe(
      { environment: this.environment, method, route, status: String(status) },
      seconds
    );
  }

  /**
   * Renders the exposition format for a scrape.
   *
   * The pool gauges are refreshed here rather than kept live, because they are an
   * aggregate over 500,000 rows and no code path owns them: a code moves between statuses
   * from the till, from a submission and from the nightly maintenance job.
   *
   * Refreshed at most every 10 seconds. Prometheus scrapes every 15, but the blackbox
   * exporter and a human with a browser can both arrive in the same second, and this query
   * is not free. Stale metrics would be worse than none, so the window stays below the
   * scrape interval.
   */
  async scrape(): Promise<{ contentType: string; body: string }> {
    const now = Date.now();

    if (now - this.cachedAt > 10_000) {
      try {
        const counts = await this.prisma.ticketCode.groupBy({
          by: ['status'],
          _count: { _all: true },
        });

        for (const row of counts) {
          this.codesAvailable.set(
            { environment: this.environment, status: row.status },
            row._count._all
          );
        }

        this.cachedAt = now;
      } catch (error) {
        // A failed scrape must not take the API down with it. Prometheus will see the
        // previous values and, if the database really is gone, `up{job="postgres"}` and
        // the health probe will both say so far more clearly than a missing gauge.
        this.logger.warn(`Metrics refresh failed, serving the previous values: ${error}`);
      }
    }

    return {
      contentType: this.registry.contentType,
      body: await this.registry.metrics(),
    };
  }
}
