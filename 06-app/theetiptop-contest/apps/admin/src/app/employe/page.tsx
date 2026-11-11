import type { Metadata } from 'next';
import { Container } from '@theetiptop-contest/ui/container';
import { Alert } from '@theetiptop-contest/ui/alert';
import { getStores } from '@theetiptop-contest/api-client/server';

import { CustomerSearch } from '../../components/back-office/customer-search';
import { requireRole } from '../../lib/require-role';

export const metadata: Metadata = {
  title: 'Rechercher un client',
  robots: { index: false, follow: false },
};

export default async function EmployePage() {
  const [employee, stores] = await Promise.all([requireRole('EMPLOYEE', 'ADMIN'), getStores()]);
  const store = stores.find((candidate) => candidate.id === employee.storeId);

  return (
    <Container className="py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold tracking-[0.14em] text-accent-strong uppercase">
          {/* An administrator opening this screen is attached to no store, so the eyebrow
              says so rather than rendering "Espace boutique, undefined". */}
          {store ? `Espace boutique, ${store.name}` : 'Espace boutique'}
        </p>
        <h1 className="mt-2 font-serif text-3xl">Remise des lots</h1>
        <p className="mt-2 max-w-2xl text-fg-muted">
          Recherchez le client, vérifiez son identité, remettez le lot, puis enregistrez la
          remise.
        </p>
      </header>

      <CustomerSearch />

      <div className="mt-8 max-w-3xl space-y-4">
        <Alert tone="info" title="Ce que vous voyez, et ce que vous ne voyez pas">
          <p>
            Cet écran n&apos;affiche que les informations nécessaires à la remise d&apos;un
            lot. La date de naissance, les préférences de communication et le détail du
            profil du client ne vous sont pas accessibles — l&apos;API elle-même ne les
            renvoie pas à un compte employé.
          </p>
        </Alert>

        {!store && employee.role === 'ADMIN' && (
          <Alert tone="warning" title="Compte administrateur">
            <p>
              Votre compte n&apos;est rattaché à aucune boutique. Vous pouvez consulter les
              gains d&apos;un client, mais une remise enregistrée depuis ce compte ne sera
              associée à aucun point de vente.
            </p>
          </Alert>
        )}
      </div>
    </Container>
  );
}
