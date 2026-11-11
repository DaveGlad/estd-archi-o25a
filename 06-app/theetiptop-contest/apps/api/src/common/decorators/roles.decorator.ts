import { SetMetadata } from '@nestjs/common';
import type { Role } from '@theetiptop-contest/shared';

export const ROLES_KEY = 'roles';

/**
 * Restricts an endpoint to the listed roles.
 *
 * Answers requirement 6 of the brief, "three distinct profiles: customer, in-store
 * employee, administrator". Authorisation is declared next to the route it protects, so
 * reading a controller tells you who may call it.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
