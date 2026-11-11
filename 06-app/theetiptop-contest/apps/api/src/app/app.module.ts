import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';

import { AuditModule } from '../common/audit/audit.module.js';
import { DomainExceptionFilter } from '../common/filters/domain-exception.filter.js';
import { ApiKeyGuard } from '../common/guards/api-key.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { SessionGuard } from '../common/guards/session.guard.js';
import { ConfigurationModule } from '../config/config.module.js';
import { PrismaModule } from '../infra/prisma/prisma.module.js';
import { RedisModule } from '../infra/redis/redis.module.js';
import { AuthModule } from '../modules/auth/auth.module.js';
import { CatalogueModule } from '../modules/catalogue/catalogue.module.js';
import { DrawModule } from '../modules/draw/draw.module.js';
import { EmployeeModule } from '../modules/employee/employee.module.js';
import { ExportModule } from '../modules/export/export.module.js';
import { HealthModule } from '../modules/health/health.module.js';
import { MaintenanceModule } from '../modules/maintenance/maintenance.module.js';
import { ParticipationsModule } from '../modules/participations/participations.module.js';
import { PosModule } from '../modules/pos/pos.module.js';
import { StatsModule } from '../modules/stats/stats.module.js';
import { UsersModule } from '../modules/users/users.module.js';

/**
 * Root module.
 *
 * Everything cross-cutting is registered here, once:
 *   - validation, so no controller can forget to validate its body;
 *   - the exception filter, so every error leaves the API in the same envelope;
 *   - the three guards, so authentication is the default rather than something each
 *     controller has to remember to ask for.
 */
@Module({
  imports: [
    // --- Infrastructure (all global) ---
    ConfigurationModule,
    PrismaModule,
    RedisModule,
    AuditModule,
    AuthModule,
    HealthModule,

    // --- Public site ---
    CatalogueModule, // the contest, the prizes, the 10 stores
    UsersModule, // sign-up, profile, GDPR rights
    ParticipationsModule, // UC-01: play a code, my prizes

    // --- Back office ---
    EmployeeModule, // customer search, prize handover
    StatsModule, // administrator dashboard
    ExportModule, // opt-in mailing base
    DrawModule, // grand prize draw

    // --- Third-party consumers ---
    PosModule, // store tills and the future e-commerce site

    // --- Scheduled jobs ---
    MaintenanceModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          // Strip anything the DTO does not declare, and refuse the request outright if
          // it carried unknown properties. Belt and braces: `whitelist` alone would
          // silently drop a `role: 'ADMIN'` smuggled into a sign-up payload, which is
          // safe but hides the attempt; `forbidNonWhitelisted` surfaces it as a 400.
          whitelist: true,
          forbidNonWhitelisted: true,
          // DTOs declare `number` and `Date`; query strings and JSON carry strings.
          transform: true,
          transformOptions: { enableImplicitConversion: true },
        }),
    },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },

    // Guard order is the registration order. Session first, because it is what puts the
    // caller on the request; ApiKey next, for the till routes it alone handles; Roles
    // last, since it reads what Session resolved.
    { provide: APP_GUARD, useClass: SessionGuard },
    { provide: APP_GUARD, useClass: ApiKeyGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
