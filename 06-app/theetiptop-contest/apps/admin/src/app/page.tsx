import { redirect } from 'next/navigation';

/**
 * The back office has no landing page of its own.
 *
 * Routes are kept at `/admin/...` and `/employe/...` rather than hoisted to the root of
 * this application, deliberately: those are the paths the screens were built and linked
 * against, and renaming them would break every internal link for no gain. The root is
 * therefore a redirect rather than a duplicate dashboard.
 *
 * Which of the two a signed-in user actually belongs on is decided by the session: the
 * `/admin` layout sends an EMPLOYEE on to `/employe`.
 */
export default function BackOfficeRoot() {
  redirect('/admin');
}
