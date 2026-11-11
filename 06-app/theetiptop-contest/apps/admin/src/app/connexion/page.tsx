import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { Alert } from '@theetiptop-contest/ui/alert';
import { Card, CardBody } from '@theetiptop-contest/ui/card';
import { Logo } from '@theetiptop-contest/ui/logo';
import { getCurrentUser } from '@theetiptop-contest/api-client/server';

import { StaffLoginForm } from '../../components/auth/staff-login-form';

export const metadata: Metadata = {
  title: 'Connexion au back-office',
  robots: { index: false, follow: false },
};

/**
 * Back-office sign-in.
 *
 * Email and password only — no Google, no Facebook. The two social providers exist for
 * customers, who sign up in a hurry from a receipt. A staff account that grants access to
 * every customer's name, email and prize history should not depend on a third-party
 * identity provider whose account recovery we do not control.
 */
export default async function BackOfficeLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, user] = await Promise.all([searchParams, getCurrentUser()]);

  // Already signed in as staff: straight to the right area.
  if (user?.role === 'ADMIN') redirect('/admin');
  if (user?.role === 'EMPLOYEE') redirect('/employe');

  return (
    <main className="grid min-h-screen place-items-center bg-bg px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo />
        </div>

        <Card>
          <CardBody className="space-y-6">
            <div>
              <h1 className="font-serif text-2xl">Back-office</h1>
              <p className="mt-1 text-sm text-fg-muted">
                Réservé aux administrateurs et aux employés des boutiques Thé Tip Top.
              </p>
            </div>

            {/* A customer who reached a back-office URL. The message says the area is for
                staff rather than "forbidden", which would leave them wondering whether
                their own account is broken. */}
            {error === 'forbidden' && (
              <Alert tone="warning" title="Accès réservé au personnel">
                <p>
                  Votre compte client n&apos;a pas accès au back-office. Vos gains se
                  consultent depuis votre espace personnel sur le site.
                </p>
              </Alert>
            )}

            <StaffLoginForm />
          </CardBody>
        </Card>

        <p className="flex items-start gap-2 text-xs text-fg-muted">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Les actions sensibles — remise d&apos;un lot, export de la base, tirage du gros
          lot — sont journalisées avec votre identité.
        </p>
      </div>
    </main>
  );
}
