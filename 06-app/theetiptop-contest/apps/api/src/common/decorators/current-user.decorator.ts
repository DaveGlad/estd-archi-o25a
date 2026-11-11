import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import type { AuthenticatedRequest, AuthenticatedUser } from '../auth-context.js';
import { UnauthorizedException } from '../exceptions/domain.exception.js';

/**
 * Injects the caller resolved by `SessionGuard`.
 *
 * Throws rather than returning `undefined` when no session is present: a controller that
 * asks for the current user is, by construction, not a public endpoint, and silently
 * handing it `undefined` turns a missing `@Public()` audit into a null dereference three
 * frames deeper.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.authUser) {
      throw new UnauthorizedException(
        'No authenticated user on the request: is the route marked @Public()?'
      );
    }

    return request.authUser;
  }
);
