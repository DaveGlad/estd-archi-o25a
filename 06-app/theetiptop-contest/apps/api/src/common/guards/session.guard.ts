import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { fromNodeHeaders } from 'better-auth/node';
import type { Role } from '@theetiptop-contest/shared';

import { AUTH_INSTANCE, type AuthInstance } from '../../modules/auth/auth.config.js';
import type { AuthenticatedRequest } from '../auth-context.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { API_KEY_CONSUMER_KEY } from '../decorators/api-key.decorator.js';
import { UnauthorizedException } from '../exceptions/domain.exception.js';

/**
 * Resolves the Better Auth session and attaches the caller to the request.
 *
 * Registered globally in `AppModule`: authentication is the default, and every public
 * route carries an explicit `@Public()`. Endpoints reserved for the tills carry
 * `@ApiKeyConsumerOnly()` and are handled by `ApiKeyGuard` instead — this guard steps
 * aside for them rather than demanding a session a till will never have.
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(AUTH_INSTANCE) private readonly auth: AuthInstance
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handlers = [context.getHandler(), context.getClass()];

    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, handlers)) return true;
    if (this.reflector.getAllAndOverride<boolean>(API_KEY_CONSUMER_KEY, handlers)) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // Better Auth reads the session cookie off a Fetch `Headers`; `fromNodeHeaders`
    // bridges Express's plain object to it.
    const session = await this.auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session?.user) throw new UnauthorizedException();

    const user = session.user as typeof session.user & {
      role?: string | null;
      storeId?: string | null;
    };

    request.authUser = {
      id: user.id,
      email: user.email,
      // The column is a Prisma enum, so the value is always one of the three; the cast
      // narrows the `string` the additional-field mechanism hands back.
      role: (user.role ?? 'CUSTOMER') as Role,
      storeId: user.storeId ?? null,
    };

    return true;
  }
}
