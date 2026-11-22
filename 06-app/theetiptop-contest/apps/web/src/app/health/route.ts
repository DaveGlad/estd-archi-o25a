import { NextResponse } from 'next/server';

/**
 * Liveness probe for the container, and nothing else.
 *
 * The image used to probe `/` instead. That reads as the stronger check and is the wrong
 * one: the home page server-renders the running contest, so it answers 500 whenever the
 * database holds no contest -- which is exactly the state a freshly migrated environment is
 * in. The deployment then reported `container ... is unhealthy` and rolled itself back, for
 * a problem no rollback can fix, two stages before the one that seeds the data.
 *
 * A liveness probe answers one question: is this process serving HTTP. Whether the data
 * behind it is right is a different question, and the functional suite is where it is asked
 * -- against the deployed environment, with assertions on what the page actually shows.
 *
 * No database, no API call, no `fetch`. A probe that depends on another service turns that
 * service's outage into a restart loop here.
 */

// `force-dynamic`, so the route is not prerendered into a static response at build time.
// A cached 200 would keep answering after the server had stopped being able to serve.
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({ status: 'ok' });
}
