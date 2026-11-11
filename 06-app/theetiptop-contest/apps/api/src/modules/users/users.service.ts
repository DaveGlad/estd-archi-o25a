import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { PersonalDataExport, UserDto } from '@theetiptop-contest/shared';

import type { AuthenticatedUser } from '../../common/auth-context.js';
import { AuditService } from '../../common/audit/audit.service.js';
import {
  ConflictException,
  DomainException,
  NotFoundException,
} from '../../common/exceptions/domain.exception.js';
import { ageAt, toIso, toIsoOrNull } from '../../common/mapping.js';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { AUTH_INSTANCE, type AuthInstance } from '../auth/auth.config.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { UpdateConsentDto, UpdateProfileDto } from './dto/update-profile.dto.js';
import { USER_INCLUDE, toUserDto } from './users.mapper.js';

/** The contest rules restrict entry to adults. */
const MINIMUM_AGE = 18;

/** What a successful registration hands back to the controller. */
export interface RegistrationResult {
  user: UserDto;
  /**
   * The raw `Response` Better Auth produced, carrying the `Set-Cookie` that opens the
   * session. The controller forwards its cookies so sign-up logs the customer straight in
   * rather than dropping them on a login form they just filled in.
   */
  authResponse: Response;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    @Inject(AUTH_INSTANCE) private readonly auth: AuthInstance
  ) {}

  private async findDtoOrThrow(userId: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: USER_INCLUDE,
    });

    if (!user) throw new NotFoundException('User', userId);
    return toUserDto(user);
  }

  /**
   * Registers a customer through the classic form.
   *
   * Better Auth owns the password hashing and the session; this method owns the three
   * rules it cannot know about — adulthood, mandatory acceptance of the rules, and
   * server-stamped consent timestamps.
   */
  async register(input: RegisterDto): Promise<RegistrationResult> {
    const now = new Date();
    const birthDate = new Date(input.birthDate);

    if (Number.isNaN(birthDate.getTime())) {
      throw new DomainException('INVALID_BIRTH_DATE', 'La date de naissance est invalide.', HttpStatus.BAD_REQUEST);
    }

    if (birthDate > now) {
      throw new DomainException(
        'INVALID_BIRTH_DATE',
        'La date de naissance ne peut pas être dans le futur.',
        HttpStatus.BAD_REQUEST
      );
    }

    if (ageAt(birthDate, now) < MINIMUM_AGE) {
      throw new DomainException(
        'MINOR_NOT_ALLOWED',
        `Le jeu-concours est réservé aux personnes majeures (${MINIMUM_AGE} ans et plus).`,
        HttpStatus.UNPROCESSABLE_ENTITY
      );
    }

    // Checked up front so the answer is a clean 409 rather than whatever Better Auth
    // returns for a duplicate — and so the message matches the one on the login link the
    // front end shows next to it.
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException(
        'EMAIL_ALREADY_REGISTERED',
        'Un compte existe déjà avec cette adresse électronique.'
      );
    }

    const authResponse = (await this.auth.api.signUpEmail({
      body: {
        email: input.email,
        password: input.password,
        // Required by Better Auth's core user schema; composed here so the column is
        // populated identically whichever way a customer signs up.
        name: `${input.firstName} ${input.lastName}`,
        firstName: input.firstName,
        lastName: input.lastName,
        gender: input.gender,
        birthDate,
        postalCode: input.postalCode,
        phone: input.phone,
      },
      asResponse: true,
    })) as Response;

    if (!authResponse.ok) {
      // Better Auth already rejected it — a password policy, a race on the email. Surface
      // its status rather than inventing one.
      const detail = await authResponse.text().catch(() => '');
      this.logger.warn(`Sign-up refused by Better Auth (${authResponse.status}): ${detail}`);
      throw new DomainException(
        'SIGNUP_REFUSED',
        'L’inscription a été refusée. Vérifiez vos informations et réessayez.',
        HttpStatus.BAD_REQUEST
      );
    }

    const created = await this.prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });

    if (!created) {
      throw new DomainException(
        'SIGNUP_FAILED',
        'L’inscription n’a pas pu être finalisée.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    /**
     * Stamps the consents, server-side.
     *
     * This cannot be part of the sign-up insert: the acceptance flags are declared
     * `input: false` on the Better Auth model precisely so a client cannot set them, which
     * also means the library never sees them. Hence a second write.
     *
     * If it fails, the just-created account is removed. A user row with no consent
     * timestamp is not an account we are allowed to keep: the timestamp is the only
     * enforceable proof that the rules and the terms were accepted. Better to make the
     * customer try again than to hold an account we cannot justify holding.
     */
    try {
      await this.prisma.user.update({
        where: { id: created.id },
        data: {
          termsAcceptedAt: now,
          contestRulesAcceptedAt: now,
          marketingConsent: input.marketingConsent,
          marketingConsentAt: input.marketingConsent ? now : null,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to stamp consents for ${created.id}; rolling the account back`,
        error instanceof Error ? error.stack : String(error)
      );

      await this.prisma.session.deleteMany({ where: { userId: created.id } }).catch(() => undefined);
      await this.prisma.account.deleteMany({ where: { userId: created.id } }).catch(() => undefined);
      await this.prisma.user.delete({ where: { id: created.id } }).catch(() => undefined);

      throw new DomainException(
        'SIGNUP_FAILED',
        'L’inscription n’a pas pu être finalisée. Merci de réessayer.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    this.logger.log(`User ${created.id} registered through the form`);

    return { user: await this.findDtoOrThrow(created.id), authResponse };
  }

  getMe(userId: string): Promise<UserDto> {
    return this.findDtoOrThrow(userId);
  }

  async updateProfile(userId: string, input: UpdateProfileDto): Promise<UserDto> {
    // Only the keys actually present are written: `undefined` means "leave alone",
    // `null` means "clear". Spreading the DTO straight into `data` would turn every
    // omitted optional field into a null and quietly wipe the profile.
    const data: Record<string, unknown> = {};

    if (input.firstName !== undefined) data['firstName'] = input.firstName;
    if (input.lastName !== undefined) data['lastName'] = input.lastName;
    if (input.phone !== undefined) data['phone'] = input.phone;
    if (input.gender !== undefined) data['gender'] = input.gender;
    if (input.postalCode !== undefined) data['postalCode'] = input.postalCode;
    if (input.birthDate !== undefined) {
      data['birthDate'] = input.birthDate === null ? null : new Date(input.birthDate);
    }

    // Keep Better Auth's display name consistent with the split fields when either moves.
    if (input.firstName !== undefined || input.lastName !== undefined) {
      const current = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true },
      });
      if (!current) throw new NotFoundException('User', userId);

      data['name'] = `${input.firstName ?? current.firstName} ${input.lastName ?? current.lastName}`;
    }

    await this.prisma.user.update({ where: { id: userId }, data });
    return this.findDtoOrThrow(userId);
  }

  /**
   * Grants or withdraws marketing consent.
   *
   * On withdrawal the timestamp is cleared as well as the flag: keeping a consent date
   * next to `marketingConsent: false` would read as "consented on this date", which is no
   * longer true. The withdrawal itself is traceable through the audit log.
   */
  async updateConsent(user: AuthenticatedUser, input: UpdateConsentDto): Promise<UserDto> {
    const now = new Date();

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        marketingConsent: input.marketingConsent,
        marketingConsentAt: input.marketingConsent ? now : null,
      },
    });

    return this.findDtoOrThrow(user.id);
  }

  /**
   * Personal data export — GDPR article 20, right to portability.
   *
   * Everything the platform holds about the customer, in a readable flat shape. Not a
   * database dump: `ipHash` is excluded because it is a derived anti-fraud signal rather
   * than personal data the customer provided, and exporting it would hand out the salted
   * hash of their address for no benefit to them.
   */
  async exportPersonalData(user: AuthenticatedUser, ip: string | undefined): Promise<PersonalDataExport> {
    const record = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        ...USER_INCLUDE,
        participations: {
          include: {
            ticketCode: { include: { prize: { select: { label: true } } } },
            redemption: { select: { issuedAt: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!record) throw new NotFoundException('User', user.id);

    await this.audit.record({
      userId: user.id,
      action: 'PERSONAL_DATA_EXPORTED',
      entity: 'User',
      entityId: user.id,
      ip,
    });

    return {
      exportedAt: new Date().toISOString(),
      account: toUserDto(record),
      participations: record.participations.map((participation) => ({
        ticketCode: participation.ticketCode.code,
        prizeLabel: participation.ticketCode.prize.label,
        prizeStatus: participation.prizeStatus,
        playedAt: toIso(participation.createdAt),
        claimDeadline: toIso(participation.claimDeadline),
        redeemedAt: toIsoOrNull(participation.redemption?.issuedAt),
      })),
      consents: [
        {
          kind: 'Conditions générales d’utilisation',
          granted: record.termsAcceptedAt !== null,
          grantedAt: toIsoOrNull(record.termsAcceptedAt),
        },
        {
          kind: 'Règlement du jeu-concours',
          granted: record.contestRulesAcceptedAt !== null,
          grantedAt: toIsoOrNull(record.contestRulesAcceptedAt),
        },
        {
          kind: 'Communications commerciales',
          granted: record.marketingConsent,
          grantedAt: toIsoOrNull(record.marketingConsentAt),
        },
      ],
    };
  }

  /**
   * Right to erasure — GDPR article 17 — implemented as **anonymisation, not deletion**.
   *
   * The tension is real and the resolution is the defensible part. Article 17.3(b) and (e)
   * let a controller keep data where processing is necessary for a legal obligation or for
   * the establishment of legal claims. A contest overseen by a bailiff is exactly that: the
   * participations have to stay countable and auditable, or the 60/20/10/6/4% split can no
   * longer be demonstrated, and a prize handed over can no longer be proved.
   *
   * So the identifying data goes and the participation stays:
   *   - email is replaced by an irreversible, collision-free placeholder derived from the
   *     user id — a random one could collide, and the column is unique;
   *   - name, phone, postcode are cleared; gender and birth date are kept in the
   *     aggregated statistics only through rows that no longer identify anyone;
   *   - sessions and OAuth accounts are deleted, so the account cannot be signed into;
   *   - `anonymizedAt` records when, which is itself an accountability obligation.
   *
   * Written down in the legality section of the specification (part H).
   */
  async anonymize(user: AuthenticatedUser, ip: string | undefined): Promise<{ anonymizedAt: string }> {
    const record = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, anonymizedAt: true },
    });

    if (!record) throw new NotFoundException('User', user.id);

    if (record.anonymizedAt) {
      throw new ConflictException('ALREADY_ANONYMIZED', 'Ce compte a déjà été anonymisé.');
    }

    const now = new Date();
    // Derived from the user id, so it is deterministic (replaying the operation is a
    // no-op) and unique (the id is unique), which a random string would not guarantee.
    const emailPlaceholder = `anonyme-${createHash('sha256')
      .update(record.id)
      .digest('hex')
      .slice(0, 24)}@anonymise.invalid`;

    await this.prisma.$transaction(async (tx) => {
      await tx.session.deleteMany({ where: { userId: record.id } });
      await tx.account.deleteMany({ where: { userId: record.id } });

      await tx.user.update({
        where: { id: record.id },
        data: {
          email: emailPlaceholder,
          emailVerified: false,
          name: 'Compte anonymisé',
          firstName: 'Compte',
          lastName: 'anonymisé',
          phone: null,
          postalCode: null,
          image: null,
          // Withdraw from the mailing base as part of the same operation: an anonymised
          // account must not keep receiving commercial email.
          marketingConsent: false,
          marketingConsentAt: null,
          anonymizedAt: now,
          deletedAt: now,
        },
      });
    });

    await this.audit.record({
      userId: record.id,
      action: 'ACCOUNT_ANONYMIZED',
      entity: 'User',
      entityId: record.id,
      ip,
    });

    this.logger.log(`User ${record.id} anonymised`);

    return { anonymizedAt: now.toISOString() };
  }

  /**
   * Expires prizes that were never claimed.
   *
   * The brief gives 30 days after closing to claim. Past that, a prize still marked
   * TO_CLAIM is neither true nor useful — the statistics would count it as outstanding
   * forever. Called by the scheduled job rather than computed on read, so that the status
   * stored in the database is the status in force.
   */
  async expireUnclaimedPrizes(): Promise<number> {
    const result = await this.prisma.participation.updateMany({
      where: { prizeStatus: 'TO_CLAIM', claimDeadline: { lt: new Date() } },
      data: { prizeStatus: 'EXPIRED' },
    });

    if (result.count > 0) this.logger.log(`${result.count} unclaimed prize(s) expired`);
    return result.count;
  }
}
