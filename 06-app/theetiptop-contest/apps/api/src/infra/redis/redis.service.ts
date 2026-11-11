import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

import { APP_CONFIG, type AppConfig } from '../../config/env.js';

/** Outcome of a rate limit check, so the caller can tell the client when to come back. */
export interface RateLimitVerdict {
  allowed: boolean;
  /** Attempts left in the current window. */
  remaining: number;
  /** Seconds until the window resets. 0 when the request was allowed and no window is open. */
  retryAfterSeconds: number;
}

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    this.client = new Redis(config.redis.url, {
      // Fail fast and keep retrying with a bounded backoff: the API must stay up and serve
      // the catalogue pages even if Redis is down. Rate limiting degrades, it does not
      // take the site with it (see `isAvailable`).
      maxRetriesPerRequest: 2,
      retryStrategy: (times) => Math.min(times * 200, 2_000),
      lazyConnect: false,
    });

    this.client.on('error', (error: Error) => {
      this.logger.warn(`Redis error: ${error.message}`);
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit().catch(() => this.client.disconnect());
  }

  /** Used by the health check. */
  async ping(): Promise<boolean> {
    try {
      return (await this.client.ping()) === 'PONG';
    } catch {
      return false;
    }
  }

  /**
   * Fixed-window counter.
   *
   * INCR followed by EXPIRE on first hit, in a single pipeline: two round trips would
   * leave a window of time where a crash between the two leaves a key with no TTL, i.e. a
   * client banned forever.
   *
   * ⚠️ Fails OPEN. If Redis is unreachable the request is allowed through. The reasoning:
   * this limiter protects against brute-forcing a 10-character code, which is already
   * near-impossible (3.6 x 10^15 combinations); locking every customer out of the contest
   * because the cache is down is the worse outcome. A failure is logged so it is visible
   * in Grafana.
   */
  async consumeRateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitVerdict> {
    try {
      const results = await this.client
        .multi()
        .incr(key)
        .expire(key, windowSeconds, 'NX')
        .ttl(key)
        .exec();

      if (!results) {
        return { allowed: true, remaining: limit, retryAfterSeconds: 0 };
      }

      const count = Number(results[0]?.[1] ?? 0);
      const ttl = Number(results[2]?.[1] ?? windowSeconds);

      return {
        allowed: count <= limit,
        remaining: Math.max(0, limit - count),
        retryAfterSeconds: count <= limit ? 0 : Math.max(1, ttl),
      };
    } catch (error) {
      this.logger.warn(
        `Rate limit check failed open for "${key}": ${(error as Error).message}`
      );
      return { allowed: true, remaining: limit, retryAfterSeconds: 0 };
    }
  }

  /**
   * Read-through cache for the back-office aggregates.
   *
   * The statistics dashboard runs a dozen aggregations over 500,000 codes. Recomputing
   * them on every page load is the kind of avoidable cost the eco-design section of the
   * specification commits us to cutting; a short TTL keeps the figures fresh enough for a
   * dashboard an administrator consults a few times a day.
   */
  async getOrSet<T>(key: string, ttlSeconds: number, produce: () => Promise<T>): Promise<T> {
    try {
      const cached = await this.client.get(key);
      if (cached) return JSON.parse(cached) as T;
    } catch (error) {
      this.logger.warn(`Cache read failed for "${key}": ${(error as Error).message}`);
    }

    const value = await produce();

    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (error) {
      this.logger.warn(`Cache write failed for "${key}": ${(error as Error).message}`);
    }

    return value;
  }

  /** Drops cached aggregates after a write that invalidates them (a new participation, a redemption). */
  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) await this.client.del(...keys);
    } catch (error) {
      this.logger.warn(`Cache invalidation failed for "${pattern}": ${(error as Error).message}`);
    }
  }
}
