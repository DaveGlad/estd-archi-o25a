'use client';

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import type { UserDto } from '@theetiptop-contest/shared';
import { Alert } from '@theetiptop-contest/ui/alert';
import { Button } from '@theetiptop-contest/ui/button';
import { CardBody, CardFooter } from '@theetiptop-contest/ui/card';
import { Field } from '@theetiptop-contest/ui/field';
import { Input, Select } from '@theetiptop-contest/ui/input';

import { updateProfileAction, type ActionResult } from '../../app/(public)/mon-compte/actions';

/**
 * Editable profile.
 *
 * `email` is shown but **disabled**: changing an email is an identity change, and doing it
 * properly means sending a confirmation link to the new address before switching. The API
 * does not expose it on `PATCH /v1/users/me` for that reason, so offering an editable
 * field here would be a control that silently does nothing.
 */
export function ProfileForm({ user }: { user: UserDto }) {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      setResult(await updateProfileAction(formData));
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardBody className="space-y-4">
        {result && (
          <Alert tone={result.ok ? 'success' : 'error'} title={result.ok ? 'Enregistré' : 'Échec'}>
            <p>{result.message}</p>
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prénom" htmlFor="firstName" required>
            <Input id="firstName" name="firstName" defaultValue={user.firstName} required />
          </Field>
          <Field label="Nom" htmlFor="lastName" required>
            <Input id="lastName" name="lastName" defaultValue={user.lastName} required />
          </Field>
        </div>

        <Field
          label="Adresse de courriel"
          htmlFor="email"
          hint="Pour changer d’adresse, contactez-nous : un lien de confirmation doit être envoyé à la nouvelle adresse."
        >
          <Input id="email" name="email" type="email" defaultValue={user.email} disabled />
        </Field>

        <Field label="Téléphone" htmlFor="phone">
          <Input id="phone" name="phone" type="tel" defaultValue={user.phone ?? ''} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Genre" htmlFor="gender">
            <Select id="gender" name="gender" defaultValue={user.gender}>
              <option value="FEMALE">Femme</option>
              <option value="MALE">Homme</option>
              <option value="OTHER">Autre</option>
              <option value="UNDISCLOSED">Je préfère ne pas répondre</option>
            </Select>
          </Field>
          <Field label="Code postal" htmlFor="postalCode">
            <Input
              id="postalCode"
              name="postalCode"
              inputMode="numeric"
              maxLength={5}
              defaultValue={user.postalCode ?? ''}
            />
          </Field>
        </div>

        {/* Collected at sign-up, editable here: a customer who signed up with Google was
            never asked, and the winner statistics the brief requires depend on it. */}
        <Field
          label="Date de naissance"
          htmlFor="birthDate"
          hint="Le jeu est réservé aux personnes majeures. Cette date sert aux statistiques du jeu, jamais à vous recontacter."
        >
          <Input
            id="birthDate"
            name="birthDate"
            type="date"
            defaultValue={user.birthDate ?? ''}
          />
        </Field>
      </CardBody>

      <CardFooter className="flex justify-end gap-3">
        <Button type="reset" variant="secondary" disabled={pending}>
          Annuler
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Enregistrement
            </>
          ) : (
            'Enregistrer'
          )}
        </Button>
      </CardFooter>
    </form>
  );
}
