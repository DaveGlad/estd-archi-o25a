import type { Metadata } from 'next';
import { MapPin, Phone } from 'lucide-react';
import { Container, PageHeader } from '@theetiptop-contest/ui/container';
import { Badge } from '@theetiptop-contest/ui/badge';
import { Card, CardBody } from '@theetiptop-contest/ui/card';
import { formatDate } from '@theetiptop-contest/ui/utils';
import { getStores } from '@theetiptop-contest/api-client/server';

export const metadata: Metadata = {
  title: 'Nos boutiques',
  description:
    'Retrouvez nos dix boutiques Thé Tip Top, de Paris à Nice, et venez y retirer votre lot.',
};

export default async function BoutiquesPage() {
  const stores = await getStores();

  // The Nice store first: its opening is the reason for the whole operation, and its badge
  // is the first thing a visitor should see here.
  const sorted = [...stores].sort((a, b) => Number(b.isNew) - Number(a.isNew));

  return (
    <>
      <PageHeader
        eyebrow="Thé Tip Top"
        title="Nos boutiques"
        intro="Dix adresses où découvrir nos thés et retirer les lots du jeu-concours."
      />

      <Container className="py-14">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((store) => (
            <li key={store.id}>
              <Card className="h-full">
                <CardBody className="space-y-3">
                  {store.isNew && <Badge tone="success">Nouvelle boutique</Badge>}
                  <h2 className="font-serif text-xl">{store.name}</h2>
                  <address className="space-y-2 text-base text-fg-muted not-italic">
                    <span className="flex gap-2">
                      <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      <span>
                        {store.address}
                        <br />
                        {store.postalCode} {store.city}
                      </span>
                    </span>
                    {/* Nullable on the API contract, unlike the mock it replaced: a store
                        may legitimately have no published phone number. */}
                    {store.phone && (
                      <span className="flex gap-2">
                        <Phone className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                        <a href={`tel:${store.phone.replace(/\s/g, '')}`}>{store.phone}</a>
                      </span>
                    )}
                  </address>
                  {store.openedAt && (
                    <p className="text-sm text-fg-muted">
                      Ouverte depuis le {formatDate(store.openedAt)}
                    </p>
                  )}
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
