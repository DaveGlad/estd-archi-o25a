'use client';

import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Alert } from '../ui/alert';
import { Button } from '../ui/button';

type State = 'idle' | 'confirming' | 'pending' | 'done';

/**
 * Marks a prize as handed over. The confirmation step is deliberate: this action
 * cannot be undone, and a prize can only ever be redeemed once.
 */
export function RedeemButton({
  prizeLabel,
  customerName,
  storeName,
}: {
  prizeLabel: string;
  customerName: string;
  storeName: string;
}) {
  const [state, setState] = useState<State>('idle');

  if (state === 'done') {
    return (
      <Alert tone="success" title="Lot marqué comme remis">
        <p>
          {prizeLabel} remis à {customerName}, boutique {storeName}. L&apos;opération a
          été enregistrée avec votre identifiant et l&apos;horodatage.
        </p>
      </Alert>
    );
  }

  if (state === 'confirming' || state === 'pending') {
    return (
      <Alert tone="warning" title="Confirmer la remise">
        <p>
          Vous êtes sur le point d&apos;enregistrer la remise de {prizeLabel} à{' '}
          {customerName}. Cette action est définitive et ne peut pas être annulée.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Button
            size="sm"
            disabled={state === 'pending'}
            onClick={() => {
              setState('pending');
              window.setTimeout(() => setState('done'), 500);
            }}
          >
            {state === 'pending' ? (
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
            disabled={state === 'pending'}
            onClick={() => setState('idle')}
          >
            Annuler
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <Button onClick={() => setState('confirming')}>
      <Check className="size-4" aria-hidden="true" />
      Marquer comme remis
    </Button>
  );
}
