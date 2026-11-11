import { SetMetadata, createParamDecorator, type ExecutionContext } from '@nestjs/common';

import type { ApiKeyConsumer, AuthenticatedRequest } from '../auth-context.js';
import { UnauthorizedException } from '../exceptions/domain.exception.js';

export const API_KEY_CONSUMER_KEY = 'apiKeyConsumerOnly';

/**
 * Marks an endpoint as reachable by an API key rather than a session: the store tills and
 * the future e-commerce site.
 *
 * Two separate authentication schemes rather than one: a till is not a person, has no
 * browser and no cookie, and must keep working for months without anybody signing in. A
 * revocable key per consumer also means cutting the e-commerce integration off does not
 * take the 10 stores down with it.
 */
export const ApiKeyConsumerOnly = () => SetMetadata(API_KEY_CONSUMER_KEY, true);

/** Injects the consumer resolved by `ApiKeyGuard`, so its name lands in the audit log. */
export const CurrentConsumer = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ApiKeyConsumer => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.apiKeyConsumer) {
      throw new UnauthorizedException(
        'No API consumer on the request: is the route marked @ApiKeyConsumerOnly()?'
      );
    }

    return request.apiKeyConsumer;
  }
);
