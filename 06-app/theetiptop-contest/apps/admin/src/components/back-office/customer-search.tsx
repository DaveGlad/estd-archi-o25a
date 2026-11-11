'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { ArrowRight, Loader2, Search, UserX } from 'lucide-react';
import type { CustomerSearchResultDto } from '@theetiptop-contest/shared';
import { Alert } from '@theetiptop-contest/ui/alert';
import { Button } from '@theetiptop-contest/ui/button';
import { Card, CardBody } from '@theetiptop-contest/ui/card';
import { Field } from '@theetiptop-contest/ui/field';
import { Input } from '@theetiptop-contest/ui/input';

import { searchCustomersAction } from '../../app/employe/actions';

/** Below this, a query matches too much of the base to be useful. Mirrors the API's own floor. */
const MIN_QUERY_LENGTH = 2;

export function CustomerSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CustomerSearchResultDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setError(`Saisissez au moins ${MIN_QUERY_LENGTH} caractères.`);
      setResults(null);
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await searchCustomersAction(trimmed);

      if (!result.ok) {
        setError(result.message);
        setResults(null);
        return;
      }

      setResults(result.customers);
    });
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
                error={error ?? undefined}
              >
                <Input
                  id="q"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="rousseau, camille@…, A7K2M9QX41"
                  autoComplete="off"
                />
              </Field>
            </div>
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Recherche
                </>
              ) : (
                <>
                  <Search className="size-4" aria-hidden="true" />
                  Rechercher
                </>
              )}
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Polite live region: the employee is looking at the screen, and an assertive one
          would cut off whatever a screen reader is mid-way through announcing. */}
      <div aria-live="polite">
        {results !== null && results.length === 0 && (
          <Alert tone="warning" title="Aucun client trouvé">
            <p>
              Vérifiez l&apos;orthographe, ou demandez au client le code figurant sur son
              ticket de caisse : une recherche par code est exacte et sans ambiguïté.
            </p>
          </Alert>
        )}

        {results !== null && results.length > 0 && (
          <>
            <p className="mb-3 text-sm text-fg-muted">
              {results.length} client{results.length > 1 ? 's' : ''} trouvé
              {results.length > 1 ? 's' : ''}
            </p>
            <ul className="space-y-3">
              {results.map((customer) => (
                <li key={customer.id}>
                  <Card>
                    <CardBody className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <p className="mt-0.5 text-sm text-fg-muted">{customer.email}</p>
                        <p className="mt-1 text-sm text-fg-muted">
                          {customer.participations.length} code
                          {customer.participations.length > 1 ? 's' : ''} joué
                          {customer.participations.length > 1 ? 's' : ''},{' '}
                          <strong className="text-fg">{customer.prizesToClaim}</strong> lot
                          {customer.prizesToClaim > 1 ? 's' : ''} à remettre
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
              ))}
            </ul>
          </>
        )}

        {results === null && !error && (
          <Card>
            <CardBody className="flex flex-col items-center gap-3 py-12 text-center">
              <UserX className="size-8 text-fg-muted" aria-hidden="true" />
              <p className="text-sm text-fg-muted">
                Lancez une recherche pour afficher les gains d&apos;un client.
              </p>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
