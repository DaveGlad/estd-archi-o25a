'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { Alert } from '@theetiptop-contest/ui/alert';
import { Button } from '@theetiptop-contest/ui/button';
import { Field } from '@theetiptop-contest/ui/field';
import { Input, Select } from '@theetiptop-contest/ui/input';
import { signInWithPassword } from '@theetiptop-contest/api-client/auth';

import { registerAction } from '../../app/(public)/inscription/actions';

/**
 * Sign-up by form. One of the three methods the brief mandates.
 *
 * Two steps, in this order:
 *   1. the server action creates the account — adulthood, mandatory consents and the
 *      server-stamped consent timestamps all happen there;
 *   2. the browser signs in with the credentials it already has in the form.
 *
 * Step 2 exists so Better Auth sets the session cookie itself. The rationale for not
 * relaying the API's own `Set-Cookie` through the action is on `registerAction`.
 */
export function RegisterForm({ next = '/participer' }: { next?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [emailTaken, setEmailTaken] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');

    setError(null);
    setEmailTaken(false);

    startTransition(async () => {
      const created = await registerAction(formData);

      if (!created.ok) {
        setError(created.message);
        setEmailTaken(created.code === 'EMAIL_ALREADY_REGISTERED');
        return;
      }

      const signedIn = await signInWithPassword(email, password);

      if (!signedIn.ok) {
        // The account exists; only the automatic sign-in failed. Say exactly that rather
        // than letting the visitor think their registration was lost.
        setError(
          'Votre compte a bien été créé, mais la connexion automatique a échoué. Connectez-vous avec vos identifiants.'
        );
        return;
      }

      router.push(next);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert tone="error" title="La création du compte a échoué">
          <p>
            {error}
            {emailTaken && (
              <>
                {' '}
                <Link href="/connexion" className="font-medium underline">
                  Se connecter
                </Link>
                .
              </>
            )}
          </p>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Prénom" htmlFor="firstName" required>
          <Input id="firstName" name="firstName" autoComplete="given-name" required />
        </Field>
        <Field label="Nom" htmlFor="lastName" required>
          <Input id="lastName" name="lastName" autoComplete="family-name" required />
        </Field>
      </div>

      <Field label="Adresse de courriel" htmlFor="email" required>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>

      <Field
        label="Mot de passe"
        htmlFor="password"
        required
        hint="12 caractères minimum."
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Genre" htmlFor="gender">
          <Select id="gender" name="gender" defaultValue="UNDISCLOSED">
            <option value="FEMALE">Femme</option>
            <option value="MALE">Homme</option>
            <option value="OTHER">Autre</option>
            <option value="UNDISCLOSED">Je préfère ne pas répondre</option>
          </Select>
        </Field>
        <Field
          label="Date de naissance"
          htmlFor="birthDate"
          required
          hint="Le jeu est réservé aux personnes majeures."
        >
          <Input id="birthDate" name="birthDate" type="date" required />
        </Field>
      </div>

      <Field label="Code postal" htmlFor="postalCode">
        <Input
          id="postalCode"
          name="postalCode"
          inputMode="numeric"
          maxLength={5}
          autoComplete="postal-code"
        />
      </Field>

      <fieldset className="space-y-3 border-t border-border pt-4">
        <legend className="sr-only">Consentements</legend>

        <label className="flex gap-3 text-sm">
          <input type="checkbox" name="rules" required className="mt-0.5 size-4 shrink-0" />
          <span>
            J&apos;ai lu et j&apos;accepte le règlement du jeu et les conditions
            générales d&apos;utilisation. <span className="text-danger">*</span>
          </span>
        </label>

        {/* Unchecked by default, and it has to stay that way: pre-ticked marketing consent
            is not freely given consent under GDPR article 4.11. */}
        <label className="flex gap-3 text-sm">
          <input type="checkbox" name="marketing" className="mt-0.5 size-4 shrink-0" />
          <span>
            J&apos;accepte de recevoir les actualités et offres de Thé Tip Top. Ce choix
            est indépendant de ma participation et révocable à tout moment.
          </span>
        </label>
      </fieldset>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Création du compte
          </>
        ) : (
          'Créer mon compte'
        )}
      </Button>
    </form>
  );
}
