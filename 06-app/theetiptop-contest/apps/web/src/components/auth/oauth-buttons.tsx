'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { signInWithProvider } from '@theetiptop-contest/api-client/auth';

/**
 * Third-party sign-in, placed below the form.
 *
 * The order is not neutral: the form stays the primary path, because it is the only one
 * that works regardless of the review status of two third-party applications. The social
 * buttons are an alternative, and they present themselves as one.
 *
 * Google keeps its official colours on a neutral button, which its brand terms require.
 * Facebook takes its brand blue as a solid fill, which distinguishes the two buttons by
 * more than their icon alone.
 *
 * These two providers are the ones the client named — objective 2, point 2 of the brief.
 * They are not interchangeable with any other.
 *
 * A client component: the OAuth flow ends on a full-page redirect back to a callback URL,
 * and only the browser can perform that navigation. A server action could not.
 */
export function OAuthButtons({
  label = 'Continuer',
  callbackURL = '/mon-compte',
}: {
  label?: string;
  /** Where the provider sends the visitor back, so they resume what they were doing. */
  callbackURL?: string;
}) {
  const [pendingProvider, setPendingProvider] = useState<'google' | 'facebook' | null>(null);

  const base =
    'flex h-11 w-full items-center justify-center gap-3 rounded-[12px] text-[15px] font-medium transition-[background-color,border-color,transform] duration-150 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60';

  async function start(provider: 'google' | 'facebook') {
    setPendingProvider(provider);
    try {
      await signInWithProvider(provider, callbackURL);
    } finally {
      // Reached only if the redirect did not happen — a misconfigured provider, for
      // instance. Otherwise the page is already gone.
      setPendingProvider(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <span aria-hidden="true" className="block h-px bg-border" />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface px-3 text-[12.5px] font-medium text-fg-muted">
          ou continuer avec
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => start('google')}
          disabled={pendingProvider !== null}
          className={`${base} border border-border bg-surface text-fg hover:border-fg-muted/45 hover:bg-muted/60`}
        >
          {pendingProvider === 'google' ? (
            <Loader2 className="size-[18px] animate-spin" aria-hidden="true" />
          ) : (
            <GoogleIcon />
          )}
          {label} avec Google
        </button>

        <button
          type="button"
          onClick={() => start('facebook')}
          disabled={pendingProvider !== null}
          className={`${base} border border-transparent bg-[#1877F2] text-white hover:bg-[#1568d8]`}
        >
          {pendingProvider === 'facebook' ? (
            <Loader2 className="size-[18px] animate-spin" aria-hidden="true" />
          ) : (
            <FacebookIcon />
          )}
          {label} avec Facebook
        </button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59a14.5 14.5 0 010-9.18l-7.98-6.19a24.01 24.01 0 000 21.56l7.98-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z"
      />
    </svg>
  );
}
