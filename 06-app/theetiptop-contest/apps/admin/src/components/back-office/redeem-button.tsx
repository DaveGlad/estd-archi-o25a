'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Alert } from '@theetiptop-contest/ui/alert';
import { Button } from '@theetiptop-contest/ui/button';

import { redeemPrizeAction } from '../../app/employe/actions';

type State = 'idle' | 'confirming' | 'done';

/** Copy per refusal code. All of them are 409 and they mean very different things. */
const REFUSAL_COPY: Record<string, string> = {
  ALREADY_REDEEMED:
    'Ce lot a déjà été remis. Vérifiez auprès de votre collègue avant de le donner une seconde fois.',
  CLAIM_WINDOW_CLOSED:
    'Le délai de réclamation de ce lot est dépassé. Le lot ne peut plus être remis ; orientez le client vers le service client.',
  EMPLOYEE_WITHOUT_STORE:
    'Votre compte employé n’est rattaché à aucune boutique. Contactez un administrateur.',
};

/**
 * Marks a prize as handed over.
 *
 * The typed-free confirmation step is deliberate: the action cannot be undone, a prize can
 * only ever be redeemed once, and the button sits next to a customer waiting at a counter.
 * A single click is too easy to make by accident in that setting.
 */
export function RedeemButton({
  participationId,
  prizeLabel,
  customerName,
  storeName,
}: {
  participationId: string;
  prizeLabel: string;
  customerName: string;
  storeName: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<State>('idle');
  const [refusal, setRefusal] = useState<{ code: string; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    setRefusal(null);

    startTransition(async () => {
      const result = await redeemPrizeAction(participationId, 'IN_STORE');

      if (!result.ok) {
        setRefusal({ code: result.code, message: result.message });
        setState('idle');
        return;
      }

      setState('done');
      // The customer's file is a server component; without this it keeps showing the
      // prize as "to claim" until a full reload.
      router.refresh();
    });
  }

  if (state === 'done') {
    return (
      <Alert tone="success" title="Lot marqué comme remis">
        <p>
          {prizeLabel} remis à {customerName}, boutique {storeName}. L&apos;opération a été
          enregistrée au journal d&apos;audit avec votre identité et l&apos;horodatage.
        </p>
      </Alert>
    );
  }

  if (state === 'confirming') {
    return (
      <Alert tone="warning" title="Confirmer la remise">
        <p>
          Vous êtes sur le point d&apos;enregistrer la remise de {prizeLabel} à{' '}
          {customerName}. Cette action est définitive et ne peut pas être annulée.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Button size="sm" disabled={pending} onClick={handleConfirm}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Enregistrement
              </>
            ) : (
              <>
                <Check className="size-4" aria-hidden="true" />
                Oui, le lot a été remis
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={pending}
            onClick={() => setState('idle')}
          >
            Annuler
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      {refusal && (
        <Alert tone="error" title="La remise n’a pas été enregistrée">
          <p>{REFUSAL_COPY[refusal.code] ?? refusal.message}</p>
        </Alert>
      )}

      <Button onClick={() => setState('confirming')}>
        <Check className="size-4" aria-hidden="true" />
        Marquer comme remis
      </Button>
    </div>
  );
}
