import { NextResponse, type NextRequest } from 'next/server';
import { ApiError, getMailingCsv, getMailingRows } from '@theetiptop-contest/api-client/server';

/**
 * Streams the opt-in mailing base as a download.
 *
 * A route handler rather than a server action, because the result is a file: an action
 * returns a value to a React component, and turning that into a download means building a
 * Blob client-side and clicking a synthetic anchor. Here `Content-Disposition` does it.
 *
 * The API is what filters on consent, minimises the columns and writes the audit entry.
 * This handler only forwards, which is why there is no business logic below.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const format = request.nextUrl.searchParams.get('format') === 'json' ? 'json' : 'csv';
  const stamp = new Date().toISOString().slice(0, 10);

  try {
    if (format === 'json') {
      const rows = await getMailingRows();
      return new NextResponse(JSON.stringify(rows, null, 2), {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="base-emailing-${stamp}.json"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    const csv = await getMailingCsv();
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="base-emailing-${stamp}.csv"`,
        // An export of personal data has no business sitting in any cache.
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    if (ApiError.is(error) && (error.status === 401 || error.status === 403)) {
      return NextResponse.redirect(new URL('/connexion', request.nextUrl.origin));
    }

    throw error;
  }
}
