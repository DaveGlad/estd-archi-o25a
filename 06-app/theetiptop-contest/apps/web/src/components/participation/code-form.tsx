'use client';

import Link from 'next/link';
import { useRef, useState, useTransition } from 'react';
import { Loader2, PartyPopper, ScanLine } from 'lucide-react';
import { Alert } from '@theetiptop-contest/ui/alert';
import { Button, ButtonLink } from '@theetiptop-contest/ui/button';
import { formatDate, formatDateTime, formatPrice } from '@theetiptop-contest/ui/utils';

import { StubLine, TicketStub } from './ticket-stub';
import {
  submitCodeAction,
  type SubmitCodeActionResult,
} from '../../app/(public)/participer/actions';

interface CodeFormProps {
  /** Comes from the contest row rather than a constant: the rules are data, not code. */
  codeLength: number;
  minimumPurchaseCents: number;
}

/**
 * Use case UC-01, client side.
 *
 * The submission goes through a **server action**, not a `fetch`. The call needs the
 * session cookie and the internal API address, and routing it through the server keeps
 * both out of the browser — see `participer/actions.ts`.
 *
 * `useTransition` rather than a hand-rolled pending flag: it is what React provides for
 * exactly this, and it keeps the input responsive while the action is in flight.
 */
export function CodeForm({ codeLength, minimumPurchaseCents }: CodeFormProps) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<SubmitCodeActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const liveRef = useRef<HTMLDivElement>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    startTransition(async () => {
      const outcome = await submitCodeAction(code);
      setResult(outcome);
      // Moves focus into the live region so a screen reader announces the outcome, rather
      // than leaving the user on a submit button whose page silently changed underneath.
      liveRef.current?.focus();
    });
  }

  function reset() {
    setCode('');
    setResult(null);
  }

  const fieldError =
    result?.outcome === 'INVALID_FORMAT'
      ? `Le code comporte exactement ${codeLength} caractères, lettres et chiffres.`
      : undefined;

  /* Won                                                                  */
  if (result?.outcome === 'WON') {
    return (
      <TicketStub
        tone="won"
        header={
          <>
            <PartyPopper className="size-6" aria-hidden="true" />
            <p className="mt-3 font-mono text-[11.5px] leading-none tracking-[0.14em] uppercase opacity-80">
              Vous avez gagné
            </p>
            <p className="mt-3 font-serif text-[30px] leading-[1.1] tracking-[-0.02em]">
              {result.prize.label}
            </p>
            <p className="mt-2 text-[15px] opacity-85">
              D&apos;une valeur de {formatPrice(result.prize.valueCents)}
            </p>
          </>
        }
        footer={
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/mon-compte">Voir mes gains</ButtonLink>
            <Button variant="secondary" onClick={reset}>
              Saisir un autre code
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <p className="text-[15.5px] leading-[1.6] text-fg-muted">
            {result.prize.description}
          </p>

          <div className="space-y-1.5 border-y border-dashed border-border py-4">
            <StubLine label="Code joué" value={result.participation.ticketCode} strong />
            <StubLine
              label="À réclamer avant le"
              value={formatDate(result.participation.claimDeadline)}
            />
            <StubLine label="Référence" value={result.participation.id} />
          </div>

          <Alert tone="success" title="Lot enregistré">
            <p>
              Votre lot est disponible dans votre espace personnel. Présentez-vous en
              boutique avec cette référence, ou réclamez-le en ligne.
            </p>
          </Alert>
        </div>
      </TicketStub>
    );
  }

  /* Entry                                                               */
  return (
    <div className="space-y-6">
      <TicketStub
        header={
          <div className="space-y-1">
            <StubLine label="Thé Tip Top" value="Ticket de caisse" />
            <StubLine label="Montant minimum" value={formatPrice(minimumPurchaseCents)} />
            <StubLine label="Code à saisir" value={`${codeLength} caractères`} />
          </div>
        }
      >
        <form onSubmit={handleSubmit} noValidate>
          <label
            htmlFor="code"
            className="block text-center font-mono text-[11.5px] leading-none tracking-[0.14em] text-fg-muted uppercase"
          >
            Code de votre ticket
          </label>

          <input
            id="code"
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={codeLength}
            autoComplete="off"
            inputMode="text"
            spellCheck={false}
            placeholder="A7K2M9QX41"
            aria-invalid={fieldError ? true : undefined}
            aria-describedby={fieldError ? 'code-error code-hint' : 'code-hint'}
            className="mt-5 w-full border-0 border-b-2 border-dashed border-border bg-transparent pb-3 text-center font-mono text-[clamp(1.5rem,1rem+2vw,2.125rem)] leading-none tracking-[0.22em] uppercase placeholder:text-fg-muted/25 focus:border-primary focus:border-solid focus:outline-none"
          />

          <p
            id="code-hint"
            className="mt-4 flex items-center justify-center gap-2 text-center text-[13.5px] leading-[1.5] text-fg-muted"
          >
            <ScanLine className="size-4 shrink-0" aria-hidden="true" />
            Imprimé en bas de votre ticket, sous le montant total
          </p>

          {fieldError && (
            <p
              id="code-error"
              role="alert"
              className="mt-3 text-center text-[13.5px] leading-[1.5] font-medium text-danger"
            >
              {fieldError}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="mt-7 w-full"
            disabled={pending || code.length === 0}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Vérification
              </>
            ) : (
              'Découvrir mon lot'
            )}
          </Button>
        </form>
      </TicketStub>

      <div ref={liveRef} tabIndex={-1} aria-live="polite" className="space-y-6">
        {result?.outcome === 'UNKNOWN_CODE' && (
          <Alert tone="error" title="Ce code n'est pas valide">
            <p>
              Vérifiez la saisie, en particulier les caractères qui se ressemblent. Si
              le problème persiste, contactez-nous avec une photo de votre ticket.
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
              Par sécurité, la saisie est suspendue pendant {result.retryInMinutes}{' '}
              minutes. Cette limite protège le jeu contre les tentatives automatisées.
            </p>
          </Alert>
        )}

        {/* Added by the server action rather than by the API: the session expired between
            loading this page and submitting the form. */}
        {result?.outcome === 'SESSION_EXPIRED' && (
          <Alert tone="warning" title="Votre session a expiré">
            <p>
              <Link href="/connexion?next=/participer" className="underline">
                Reconnectez-vous
              </Link>{' '}
              pour jouer votre code. Il n&apos;a pas été consommé.
            </p>
          </Alert>
        )}
      </div>
    </div>
  );
}
