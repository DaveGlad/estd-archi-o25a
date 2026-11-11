import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

import { APP_CONFIG, type AppConfig } from '../../config/env.js';
import { PrismaClient } from '../../generated/prisma/client.js';

/**
 * Single Prisma client for the whole process.
 *
 * The brief's architecture makes the API the only component that talks to the database:
 * the public site, the back office, the tills and the future e-commerce site all go
 * through API v1. One connection pool, one place where queries are written, one place to
 * look when a query is slow.
 *
 * Prisma 7 requires a driver adapter — the Rust query engine binary is gone. `PrismaPg`
 * wraps `node-postgres`, which is what lets the pool be sized explicitly below instead of
 * inherited from a connection-string parameter.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    super({
      adapter: new PrismaPg({
        connectionString: config.database.url,
        // 10 connections per API container. With 3 containers that is 30 of the 100
        // PostgreSQL allows, leaving room for the migration job, the back office and a
        // psql session during an incident. Sized in the specification, part D.3.
        max: 10,
        idleTimeoutMillis: 30_000,
        // Fail fast rather than queue a request behind an exhausted pool: a timeout
        // surfaces in the metrics, a silent 30-second wait does not.
        connectionTimeoutMillis: 5_000,
      }),
      // Warnings and errors always. Query logging stays off even in development: the
      // generation script issues 500 batches of 1,000 inserts, and logging each one turns
      // a 30-second run into an unreadable wall of SQL.
      log: ['warn', 'error'],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Connected to PostgreSQL');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
