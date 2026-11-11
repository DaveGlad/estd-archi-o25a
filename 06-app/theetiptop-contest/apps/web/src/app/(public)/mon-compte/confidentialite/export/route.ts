import { NextResponse } from 'next/server';
import { ApiError, getMyPersonalData } from '@theetiptop-contest/api-client/server';

/**
 * Downloads the customer's personal data — GDPR article 20, right to portability.
 *
 * A route handler rather than a server action, because the result is a **file**. A server
 * action returns a value to a React component; producing a download from one means
 * building a Blob in the browser and clicking a synthetic anchor. A route handler sets
 * `Content-Disposition` and the browser does the rest.
 *
 * The API is what assembles and audits the export; this handler only forwards it with the
 * headers that make it a download.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const data = await getMyPersonalData();
    const stamp = new Date().toISOString().slice(0, 10);

    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="mes-donnees-theetiptop-${stamp}.json"`,
        // A copy of somebody's personal data has no business in any cache.
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    if (ApiError.is(error) && error.status === 401) {
      return NextResponse.redirect(
        new URL('/connexion?next=/mon-compte/confidentialite', process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000')
      );
    }

    throw error;
  }
}
