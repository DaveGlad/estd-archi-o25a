'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { Gift, Loader2, PartyPopper } from 'lucide-react';
import { Alert } from '../ui/alert';
import { Button, ButtonLink } from '../ui/button';
import { Card, CardBody } from '../ui/card';
import { Field } from '../ui/field';
import { Input } from '../ui/input';
import { submitCode } from '../../lib/mock';
import type { SubmitCodeResult } from '../../lib/mock';
import { formatDate, formatDateTime, formatPrice } from '../../lib/utils';

export function CodeForm() {
  const [code, setCode] = useState('');
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<SubmitCodeResult | null>(null);
  const liveRef = useRef<HTMLDivElement>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    // Simulated latency so the loading state is visible in the mock.
    window.setTimeout(() => {
      setResult(submitCode(code));
      setPending(false);
      liveRef.current?.focus();
    }, 450);
  }

  function reset() {
    setCode('');
    setResult(null);
  }

  const fieldError =
    result?.outcome === 'INVALID_FORMAT'
      ? 'Le code comporte exactement 10 caractères, lettres et chiffres.'
      : undefined;

  if (result?.outcome === 'WON') {
    return (
      <Card className="overflow-hidden">
        <div className="bg-primary px-7 py-8 text-primary-fg">
          <PartyPopper className="size-7" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium opacity-90">Vous avez gagné</p>
          <h2 className="mt-1 font-serif text-3xl">{result.prize.label}</h2>
          <p className="mt-2 text-sm opacity-90">
            D&apos;une valeur de {formatPrice(result.prize.valueCents)}
          </p>
        </div>
        <CardBody className="space-y-5">
          <p className="text-sm text-fg-muted">{result.prize.description}</p>

          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-fg-muted">Code joué</dt>
              <dd className="font-mono text-sm tracking-wider">
                {result.participation.ticketCode}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-fg-muted">À réclamer avant le</dt>
              <dd className="text-sm">
                {formatDate(result.participation.claimDeadline)}
              </dd>
            </div>
          </dl>

          <Alert tone="success" title="Confirmation envoyée">
            <p>
              Un courriel récapitulatif vient de vous être envoyé. Votre lot est
              également disponible dans votre espace personnel.
            </p>
          </Alert>

          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/mon-compte">Voir mes gains</ButtonLink>
            <Button variant="secondary" onClick={reset}>
              Saisir un autre code
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Field
              label="Code de votre ticket"
              htmlFor="code"
              required
              hint="10 caractères, lettres et chiffres, imprimés en bas de votre ticket de caisse."
              error={fieldError}
            >
              <Input
                id="code"
                name="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={10}
                autoComplete="off"
                inputMode="text"
                spellCheck={false}
                placeholder="A7K2M9QX41"
                aria-invalid={fieldError ? true : undefined}
                aria-describedby={
                  fieldError ? 'code-error code-hint' : 'code-hint'
                }
                className="font-mono text-lg tracking-[0.3em] uppercase"
              />
            </Field>

            <Button type="submit" size="lg" disabled={pending || code.length === 0}>
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Vérification
                </>
              ) : (
                <>
                  <Gift className="size-4" aria-hidden="true" />
                  Découvrir mon lot
                </>
              )}
            </Button>
          </form>
        </CardBody>
      </Card>

      <div ref={liveRef} tabIndex={-1} aria-live="polite">
        {result?.outcome === 'UNKNOWN_CODE' && (
          <Alert tone="error" title="Ce code n'est pas valide">
            <p>
              Vérifiez la saisie, en particulier les caractères qui se ressemblent.
              Si le problème persiste, contactez-nous avec une photo de votre ticket.
            </p>
          </Alert>
        )}

        {result?.outcome === 'ALREADY_USED' && (
          <Alert tone="warning" title="Ce code a déjà été joué">
            <p>
              Il a été utilisé le {formatDateTime(result.usedAt)}.
              {result.byCurrentUser ? (
                <>
                  {' '}
                  Le lot correspondant se trouve dans{' '}
                  <Link href="/mon-compte" className="underline">
                    votre espace personnel
                  </Link>
                  .
                </>
              ) : (
                ' Chaque code ne peut être utilisé qu’une seule fois.'
              )}
            </p>
          </Alert>
        )}

        {result?.outcome === 'CONTEST_CLOSED' && (
          <Alert tone="warning" title="Le jeu est terminé">
            <p>
              Les participations étaient ouvertes jusqu&apos;au{' '}
              {formatDate(result.endsAt)}. Les lots déjà gagnés restent réclamables
              depuis votre espace personnel.
            </p>
          </Alert>
        )}

        {result?.outcome === 'RATE_LIMITED' && (
          <Alert tone="error" title="Trop de tentatives">
            <p>
              Par sécurité, la saisie est suspendue pendant{' '}
              {result.retryInMinutes} minutes. Cette limite protège le jeu contre les
              tentatives automatisées.
            </p>
          </Alert>
        )}
      </div>

      <Alert tone="info" title="Codes de démonstration">
        <p>
          Cette version fonctionne sur des données simulées. Essayez{' '}
          <code className="font-mono">A7K2M9QX41</code> pour un gain,{' '}
          <code className="font-mono">F8N4X2KC63</code> pour un code déjà joué,{' '}
          <code className="font-mono">XXXXXXXXXX</code> pour un code inconnu, ou{' '}
          <code className="font-mono">ZZZZZZZZZZ</code> pour la limitation de
          tentatives.
        </p>
      </Alert>
    </div>
  );
}
