import { Injectable } from '@nestjs/common';
import type { ContestDto, PrizeDto, StoreDto } from '@theetiptop-contest/shared';

import { NotFoundException } from '../../common/exceptions/domain.exception.js';
import type { ContestModel } from '../../generated/prisma/models.js';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { RedisService } from '../../infra/redis/redis.service.js';
import { toContestDto, toPrizeDto, toStoreDto } from './catalogue.mapper.js';

/**
 * Catalogue: the contest, its prizes, the 10 stores.
 *
 * All read-only and all public. Also the module every other one depends on, since
 * "the current contest" is needed to play a code, to dispense one from a till and to run
 * the draw — resolving it in one place keeps the rule out of five services.
 */
@Injectable()
export class CatalogueService {
  /**
   * Five minutes.
   *
   * The catalogue changes a handful of times over the life of the contest, but it is read
   * on every page load of the public site. A short TTL keeps an administrator's edit
   * visible quickly while removing the query from the hot path — the eco-design argument
   * of the specification, measured rather than asserted.
   */
  private static readonly CACHE_TTL_SECONDS = 300;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}

  /**
   * Resolves the contest the rest of the application works against.
   *
   * The platform is built to outlive this single operation (see the header of
   * `contest.prisma`), so "the current contest" is a query, not a constant. The open one
   * wins; if none is open — before the start, or after the claim window — the most recent
   * one is returned so the public pages and the claim screens keep working instead of
   * 404ing the day after closing.
   */
  async getCurrentContestEntity(): Promise<ContestModel> {
    const now = new Date();

    const open = await this.prisma.contest.findFirst({
      where: { startsAt: { lte: now }, endsAt: { gte: now } },
      orderBy: { startsAt: 'desc' },
    });

    if (open) return open;

    const latest = await this.prisma.contest.findFirst({ orderBy: { startsAt: 'desc' } });
    if (!latest) throw new NotFoundException('Contest');

    return latest;
  }

  async getCurrentContest(): Promise<ContestDto> {
    const contest = await this.getCurrentContestEntity();
    return toContestDto(contest, new Date());
  }

  /** The 5 ticket prizes plus the grand prize, in display order. */
  async listPrizes(): Promise<PrizeDto[]> {
    const contest = await this.getCurrentContestEntity();

    return this.redis.getOrSet(
      `catalogue:prizes:${contest.id}`,
      CatalogueService.CACHE_TTL_SECONDS,
      async () => {
        const prizes = await this.prisma.prize.findMany({
          where: { contestId: contest.id },
          orderBy: { rank: 'asc' },
        });
        return prizes.map(toPrizeDto);
      }
    );
  }

  /** Active stores, Nice first since it is the one the contest celebrates. */
  async listStores(): Promise<StoreDto[]> {
    return this.redis.getOrSet('catalogue:stores', CatalogueService.CACHE_TTL_SECONDS, async () => {
      const stores = await this.prisma.store.findMany({
        where: { active: true },
        // Most recent opening first: that ordering puts the new Nice store at the top
        // without hard-coding its name into a sort.
        orderBy: [{ openedAt: 'desc' }, { name: 'asc' }],
      });
      return stores.map(toStoreDto);
    });
  }
}
