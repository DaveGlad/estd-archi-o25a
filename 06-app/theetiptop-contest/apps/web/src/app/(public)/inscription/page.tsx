import type { Metadata } from 'next';
import Link from 'next/link';
import {
  AuthShell,
  LegalNote,
  OAuthButtons,
} from '../../../components/auth/auth-shell';
import { Alert } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { Field } from '../../../components/ui/field';
import { Input, Select } from '../../../components/ui/input';

export const metadata: Metadata = {
  title: 'Créer un compte',
  description:
    'Créez votre compte en quelques secondes pour jouer vos codes et suivre vos gains.',
};

export default function InscriptionPage() {
  return (
    <AuthShell
      title="Créer un compte"
      intro="Deux minutes suffisent. Votre premier code peut être joué juste après."
      footer={
        <>
          Vous avez déjà un compte ?{' '}
          <Link href="/connexion" className="font-medium underline">
            Se connecter
          </Link>
        </>
      }
      aside={
        <div>
          <h2 className="font-serif text-2xl">Pourquoi ces informations ?</h2>
          <dl className="mt-6 space-y-5 text-sm">
            <div>
              <dt className="font-medium">Nom, prénom et courriel</dt>
              <dd className="mt-1 text-fg-muted">
                Pour rattacher vos gains à votre compte et vous les remettre en
                boutique.
              </dd>
            </div>
            <div>
              <dt className="font-medium">Année de naissance et genre</dt>
              <dd className="mt-1 text-fg-muted">
                Uniquement pour établir des statistiques anonymes sur les gagnants.
                Ces données ne sont jamais utilisées à d&apos;autres fins.
              </dd>
            </div>
            <div>
              <dt className="font-medium">Code postal</dt>
              <dd className="mt-1 text-fg-muted">
                Pour vous proposer la boutique la plus proche lors du retrait.
              </dd>
            </div>
          </dl>
        </div>
      }
    >
      <div className="space-y-7">
        <form className="space-y-4">
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
            hint="12 caractères minimum, dont une majuscule et un chiffre."
          >
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
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
            <Field label="Date de naissance" htmlFor="birthDate" required>
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

            <label className="flex gap-3 text-sm">
              <input type="checkbox" name="marketing" className="mt-0.5 size-4 shrink-0" />
              <span>
                J&apos;accepte de recevoir les actualités et offres de Thé Tip Top. Ce
                choix est indépendant de ma participation et révocable à tout moment.
              </span>
            </label>
          </fieldset>

          <Button type="submit" size="lg" className="w-full">
            Créer mon compte
          </Button>
        </form>

        <OAuthButtons label="S’inscrire" />

        <Alert tone="info">
          <p>
            Un seul compte est autorisé par personne. La création de plusieurs comptes
            entraîne l&apos;annulation des participations.
          </p>
        </Alert>

        <LegalNote />
      </div>
    </AuthShell>
  );
}
