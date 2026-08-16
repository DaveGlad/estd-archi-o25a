import type { Metadata } from 'next';
import Link from 'next/link';
import { Gift, Lock, ShieldCheck } from 'lucide-react';
import {
  AuthShell,
  LegalNote,
  OAuthButtons,
} from '../../../components/auth/auth-shell';
import { Button } from '../../../components/ui/button';
import { Field } from '../../../components/ui/field';
import { Input } from '../../../components/ui/input';

export const metadata: Metadata = {
  title: 'Se connecter',
  description:
    'Connectez-vous pour saisir vos codes et retrouver l’historique de vos gains.',
};

const reasons = [
  { icon: Gift, text: 'Retrouvez tous vos lots au même endroit' },
  { icon: ShieldCheck, text: 'Un gain rattaché à votre compte ne peut pas être perdu' },
  { icon: Lock, text: 'Vos données ne sont jamais cédées à des tiers' },
];

export default function ConnexionPage() {
  return (
    <AuthShell
      title="Se connecter"
      intro="Retrouvez vos gains et saisissez de nouveaux codes."
      footer={
        <>
          Pas encore de compte ?{' '}
          <Link href="/inscription" className="font-medium underline">
            Créer un compte
          </Link>
        </>
      }
      aside={
        <div>
          <h2 className="font-serif text-2xl">Pourquoi un compte ?</h2>
          <ul className="mt-6 space-y-4">
            {reasons.map((reason) => (
              <li key={reason.text} className="flex gap-3 text-sm">
                <reason.icon className="mt-0.5 size-5 shrink-0 text-accent-strong" aria-hidden="true" />
                <span>{reason.text}</span>
              </li>
            ))}
          </ul>
        </div>
      }
    >
      <div className="space-y-7">
        <form className="space-y-4">
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

          <div className="flex items-center justify-between gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="remember" className="size-4 rounded" />
              Rester connecté
            </label>
            <Link href="/mot-de-passe-oublie" className="underline">
              Mot de passe oublié
            </Link>
          </div>

          <Button type="submit" size="lg" className="w-full">
            Se connecter
          </Button>
        </form>

        <OAuthButtons />

        <LegalNote />
      </div>
    </AuthShell>
  );
}
