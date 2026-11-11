'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from 'lucide-react';
import type { DrawDto } from '@theetiptop-contest/shared';
import { Alert } from '@theetiptop-contest/ui/alert';
import { Button } from '@theetiptop-contest/ui/button';
import { Input } from '@theetiptop-contest/ui/input';
import { formatDateTime } from '@theetiptop-contest/ui/utils';

import {
  executeDrawAction,
  verifyDrawAction,
  type VerifyActionResult,
} from '../../app/admin/tirage/actions';

/** What the administrator types to confirm. */
const CONFIRMATION_WORD = 'TIRER';

/** Copy per refusal reason. All three come back as 409 and mean very different things. */
const REFUSAL_COPY: Record<string, string> = {
  CONTEST_NOT_CLOSED:
    'Le tirage ne peut avoir lieu qu’après la clôture du jeu. Le lancer maintenant exclurait tous les clients qui joueront d’ici là.',
  ALREADY_DRAWN:
    'Le tirage a déjà été effectué pour ce jeu. Un second tirage produirait un second gagnant pour un seul lot.',
  NO_PARTICIPANT: 'Aucun participant : il n’y a personne à tirer au sort.',
};

export function DrawPanel({ initialDraw }: { initialDraw: DrawDto | null }) {
  const [draw, setDraw] = useState(initialDraw);
  const [confirmation, setConfirmation] = useState('');
  const [refusal, setRefusal] = useState<{ code: string; message: string } | null>(null);
  const [verification, setVerification] = useState<VerifyActionResult | null>(null);
  const [drawing, startDraw] = useTransition();
  const [verifying, startVerify] = useTransition();

  function handleDraw() {
    setRefusal(null);

    startDraw(async () => {
      const result = await executeDrawAction();

      if (!result.ok) {
        setRefusal({ code: result.code, message: result.message });
        return;
      }

      setDraw(result.draw);
      setConfirmation('');
    });
  }

  function handleVerify() {
    if (!draw) return;
    setVerification(null);
    startVerify(async () => {
      setVerification(await verifyDrawAction(draw.id));
    });
  }

  /* Already drawn: show the result and the verification tool, never the button. */
  if (draw) {
    return (
      <div className="space-y-5">
        <Alert tone="success" title="Le tirage a été effectué">
          <p>
            {draw.winner
              ? `Gagnant : ${draw.winner.firstName} ${draw.winner.lastName} (${draw.winner.email}).`
              : 'Le gagnant enregistré n’est plus disponible.'}{' '}
            Tirage du {formatDateTime(draw.executedAt)}, parmi{' '}
            {draw.participantCount.toLocaleString('fr-FR')} participants distincts
            {draw.bailiffName ? `, sous le contrôle de ${draw.bailiffName}` : ''}.
          </p>
        </Alert>

        <dl className="space-y-3 rounded-[var(--radius-sm)] border border-border p-4 text-sm">
          <div>
            <dt className="text-fg-muted">Graine du tirage</dt>
            <dd className="mt-0.5 font-mono text-xs break-all">{draw.seed}</dd>
          </div>
          <div>
            <dt className="text-fg-muted">Empreinte de la liste des participants</dt>
            <dd className="mt-0.5 font-mono text-xs break-all">
              {draw.participantsFingerprint}
            </dd>
          </div>
        </dl>

        <div className="space-y-3">
          <Button variant="secondary" onClick={handleVerify} disabled={verifying}>
            {verifying ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Vérification
              </>
            ) : (
              <>
                <ShieldCheck className="size-4" aria-hidden="true" />
                Rejouer et vérifier le tirage
              </>
            )}
          </Button>

          {verification && !verification.ok && (
            <p role="alert" className="text-sm font-medium text-danger">
              {verification.message}
            </p>
          )}

          {verification?.ok && (
            <ul aria-live="polite" className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                {verification.fingerprintMatches ? (
                  <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
                ) : (
                  <XCircle className="size-4 text-danger" aria-hidden="true" />
                )}
                {verification.fingerprintMatches
                  ? 'L’empreinte concorde : la liste des participants n’a pas changé depuis le tirage.'
                  : 'L’empreinte ne concorde pas : l’assiette des participants a changé depuis le tirage.'}
              </li>
              <li className="flex items-center gap-2">
                {verification.winnerMatches ? (
                  <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
                ) : (
                  <XCircle className="size-4 text-danger" aria-hidden="true" />
                )}
                {verification.winnerMatches
                  ? 'Le tirage rejoué depuis la graine désigne le même gagnant.'
                  : 'Le tirage rejoué désigne un autre gagnant.'}
              </li>
            </ul>
          )}
        </div>
      </div>
    );
  }

  /* Not drawn yet. */
  return (
    <div className="space-y-4">
      {refusal && (
        <Alert tone="warning" title="Le tirage n’a pas été lancé">
          <p>{REFUSAL_COPY[refusal.code] ?? refusal.message}</p>
        </Alert>
      )}

      <Alert tone="warning" title="Opération unique et irréversible">
        <p>
          Saisissez <strong>{CONFIRMATION_WORD}</strong> pour confirmer. Le tirage ne peut
          être effectué qu&apos;une fois, et son résultat est définitif.
        </p>
      </Alert>

      <div className="max-w-xs">
        <Input
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value.toUpperCase())}
          placeholder={CONFIRMATION_WORD}
          aria-label={`Saisir ${CONFIRMATION_WORD} pour confirmer le tirage`}
          autoComplete="off"
        />
      </div>

      <Button
        size="lg"
        onClick={handleDraw}
        disabled={drawing || confirmation !== CONFIRMATION_WORD}
      >
        {drawing ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Tirage en cours
          </>
        ) : (
          'Lancer le tirage'
        )}
      </Button>

      {/* The button is not disabled before the closing date. The API refuses the draw and
          explains why, which is better than a greyed-out control that gives no reason —
          and it means the front end holds no copy of a rule the API already owns. */}
    </div>
  );
}
