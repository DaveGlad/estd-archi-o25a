import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Download } from 'lucide-react';
import { Alert } from '@theetiptop-contest/ui/alert';
import { Card, CardBody, CardHeader, CardTitle } from '@theetiptop-contest/ui/card';
import { formatDateTime } from '@theetiptop-contest/ui/utils';
import { getCurrentUser } from '@theetiptop-contest/api-client/server';

import { ConsentToggle } from '../../../../components/account/consent-toggle';
import { DeleteAccount } from '../../../../components/account/delete-account';

export const metadata: Metadata = { title: 'Mes données et confidentialité' };

export default async function ConfidentialiteComptePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/connexion?next=/mon-compte/confidentialite');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mes consentements</CardTitle>
        </CardHeader>
        <CardBody className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-lg">
              <p className="font-medium">Communications commerciales</p>
              <p className="mt-1 text-sm text-fg-muted">
                Recevoir les actualités, nouveautés et offres de Thé Tip Top. Ce choix
                est indépendant de votre participation au jeu.
              </p>
              {user.marketingConsentAt && (
                <p className="mt-1 text-sm text-fg-muted">
                  Consentement donné le {formatDateTime(user.marketingConsentAt)}
                </p>
              )}
            </div>
            <ConsentToggle initialValue={user.marketingConsent} />
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4 border-t border-border pt-5">
            <div className="max-w-lg">
              <p className="font-medium">Règlement du jeu</p>
              <p className="mt-1 text-sm text-fg-muted">
                Accepté lors de la création du compte. Cette acceptation est
                nécessaire pour participer et ne peut pas être retirée sans supprimer
                le compte.
              </p>
              {user.contestRulesAcceptedAt && (
                <p className="mt-1 text-sm text-fg-muted">
                  Accepté le {formatDateTime(user.contestRulesAcceptedAt)}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4 border-t border-border pt-5">
            <div className="max-w-lg">
              <p className="font-medium">Conditions générales d&apos;utilisation</p>
              <p className="mt-1 text-sm text-fg-muted">
                Acceptées lors de la création du compte.
              </p>
              {user.termsAcceptedAt && (
                <p className="mt-1 text-sm text-fg-muted">
                  Acceptées le {formatDateTime(user.termsAcceptedAt)}
                </p>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exercer mes droits</CardTitle>
        </CardHeader>
        <CardBody className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-lg">
              <p className="font-medium">Télécharger mes données</p>
              <p className="mt-1 text-sm text-fg-muted">
                Un fichier contenant l&apos;ensemble des données associées à votre
                compte, dans un format lisible et réutilisable.
              </p>
            </div>
            {/* A plain link, not a button with a fetch: the response is a file, and the
                route handler sets Content-Disposition so the browser downloads it. */}
            <a
              href="/mon-compte/confidentialite/export"
              download
              className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-sm)] border border-border bg-surface px-4 text-sm font-medium hover:bg-muted"
            >
              <Download className="size-4" aria-hidden="true" />
              Télécharger mes données
            </a>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4 border-t border-border pt-5">
            <div className="max-w-lg">
              <p className="font-medium">Supprimer mon compte</p>
              <p className="mt-1 text-sm text-fg-muted">
                Vos données identifiantes sont effacées et vos sessions révoquées.
                Cette action est irréversible.
              </p>
            </div>
            <DeleteAccount />
          </div>
        </CardBody>
      </Card>

      <Alert tone="warning" title="Ce que la suppression ne supprime pas">
        <p>
          Vos participations au jeu sont conservées sous forme anonymisée, sans lien
          avec votre identité. Le règlement déposé chez l&apos;huissier impose en
          effet de pouvoir justifier du bon déroulement du jeu et de la répartition
          des lots, ce que l&apos;article 17.3 du RGPD autorise expressément. Les
          détails figurent dans notre{' '}
          <Link href="/confidentialite" className="underline">
            politique de confidentialité
          </Link>
          .
        </p>
      </Alert>
    </div>
  );
}
