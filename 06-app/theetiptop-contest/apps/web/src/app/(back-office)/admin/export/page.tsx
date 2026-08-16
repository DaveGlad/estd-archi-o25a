import type { Metadata } from 'next';
import { Download, ShieldCheck } from 'lucide-react';
import { Container } from '../../../../components/layout/container';
import { Alert } from '../../../../components/ui/alert';
import { Button } from '../../../../components/ui/button';
import { Card, CardBody, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Field } from '../../../../components/ui/field';
import { Select } from '../../../../components/ui/input';
import { Stat } from '../../../../components/ui/stat';
import { stats } from '../../../../lib/mock';

export const metadata: Metadata = {
  title: 'Export emailing',
  robots: { index: false, follow: false },
};

export default function ExportPage() {
  const optInRate = Math.round((stats.marketingOptIn / stats.participants) * 100);

  return (
    <Container className="py-10">
      <header className="mb-8">
        <h1 className="font-serif text-3xl">Export pour l&apos;emailing</h1>
        <p className="mt-2 max-w-2xl text-fg-muted">
          L&apos;export ne contient que les participants ayant explicitement consenti à
          recevoir des communications commerciales. Chaque extraction est tracée.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Participants" value={stats.participants.toLocaleString('fr-FR')} />
        <Stat
          label="Contacts exportables"
          value={stats.marketingOptIn.toLocaleString('fr-FR')}
          hint={`${optInRate} % des participants`}
          icon={<ShieldCheck className="size-4" aria-hidden="true" />}
        />
        <Stat
          label="Contacts exclus"
          value={(stats.participants - stats.marketingOptIn).toLocaleString('fr-FR')}
          hint="Sans consentement marketing"
        />
      </div>

      <Card className="mt-6 max-w-2xl">
        <CardHeader>
          <CardTitle>Générer un export</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <Field label="Format" htmlFor="format">
            <Select id="format" defaultValue="csv">
              <option value="csv">CSV, compatible avec la plupart des outils</option>
              <option value="json">JSON</option>
            </Select>
          </Field>

          <Field
            label="Périmètre"
            htmlFor="scope"
            hint="Seuls les contacts consentants sont inclus, quel que soit le périmètre."
          >
            <Select id="scope" defaultValue="all">
              <option value="all">Tous les participants consentants</option>
              <option value="winners">Gagnants d’un coffret uniquement</option>
              <option value="pending">Lots non encore réclamés</option>
            </Select>
          </Field>

          <Field label="Champs exportés" htmlFor="fields">
            <Select id="fields" defaultValue="minimal">
              <option value="minimal">Courriel et prénom</option>
              <option value="standard">Courriel, prénom, nom, code postal</option>
            </Select>
          </Field>

          <Button size="lg">
            <Download className="size-4" aria-hidden="true" />
            Générer l&apos;export
          </Button>
        </CardBody>
      </Card>

      <div className="mt-6 max-w-2xl">
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
