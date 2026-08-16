'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { Loader2, PartyPopper, ScanLine } from 'lucide-react';
import { Alert } from '../ui/alert';
import { Button, ButtonLink } from '../ui/button';
import { StubLine, TicketStub } from './ticket-stub';
import { contest, submitCode } from '../../lib/mock';
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
    // Latence simulée, pour que l'état de chargement soit visible sur la maquette.
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

  /* Gain                                                                */
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

          <Alert tone="success" title="Confirmation envoyée">
            <p>
              Un courriel récapitulatif vient de vous être envoyé. Votre lot est
              également disponible dans votre espace personnel.
            </p>
          </Alert>
        </div>
      </TicketStub>
    );
  }

  /* Saisie                                                              */
  return (
    <div className="space-y-6">
      <TicketStub
        header={
          <div className="space-y-1">
            <StubLine label="Thé Tip Top" value="Ticket de caisse" />
            <StubLine
              label="Montant minimum"
              value={formatPrice(contest.minimumPurchaseCents)}
            />
            <StubLine label="Code à saisir" value={`${contest.codeLength} caractères`} />
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
            maxLength={contest.codeLength}
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
              Par sécurité, la saisie est suspendue pendant {result.retryInMinutes}{' '}
              minutes. Cette limite protège le jeu contre les tentatives
              automatisées.
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
