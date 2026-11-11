import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { timingSafeEqual } from 'node:crypto';

import { APP_CONFIG, type AppConfig } from '../../config/env.js';
import type { AuthenticatedRequest } from '../auth-context.js';
import { API_KEY_CONSUMER_KEY } from '../decorators/api-key.decorator.js';
import { UnauthorizedException } from '../exceptions/domain.exception.js';

/** Header the tills send their key in. */
const API_KEY_HEADER = 'x-api-key';

/**
 * Authenticates the non-browser consumers of API v1.
 *
 * Only guards routes marked `@ApiKeyConsumerOnly()`; every other route is left to
 * `SessionGuard`. Registered globally so a new till endpoint cannot be added without
 * going through it.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(APP_CONFIG) private readonly config: AppConfig
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isApiKeyRoute = this.reflector.getAllAndOverride<boolean>(API_KEY_CONSUMER_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!isApiKeyRoute) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const presented = request.headers[API_KEY_HEADER];
    const key = Array.isArray(presented) ? presented[0] : presented;

    if (!key) throw new UnauthorizedException(`Missing ${API_KEY_HEADER} header`);

    const consumerName = this.findConsumer(key);
    if (!consumerName) throw new UnauthorizedException('Invalid API key');

    request.apiKeyConsumer = { name: consumerName };
    return true;
  }

  /**
   * Compares against every configured key in constant time.
   *
   * A plain `Map.get` would be O(1) but leaks through timing: a key sharing a long prefix
   * with a valid one takes measurably longer to reject under `===` on some engines. With
   * at most a handful of consumers, scanning them all and comparing with
   * `timingSafeEqual` costs nothing and removes the oracle.
   */
  private findConsumer(presented: string): string | null {
    const presentedBuffer = Buffer.from(presented);
    let match: string | null = null;

    for (const [key, name] of this.config.security.posApiKeys) {
      const keyBuffer = Buffer.from(key);

      // `timingSafeEqual` throws on a length mismatch, which is itself a (harmless) leak:
      // the length of an API key is not a secret.
      if (keyBuffer.length !== presentedBuffer.length) continue;
      if (timingSafeEqual(keyBuffer, presentedBuffer)) match = name;
    }

    return match;
  }
}
