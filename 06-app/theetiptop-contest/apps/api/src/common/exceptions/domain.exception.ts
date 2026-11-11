import { HttpStatus } from '@nestjs/common';

/**
 * A broken business rule, as opposed to a broken HTTP contract.
 *
 * `deal-israel` convention: services throw `DomainException`, never `HttpException`.
 * The service layer stays free of any HTTP vocabulary, which is what lets the same
 * service be called from a controller, from a seed script or from a scheduled job. The
 * translation to a status code happens in exactly one place, `DomainExceptionFilter`.
 *
 * `code` is a stable machine-readable identifier. It is what the front ends branch on;
 * `message` is only ever for a human reading a log or a Swagger example.
 */
export class DomainException extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY,
    readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = new.target.name;
  }
}

/** The requested resource does not exist, or the caller may not know that it does. */
export class NotFoundException extends DomainException {
  constructor(entity: string, identifier?: string) {
    super(
      'NOT_FOUND',
      identifier ? `${entity} "${identifier}" not found` : `${entity} not found`,
      HttpStatus.NOT_FOUND
    );
  }
}

/** The caller is authenticated but lacks the role the operation requires. */
export class ForbiddenException extends DomainException {
  constructor(message = 'You are not allowed to perform this action') {
    super('FORBIDDEN', message, HttpStatus.FORBIDDEN);
  }
}

/** No valid session, and the endpoint is not public. */
export class UnauthorizedException extends DomainException {
  constructor(message = 'Authentication required') {
    super('UNAUTHORIZED', message, HttpStatus.UNAUTHORIZED);
  }
}

/**
 * The operation conflicts with the current state: a code already played, a prize already
 * handed over, a draw already run. 409 rather than 422: the request was well formed, the
 * world simply moved on.
 */
export class ConflictException extends DomainException {
  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(code, message, HttpStatus.CONFLICT, details);
  }
}

/** Too many attempts. Carries the wait so the client can show a precise message. */
export class RateLimitedException extends DomainException {
  constructor(retryAfterSeconds: number) {
    super('RATE_LIMITED', 'Too many attempts, please try again later', HttpStatus.TOO_MANY_REQUESTS, {
      retryAfterSeconds,
    });
  }
}
