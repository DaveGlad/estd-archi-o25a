'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Search, UserX } from 'lucide-react';
import { Alert } from '../ui/alert';
import { Button } from '../ui/button';
import { Card, CardBody } from '../ui/card';
import { Field } from '../ui/field';
import { Input } from '../ui/input';
import { participationsOf, searchCustomers } from '../../lib/mock';
import type { User } from '../../lib/mock';

export function CustomerSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[] | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setResults(searchCustomers(query));
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
            <div className="min-w-64 flex-1">
              <Field
                label="Rechercher un client"
                htmlFor="q"
                hint="Par nom, adresse de courriel, ou code figurant sur le ticket."
              >
                <Input
                  id="q"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="camille, camille@..., A7K2M9QX41"
                  autoComplete="off"
                />
              </Field>
            </div>
            <Button type="submit" size="lg">
              <Search className="size-4" aria-hidden="true" />
              Rechercher
            </Button>
          </form>
        </CardBody>
      </Card>

      <div aria-live="polite">
        {results !== null && results.length === 0 && (
          <Alert tone="warning" title="Aucun client trouvé">
            <p>
              Vérifiez l&apos;orthographe, ou demandez au client le code figurant sur
              son ticket de caisse.
            </p>
          </Alert>
        )}

        {results !== null && results.length > 0 && (
          <>
            <p className="mb-3 text-sm text-fg-muted">
              {results.length} client(s) trouvé(s)
            </p>
            <ul className="space-y-3">
              {results.map((customer) => {
                const items = participationsOf(customer.id);
                const toClaim = items.filter((p) => p.prizeStatus === 'TO_CLAIM');
                return (
                  <li key={customer.id}>
                    <Card>
                      <CardBody className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">
                            {customer.firstName} {customer.lastName}
                          </p>
                          <p className="mt-0.5 text-sm text-fg-muted">
                            {customer.email}
                          </p>
                          <p className="mt-1 text-sm text-fg-muted">
                            {items.length} code(s) joué(s), {toClaim.length} lot(s) à
                            remettre
                          </p>
                        </div>
                        <Link
                          href={`/employe/client/${customer.id}`}
                          className="inline-flex items-center gap-2 text-sm font-medium underline"
                        >
                          Voir ses gains
                          <ArrowRight className="size-4" aria-hidden="true" />
                        </Link>
                      </CardBody>
                    </Card>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {results === null && (
          <Card>
            <CardBody className="flex flex-col items-center gap-3 py-12 text-center">
              <UserX className="size-8 text-fg-muted" aria-hidden="true" />
              <p className="text-sm text-fg-muted">
                Lancez une recherche pour afficher les gains d&apos;un client.
              </p>
              <p className="text-xs text-fg-muted">
                Données simulées, essayez « camille », « theo » ou « leila ».
              </p>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
