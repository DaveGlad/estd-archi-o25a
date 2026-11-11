import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { UsersService } from '../users/users.service.js';

/**
 * Scheduled upkeep.
 *
 * One job for now: expiring prizes nobody claimed. The brief gives 30 days after closing
 * to claim; past that, a prize still marked `TO_CLAIM` is neither true nor useful, and the
 * administrator's dashboard would count it as outstanding forever.
 *
 * Why a stored status rather than computing it on read: the figures the bailiff checks and
 * the figures the dashboard shows have to be the same figures, and "expired" is a fact
 * about the contest, not a rendering detail. An employee opening a customer's file must
 * also see the prize as expired rather than see a claim button that then fails.
 *
 * ⚠️ With three API containers this cron fires three times. That is deliberate rather than
 * ignored: the job is a single idempotent `UPDATE ... WHERE prizeStatus = 'TO_CLAIM' AND
 * claimDeadline < now()`, so the second and third runs match zero rows. Adding a
 * distributed lock to protect an idempotent statement would be more moving parts than the
 * problem has. If a non-idempotent job is ever added here, that reasoning stops holding
 * and a Redis lock becomes necessary.
 */
@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);

  constructor(private readonly users: UsersService) {}

  // 03:00 Europe/Paris: outside any plausible traffic, and far enough from midnight that a
  // prize expiring "today" is already past its deadline in every timezone a customer might
  // be in.
  @Cron(CronExpression.EVERY_DAY_AT_3AM, {
    name: 'expire-unclaimed-prizes',
    timeZone: 'Europe/Paris',
  })
  async expireUnclaimedPrizes(): Promise<void> {
    try {
      const count = await this.users.expireUnclaimedPrizes();
      if (count > 0) this.logger.log(`${count} prize(s) past their claim deadline marked EXPIRED`);
    } catch (error) {
      // Never let a scheduled job take the process down: an unhandled rejection in a cron
      // callback crashes the container, and the container restarting is a worse outcome
      // than one missed run.
      this.logger.error(
        'Failed to expire unclaimed prizes',
        error instanceof Error ? error.stack : String(error)
      );
    }
  }
}
