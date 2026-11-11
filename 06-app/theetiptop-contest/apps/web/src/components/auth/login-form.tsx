'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@theetiptop-contest/ui/button';
import { Field } from '@theetiptop-contest/ui/field';
import { Input } from '@theetiptop-contest/ui/input';
import { signInWithPassword } from '@theetiptop-contest/api-client/auth';

/**
 * Email and password sign-in.
 *
 * Runs in the browser through Better Auth's client rather than through a server action,
 * because the library is what sets the session cookie and refreshes its own client-side
 * session state. Routing it through the server would mean relaying `Set-Cookie` by hand
 * and then telling the client to forget what it thinks it knows.
 *
 * `router.refresh()` after success is what makes the server components re-render with a
 * session: without it the header would keep showing the signed-out state until the next
 * full navigation.
 */
export function LoginForm({ next = '/mon-compte' }: { next?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');

    setError(null);

    startTransition(async () => {
      const result = await signInWithPassword(email, password);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      router.push(next);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      )}

      <Field label="Adresse de courriel" htmlFor="email" required>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>

      <Field label="Mot de passe" htmlFor="password" required>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>

      <div className="flex items-center justify-end gap-4 text-sm">
        {/* No "stay signed in" checkbox: the session lasts a week and slides forward on
            use, which is the behaviour the checkbox would have promised anyway. Offering a
            control that changes nothing is worse than not offering it. */}
        <Link href="/contact" className="underline">
          Mot de passe oublié
        </Link>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Connexion
          </>
        ) : (
          'Se connecter'
        )}
      </Button>
    </form>
  );
}
