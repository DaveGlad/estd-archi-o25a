import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { UsersModule } from '../users/users.module.js';
import { MaintenanceService } from './maintenance.service.js';

@Module({
  imports: [ScheduleModule.forRoot(), UsersModule],
  providers: [MaintenanceService],
})
export class MaintenanceModule {}
