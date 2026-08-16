import type { Metadata } from 'next';
import Link from 'next/link';
import { Download, Trash2 } from 'lucide-react';
import { Alert } from '../../../../components/ui/alert';
import { Button } from '../../../../components/ui/button';
import { Card, CardBody, CardHeader, CardTitle } from '../../../../components/ui/card';
import { currentUser } from '../../../../lib/mock';
import { formatDateTime } from '../../../../lib/utils';

export const metadata: Metadata = { title: 'Mes données et confidentialité' };

export default function ConfidentialiteComptePage() {
  const user = currentUser();

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
                <p className="mt-1 text-xs text-fg-muted">
                  Consentement donné le {formatDateTime(user.marketingConsentAt)}
                </p>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                defaultChecked={user.marketingConsent}
                className="size-4"
              />
              Activé
            </label>
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
                <p className="mt-1 text-xs text-fg-muted">
                  Accepté le {formatDateTime(user.contestRulesAcceptedAt)}
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
                Recevez un fichier contenant l&apos;ensemble des données associées à
                votre compte, dans un format lisible et réutilisable.
              </p>
            </div>
            <Button variant="secondary">
              <Download className="size-4" aria-hidden="true" />
              Demander l&apos;export
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
            <div className="max-w-lg">
              <p className="font-medium">Supprimer mon compte</p>
              <p className="mt-1 text-sm text-fg-muted">
                Votre compte et vos données personnelles sont supprimés. Cette action
                est irréversible.
              </p>
            </div>
            <Button variant="danger">
              <Trash2 className="size-4" aria-hidden="true" />
              Supprimer mon compte
            </Button>
          </div>
        </CardBody>
      </Card>

      <Alert tone="warning" title="Ce que la suppression ne supprime pas">
        <p>
          Vos participations au jeu sont conservées sous forme anonymisée, sans lien
          avec votre identité. Le règlement déposé chez l&apos;huissier impose en
          effet de pouvoir justifier du bon déroulement du jeu et de la répartition
          des lots. Les détails figurent dans notre{' '}
          <Link href="/confidentialite" className="underline">
            politique de confidentialité
          </Link>
          .
        </p>
      </Alert>
    </div>
  );
}
