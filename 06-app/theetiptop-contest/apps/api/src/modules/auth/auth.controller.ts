import { All, Controller, Inject, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { toNodeHandler } from 'better-auth/node';
import type { Request, Response } from 'express';

import { Public } from '../../common/decorators/public.decorator.js';
import { AUTH_INSTANCE, type AuthInstance } from './auth.config.js';

/**
 * Hands every `/api/auth/*` request to Better Auth.
 *
 * Mounted as a Nest controller rather than raw Express middleware so the route shows up
 * in the Nest router and goes through the global exception filter like everything else.
 *
 * Two things make this work, both set in `main.ts`:
 *   - the global `/v1` prefix excludes this path, because `/api/auth` is the base path
 *     Better Auth builds its own URLs and OAuth callbacks from;
 *   - body parsing is skipped for this path, because the handler consumes the raw request
 *     stream itself. A parsed body would arrive here already drained.
 *
 * Excluded from Swagger: Better Auth publishes its own OpenAPI description, and
 * reverse-engineering ~20 of its endpoints into decorators would rot on the next upgrade.
 */
@ApiExcludeController()
@Controller('api/auth')
export class AuthController {
  constructor(@Inject(AUTH_INSTANCE) private readonly auth: AuthInstance) {}

  @Public()
  @All('{*splat}')
  async handle(@Req() request: Request, @Res() response: Response): Promise<void> {
    // `{*splat}` is the Express 5 / path-to-regexp v8 form of the old bare `*`, which no
    // longer parses. The braces make the segment optional, so `/api/auth` itself matches
    // too, not only `/api/auth/<something>`.
    await toNodeHandler(this.auth)(request, response);
  }
}
