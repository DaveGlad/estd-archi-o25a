import type { Metadata } from 'next';
import { Lock } from 'lucide-react';
import { Container } from '@theetiptop-contest/ui/container';
import { Alert } from '@theetiptop-contest/ui/alert';
import { Button } from '@theetiptop-contest/ui/button';
import { Card, CardBody, CardFooter, CardHeader, CardTitle } from '@theetiptop-contest/ui/card';
import { Field } from '@theetiptop-contest/ui/field';
import { Input } from '@theetiptop-contest/ui/input';
import { Table, Td, Th } from '@theetiptop-contest/ui/table';
import { formatCount, formatDate, formatPrice } from '@theetiptop-contest/ui/utils';
import { getContest, getTicketPrizes } from '@theetiptop-contest/api-client/server';

export const metadata: Metadata = {
  title: 'Paramétrage du jeu',
  robots: { index: false, follow: false },
};

export default async function ParametragePage() {
  const [contest, prizes] = await Promise.all([getContest(), getTicketPrizes()]);

  return (
    <Container className="py-10">
      <header className="mb-8">
        <h1 className="font-serif text-3xl">Paramétrage du jeu</h1>
        <p className="mt-2 max-w-2xl text-fg-muted">
          Les règles du jeu sont des données, pas des valeurs inscrites dans le code.
          Elles restent modifiables tant que le règlement n&apos;a pas été déposé.
        </p>
      </header>

      {contest.rulesFiledAt ? (
        <Alert tone="warning" title="Paramètres verrouillés">
          <p>
            Le règlement a été déposé le {formatDate(contest.rulesFiledAt)} auprès de{' '}
            {contest.bailiffName}. Les dates, le montant minimum et la répartition des
            lots ne peuvent plus être modifiés : ils constituent un engagement opposable
            aux participants.
          </p>
        </Alert>
      ) : (
        <Alert tone="info" title="Règlement non encore déposé">
          <p>
            Les paramètres restent modifiables jusqu&apos;au dépôt du règlement auprès de
            l&apos;huissier. Après le dépôt, ils constituent un engagement opposable aux
            participants et sont verrouillés.
          </p>
        </Alert>
      )}

      <Card className="mt-6 max-w-3xl">
        <CardHeader>
          <CardTitle>Période et conditions</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <Field label="Nom de l'opération" htmlFor="name">
            <Input id="name" defaultValue={contest.name} disabled />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Ouverture" htmlFor="start">
              <Input id="start" type="date" defaultValue={contest.startsAt.slice(0, 10)} disabled />
            </Field>
            <Field label="Clôture" htmlFor="end">
              <Input id="end" type="date" defaultValue={contest.endsAt.slice(0, 10)} disabled />
            </Field>
            <Field label="Fin des réclamations" htmlFor="claim">
              <Input id="claim" type="date" defaultValue={contest.claimDeadline.slice(0, 10)} disabled />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Montant minimum d'achat" htmlFor="min">
              <Input id="min" defaultValue={formatPrice(contest.minimumPurchaseCents)} disabled />
            </Field>
            <Field label="Nombre de codes" htmlFor="count">
              <Input id="count" defaultValue={formatCount(contest.plannedCodeCount)} disabled />
            </Field>
            <Field label="Longueur du code" htmlFor="len">
              <Input id="len" defaultValue={String(contest.codeLength)} disabled />
            </Field>
          </div>
        </CardBody>
        <CardFooter className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-fg-muted">
            <Lock className="size-4" aria-hidden="true" />
            Modification impossible après le dépôt du règlement
          </span>
          <Button disabled>Enregistrer</Button>
        </CardFooter>
      </Card>

      <Card className="mt-6 max-w-3xl">
        <CardHeader>
          <CardTitle>Répartition des lots</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Lot</Th>
                <Th>Part</Th>
                <Th>Quantité générée</Th>
                <Th>Valeur unitaire</Th>
              </tr>
            </thead>
            <tbody>
              {prizes.map((prize) => (
                <tr key={prize.id}>
                  <Td>{prize.label}</Td>
                  <Td className="tabular-nums">{prize.targetPercentage} %</Td>
                  <Td className="tabular-nums">
                    {formatCount(prize.targetQuantity ?? 0)}
                  </Td>
                  <Td className="tabular-nums">{formatPrice(prize.valueCents)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
        <CardFooter className="text-fg-muted">
          Un contrôle automatique a recompté ces quantités en base après la génération.
          Le rapport est archivé et opposable en cas de contestation.
        </CardFooter>
      </Card>
    </Container>
  );
}
