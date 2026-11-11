import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '@theetiptop-contest/shared';

import type { AuthenticatedRequest } from '../auth-context.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { ForbiddenException, UnauthorizedException } from '../exceptions/domain.exception.js';

/**
 * Enforces `@Roles(...)`. Runs after `SessionGuard`, which is what puts `authUser` on the
 * request; the order is fixed by the registration order in `AppModule`.
 *
 * No role hierarchy: ADMIN is not implicitly an EMPLOYEE. An administrator has no reason
 * to hand a prize over in a store, and an endpoint that needs both says so by listing
 * both. An implicit hierarchy is how an admin-only export ends up reachable by a till
 * employee after a refactor.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.authUser;

    if (!user) throw new UnauthorizedException();

    if (!required.includes(user.role)) {
      throw new ForbiddenException(
        `This operation requires one of the following roles: ${required.join(', ')}`
      );
    }

    return true;
  }
}
