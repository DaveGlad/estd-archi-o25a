import { getCurrentUser } from '@theetiptop-contest/api-client/server';

import { SiteFooter } from '../../components/layout/site-footer';
import { SiteHeader } from '../../components/layout/site-header';

/**
 * Resolves the session once, server-side, and hands the result to the header.
 *
 * The header could call Better Auth's `useSession()` in the browser instead, but that
 * means the first paint shows the signed-out state and then flips — on every page, for
 * every signed-in visitor. Reading it here renders the right header immediately.
 */
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#contenu" className="skip-link bg-primary px-4 py-2 text-primary-fg">
        Aller au contenu principal
      </a>
      <SiteHeader
        user={user ? { firstName: user.firstName, role: user.role } : null}
      />
      <main id="contenu" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
