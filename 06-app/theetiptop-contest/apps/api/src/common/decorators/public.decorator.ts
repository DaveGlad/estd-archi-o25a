import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Opens an endpoint to anonymous callers.
 *
 * `SessionGuard` is registered globally, so authentication is the default and every
 * exception has to be written down. The opposite convention — guard per controller — is
 * how an endpoint ends up unprotected because somebody forgot a decorator.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
