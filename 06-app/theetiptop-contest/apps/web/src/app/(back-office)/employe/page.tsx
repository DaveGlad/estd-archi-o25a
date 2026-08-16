import type { Metadata } from 'next';
import { Container } from '../../../components/layout/container';
import { CustomerSearch } from '../../../components/back-office/customer-search';
import { Alert } from '../../../components/ui/alert';
import { currentEmployee, getStore } from '../../../lib/mock';

export const metadata: Metadata = {
  title: 'Rechercher un client',
  robots: { index: false, follow: false },
};

export default function EmployePage() {
  const employee = currentEmployee();
  const store = getStore(employee.storeId);

  return (
    <Container className="py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold tracking-[0.14em] text-accent-strong uppercase">
          Espace boutique, {store?.name}
        </p>
        <h1 className="mt-2 font-serif text-3xl">Remise des lots</h1>
        <p className="mt-2 max-w-2xl text-fg-muted">
          Recherchez le client, vérifiez son identité, remettez le lot, puis
          enregistrez la remise.
        </p>
      </header>

      <CustomerSearch />

      <div className="mt-8 max-w-3xl">
        <Alert tone="info" title="Ce que vous voyez, et ce que vous ne voyez pas">
          <p>
            Cet écran n&apos;affiche que les informations nécessaires à la remise d&apos;un
            lot. La date de naissance, les préférences de communication et
            l&apos;historique complet du client ne vous sont pas accessibles.
          </p>
        </Alert>
      </div>
    </Container>
  );
}
