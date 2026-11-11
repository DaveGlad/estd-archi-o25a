import type { Metadata } from 'next';
import { Download, ShieldCheck } from 'lucide-react';
import { Container } from '@theetiptop-contest/ui/container';
import { Alert } from '@theetiptop-contest/ui/alert';
import { Card, CardBody, CardHeader, CardTitle } from '@theetiptop-contest/ui/card';
import { Stat } from '@theetiptop-contest/ui/stat';
import { Table, Td, Th } from '@theetiptop-contest/ui/table';
import { formatCount } from '@theetiptop-contest/ui/utils';
import { getStats } from '@theetiptop-contest/api-client/server';

export const metadata: Metadata = {
  title: 'Export emailing',
  robots: { index: false, follow: false },
};

/**
 * Exactly the columns the API produces.
 *
 * Listed here so the screen tells the administrator what leaves the system before they
 * click, rather than after they open the file. The set is fixed and not configurable, and
 * the card below says why.
 */
const EXPORTED_COLUMNS = [
  { name: 'email', why: 'Destinataire de la campagne.' },
  { name: 'prenom', why: 'Personnalisation de l’objet et du corps du message.' },
  { name: 'nom', why: 'Personnalisation, et rapprochement en cas de réclamation.' },
  { name: 'consentement_le', why: 'Date du consentement : la preuve opposable.' },
  { name: 'tranche_age', why: 'Segmentation, sans exposer la date de naissance.' },
  { name: 'nombre_participations', why: 'Ciblage des clients les plus engagés.' },
];

export default async function ExportPage() {
  const stats = await getStats();

  const optInRate =
    stats.participants > 0 ? Math.round((stats.marketingOptIn / stats.participants) * 100) : 0;

  return (
    <Container className="py-10">
      <header className="mb-8">
        <h1 className="font-serif text-3xl">Export pour l&apos;emailing</h1>
        <p className="mt-2 max-w-2xl text-fg-muted">
          L&apos;export ne contient que les participants ayant explicitement consenti à
          recevoir des communications commerciales. Chaque extraction est tracée au
          journal d&apos;audit avec votre identité.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Participants" value={formatCount(stats.participants)} />
        <Stat
          label="Contacts exportables"
          value={formatCount(stats.marketingOptIn)}
          hint={`${optInRate} % des participants`}
          icon={<ShieldCheck className="size-4" aria-hidden="true" />}
        />
        <Stat
          label="Contacts exclus"
          value={formatCount(Math.max(0, stats.participants - stats.marketingOptIn))}
          hint="Sans consentement commercial"
        />
      </div>

      <Card className="mt-6 max-w-2xl">
        <CardHeader>
          <CardTitle>Télécharger l&apos;export</CardTitle>
        </CardHeader>
        <CardBody className="space-y-5">
          {/* Plain links rather than a form with a format <select> and a submit button: the
              response is a file, and two links are both simpler and keyboard-accessible
              without any JavaScript. */}
          <div className="flex flex-wrap gap-3">
            <a
              href="/admin/export/download?format=csv"
              download
              className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-sm)] bg-primary px-5 text-sm font-medium text-primary-fg hover:bg-primary-hover"
            >
              <Download className="size-4" aria-hidden="true" />
              Export CSV
            </a>
            <a
              href="/admin/export/download?format=json"
              download
              className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-sm)] border border-border bg-surface px-5 text-sm font-medium hover:bg-muted"
            >
              <Download className="size-4" aria-hidden="true" />
              Export JSON
            </a>
          </div>

          <p className="text-sm text-fg-muted">
            Le CSV utilise le point-virgule comme séparateur et porte un BOM UTF-8 : il
            s&apos;ouvre tel quel dans Excel en configuration française, accents compris.
          </p>
        </CardBody>
      </Card>

      <Card className="mt-6 max-w-2xl">
        <CardHeader>
          <CardTitle>Ce que contient l&apos;export</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          <Table>
            <caption className="sr-only">Colonnes exportées et leur finalité</caption>
            <thead>
              <tr>
                <Th>Colonne</Th>
                <Th>Finalité</Th>
              </tr>
            </thead>
            <tbody>
              {EXPORTED_COLUMNS.map((column) => (
                <tr key={column.name}>
                  <Td className="font-mono text-sm">{column.name}</Td>
                  <Td className="text-sm text-fg-muted">{column.why}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      <div className="mt-6 max-w-2xl space-y-4">
        <Alert tone="info" title="Pourquoi le périmètre n'est pas paramétrable">
          <p>
            Le jeu de colonnes est fixe et volontairement minimal. Ni téléphone, ni code
            postal, ni date de naissance exacte : une campagne a besoin d&apos;adresser
            et de segmenter, pas de détenir un profil. C&apos;est le principe de
            minimisation de l&apos;article 5.1.c du RGPD, et un export configurable
            serait un export dont personne ne peut dire ce qu&apos;il contenait.
          </p>
        </Alert>

        <Alert tone="warning" title="Rappel sur l'usage de cet export">
          <p>
            Ces données ne peuvent servir qu&apos;aux finalités annoncées lors de la
            collecte. Elles ne doivent être ni cédées, ni revendues, ni utilisées pour
            une autre marque. Chaque export est journalisé avec votre identifiant, la
            date et le nombre de lignes extraites.
          </p>
        </Alert>
      </div>
    </Container>
  );
}
