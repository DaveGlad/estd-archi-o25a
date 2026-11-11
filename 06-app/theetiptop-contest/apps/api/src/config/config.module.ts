import { Global, Module } from '@nestjs/common';

import { APP_CONFIG, loadConfig } from './env.js';

/**
 * Publishes the validated configuration to the whole container.
 *
 * Global because the infrastructure modules (`PrismaModule`, `RedisModule`) and the auth
 * module all need it, and they are themselves global: a non-global provider would not be
 * resolvable from their scope.
 */
@Global()
@Module({
  providers: [{ provide: APP_CONFIG, useFactory: loadConfig }],
  exports: [APP_CONFIG],
})
export class ConfigurationModule {}
