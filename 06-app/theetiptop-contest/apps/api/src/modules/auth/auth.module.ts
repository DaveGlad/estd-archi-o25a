import { Global, Module } from '@nestjs/common';

import { APP_CONFIG, type AppConfig } from '../../config/env.js';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { AUTH_INSTANCE, createAuth } from './auth.config.js';
import { AuthController } from './auth.controller.js';

/**
 * Global: `SessionGuard` is registered application-wide and needs the Better Auth
 * instance, and `main.ts` pulls it out of the container at boot to exclude its base path
 * from the `/v1` prefix.
 */
@Global()
@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: AUTH_INSTANCE,
      // A factory rather than a module-level singleton: the instance needs the validated
      // config and the Prisma client, both of which come from the container. Creating it
      // at import time would mean reading `process.env` directly and losing the
      // fail-fast validation.
      useFactory: (prisma: PrismaService, config: AppConfig) => createAuth(prisma, config),
      inject: [PrismaService, APP_CONFIG],
    },
  ],
  exports: [AUTH_INSTANCE],
})
export class AuthModule {}
