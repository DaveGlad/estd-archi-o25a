'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@theetiptop-contest/ui/button';
import { Field } from '@theetiptop-contest/ui/field';
import { Input } from '@theetiptop-contest/ui/input';
import { signInWithPassword } from '@theetiptop-contest/api-client/auth';

/**
 * Staff sign-in.
 *
 * After a successful sign-in it navigates to `/admin` unconditionally. The role is not
 * read here: the `/admin` layout guard redirects an EMPLOYEE on to `/employe`, so the
 * routing decision lives in exactly one place instead of being duplicated — once in a
 * client component that could be edited in a browser, once in the guard that actually
 * enforces it.
 */
export function StaffLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setError(null);

    startTransition(async () => {
      const result = await signInWithPassword(
        String(formData.get('email') ?? ''),
        String(formData.get('password') ?? '')
      );

      if (!result.ok) {
        setError(result.message);
        return;
      }

      router.push('/admin');
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

      <Field label="Adresse professionnelle" htmlFor="email" required>
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
