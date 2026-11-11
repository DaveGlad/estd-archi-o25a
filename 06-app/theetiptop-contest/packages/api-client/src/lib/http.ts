/**
 * Low-level HTTP layer for API v1.
 *
 * Everything the front ends read or write goes through here. No `fetch` call to the API
 * is written anywhere else, which is what makes the error envelope, the base URL
 * resolution and the cache policy decisions taken once rather than per page.
 */

/** Error envelope every API v1 endpoint returns. Mirrors `ApiErrorBody` on the API side. */
export interface ApiErrorBody {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  path: string;
  timestamp: string;
}

/**
 * A non-2xx answer from the API.
 *
 * Carries the machine-readable `code` rather than only the status, because that is what
 * the screens branch on: `ALREADY_REDEEMED` and `CLAIM_WINDOW_CLOSED` are both 409 and
 * need different messages.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** Narrowing helper, so a caller can write `if (ApiError.is(error, 'ALREADY_REDEEMED'))`. */
  static is(error: unknown, code?: string): error is ApiError {
    return error instanceof ApiError && (code === undefined || error.code === code);
  }
}

/**
 * Resolves the API base URL.
 *
 * Two variables on purpose:
 *   - `API_URL` is the address the **server** uses. Inside Docker that is the compose
 *     service name (`http://api:3333`), which is unreachable from a browser.
 *   - `NEXT_PUBLIC_API_URL` is the public address, baked into the client bundle.
 *
 * Collapsing them into one would mean either the server routing its calls out through the
 * public reverse proxy and back — a pointless round trip on every page render — or the
 * browser being handed a hostname that only resolves inside the Docker network.
 */
function resolveBaseUrl(): string {
  const serverSide = typeof window === 'undefined';

  const url = serverSide
    ? (process.env['API_URL'] ?? process.env['NEXT_PUBLIC_API_URL'])
    : process.env['NEXT_PUBLIC_API_URL'];

  if (!url) {
    throw new Error(
      'API base URL is not configured. Set API_URL (server) and NEXT_PUBLIC_API_URL (browser).'
    );
  }

  return url.replace(/\/$/, '');
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /**
   * Raw `Cookie` header to forward. Server-side only: a server component has no ambient
   * cookie jar, so the session has to be passed along explicitly or the API answers 401.
   */
  cookie?: string;
  /**
   * Next.js revalidation window, in seconds. `false` opts out of caching entirely.
   *
   * No default is applied here. Next 16 does not cache by default, and a default chosen
   * in this layer would be invisible at the call sites that actually know whether a
   * figure can be a minute old.
   */
  revalidate?: number | false;
  /** Cache tags, so a mutation can invalidate exactly what it changed. */
  tags?: string[];
  /** Query parameters. `undefined` values are dropped rather than serialised as "undefined". */
  query?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(path: string, query: RequestOptions['query']): string {
  const url = new URL(`${resolveBaseUrl()}/v1${path.startsWith('/') ? path : `/${path}`}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  return url.toString();
}

/**
 * Performs one API call and returns the parsed body.
 *
 * Throws `ApiError` on a non-2xx answer rather than returning a result union. The reason
 * is the division of labour with the screens: the business outcomes that are not errors —
 * the six branches of playing a code — are returned by the API as 200 with a discriminated
 * union, so anything that does reach this branch genuinely is exceptional and belongs in a
 * `catch`, not in every call site's happy path.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, cookie, revalidate, tags, query } = options;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (cookie) headers['Cookie'] = cookie;

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    // Makes the browser send the session cookie on cross-origin calls. Harmless
    // server-side, where the cookie travels in the explicit header above.
    credentials: 'include',
    ...(revalidate === undefined ? {} : { next: { revalidate: revalidate === false ? 0 : revalidate } }),
    ...(tags ? { next: { revalidate: revalidate === false ? 0 : revalidate, tags } } : {}),
  });

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  const payload: unknown = text ? safeParse(text) : null;

  if (!response.ok) {
    const envelope = payload as Partial<ApiErrorBody> | null;
    throw new ApiError(
      response.status,
      envelope?.code ?? 'HTTP_ERROR',
      envelope?.message ?? `L’API a répondu ${response.status}.`,
      envelope?.details
    );
  }

  return payload as T;
}

/** Non-JSON error pages (a 502 from the reverse proxy) must not crash the parser. */
function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { code: 'INVALID_RESPONSE', message: text.slice(0, 200) };
  }
}

/** Fetches a plain-text body: used by the CSV mailing export. */
export async function apiFetchText(path: string, options: RequestOptions = {}): Promise<string> {
  const headers: Record<string, string> = { Accept: 'text/csv, application/json' };
  if (options.cookie) headers['Cookie'] = options.cookie;

  const response = await fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers,
    credentials: 'include',
    cache: 'no-store',
  });

  const text = await response.text();

  if (!response.ok) {
    const envelope = safeParse(text) as Partial<ApiErrorBody> | null;
    throw new ApiError(
      response.status,
      envelope?.code ?? 'HTTP_ERROR',
      envelope?.message ?? `L’API a répondu ${response.status}.`
    );
  }

  return text;
}
