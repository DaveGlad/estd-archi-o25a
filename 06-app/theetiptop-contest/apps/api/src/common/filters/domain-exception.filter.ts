import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { DomainException } from '../exceptions/domain.exception.js';

/** Error envelope every API v1 endpoint returns. Documented once in Swagger. */
export interface ApiErrorBody {
  /** Stable machine-readable identifier, e.g. `ALREADY_USED`. */
  code: string;
  message: string;
  details?: Record<string, unknown>;
  /** Echoed back so a customer support ticket can be traced in the logs. */
  path: string;
  timestamp: string;
}

/**
 * The single place where an exception becomes an HTTP response.
 *
 * Catches everything, on purpose: an uncaught error leaking a stack trace to the browser
 * is an information disclosure, and the brief's security section commits us to not doing
 * that. Unknown errors are logged in full and answered with a bare 500.
 */
@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const body = this.toErrorBody(exception, request.url);
    const status = this.toStatus(exception);

    // `Retry-After` is the standard way to tell a client to come back later; the browser
    // and any till client understand it without reading our payload.
    const retryAfter = body.details?.['retryAfterSeconds'];
    if (status === HttpStatus.TOO_MANY_REQUESTS && typeof retryAfter === 'number') {
      response.setHeader('Retry-After', String(retryAfter));
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception)
      );
    }

    response.status(status).json(body);
  }

  private toStatus(exception: unknown): number {
    if (exception instanceof DomainException) return exception.status;
    if (exception instanceof HttpException) return exception.getStatus();
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private toErrorBody(exception: unknown, path: string): ApiErrorBody {
    const timestamp = new Date().toISOString();

    if (exception instanceof DomainException) {
      return {
        code: exception.code,
        message: exception.message,
        details: exception.details,
        path,
        timestamp,
      };
    }

    if (exception instanceof HttpException) {
      const payload = exception.getResponse();
      // ValidationPipe answers with `{ message: string[], error, statusCode }`; surface the
      // field-level messages rather than flattening them into one unreadable string.
      const details =
        typeof payload === 'object' && payload !== null && 'message' in payload
          ? { validation: (payload as { message: unknown }).message }
          : undefined;

      return {
        code: this.httpStatusToCode(exception.getStatus()),
        message: exception.message,
        details,
        path,
        timestamp,
      };
    }

    // Deliberately opaque: the real cause is in the log, not in the response.
    return {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      path,
      timestamp,
    };
  }

  private httpStatusToCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'RATE_LIMITED';
      default:
        return 'HTTP_ERROR';
    }
  }
}
