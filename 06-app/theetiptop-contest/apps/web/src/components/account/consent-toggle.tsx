'use client';

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';

import { updateConsentAction } from '../../app/(public)/mon-compte/actions';

/**
 * Marketing consent switch.
 *
 * Saves on change rather than behind a "save" button: GDPR article 7.3 requires
 * withdrawing consent to be as easy as giving it, and a checkbox whose effect depends on
 * remembering to submit a form afterwards is not that.
 *
 * The optimistic state is reverted if the call fails, so the control never shows a
 * preference the server did not record.
 */
export function ConsentToggle({
  initialValue,
  label = 'Activé',
}: {
  initialValue: boolean;
  label?: string;
}) {
  const [granted, setGranted] = useState(initialValue);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleChange(next: boolean) {
    setGranted(next);
    setMessage(null);

    startTransition(async () => {
      const result = await updateConsentAction(next);
      if (!result.ok) setGranted(!next);
      setMessage(result.message);
    });
  }

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={granted}
          disabled={pending}
          onChange={(event) => handleChange(event.target.checked)}
          className="size-4"
        />
        {label}
        {pending && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
      </label>

      {/* Polite, not assertive: a confirmation does not warrant interrupting whatever a
          screen reader is currently announcing. */}
      {message && (
        <p aria-live="polite" className="text-xs text-fg-muted">
          {message}
        </p>
      )}
    </div>
  );
}
