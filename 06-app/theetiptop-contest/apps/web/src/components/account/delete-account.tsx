'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { Alert } from '@theetiptop-contest/ui/alert';
import { Button } from '@theetiptop-contest/ui/button';
import { Input } from '@theetiptop-contest/ui/input';
import { signOut } from '@theetiptop-contest/api-client/auth';

import { anonymizeAccountAction } from '../../app/(public)/mon-compte/actions';

/** What the customer has to type to confirm. */
const CONFIRMATION_WORD = 'SUPPRIMER';

/**
 * Account deletion, with a typed confirmation.
 *
 * Not a `confirm()` dialog: a native dialog blocks the page, cannot be styled to match the
 * rest, and is dismissed by the same reflex click that opened it. Typing a word is the
 * standard pattern for an irreversible action because it cannot be done by accident.
 *
 * The operation is an anonymisation server-side, not a row deletion — the participations
 * have to stay auditable by the bailiff. The copy next to this component says so rather
 * than promising an erasure that does not happen.
 */
export function DeleteAccount() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);

    startTransition(async () => {
      const result = await anonymizeAccountAction();

      if (!result.ok) {
        setError(result.message);
        return;
      }

      // The API already revoked the server-side sessions. This clears the cookie in the
      // browser so the UI does not keep showing a signed-in header for a dead session.
      await signOut();
      router.push('/');
      router.refresh();
    });
  }

  if (!open) {
    return (
      <Button variant="danger" onClick={() => setOpen(true)}>
        <Trash2 className="size-4" aria-hidden="true" />
        Supprimer mon compte
      </Button>
    );
  }

  return (
    <div className="w-full max-w-md space-y-3">
      <Alert tone="error" title="Cette action est irréversible">
        <p>
          Saisissez <strong>{CONFIRMATION_WORD}</strong> pour confirmer. Vos données
          identifiantes seront effacées et vous serez déconnecté immédiatement.
        </p>
      </Alert>

      <Input
        value={confirmation}
        onChange={(event) => setConfirmation(event.target.value.toUpperCase())}
        placeholder={CONFIRMATION_WORD}
        aria-label={`Saisir ${CONFIRMATION_WORD} pour confirmer`}
        autoComplete="off"
      />

      {error && (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={pending || confirmation !== CONFIRMATION_WORD}
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Suppression
            </>
          ) : (
            'Confirmer la suppression'
          )}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setOpen(false);
            setConfirmation('');
            setError(null);
          }}
          disabled={pending}
        >
          Annuler
        </Button>
      </div>
    </div>
  );
}
