import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service.js';

/**
 * Global on purpose: every business module needs the repository layer, and re-importing
 * PrismaModule in a dozen modules buys nothing but noise.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
