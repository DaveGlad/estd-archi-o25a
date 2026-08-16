import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '../../../../components/layout/container';
import { PrizeStatusBadge } from '../../../../components/account/prize-status';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card, CardBody } from '../../../../components/ui/card';
import { Field } from '../../../../components/ui/field';
import { Input, Select } from '../../../../components/ui/input';
import { Table, Td, Th } from '../../../../components/ui/table';
import { getPrize, participations, stats, users } from '../../../../lib/mock';
import { formatDate } from '../../../../lib/utils';

export const metadata: Metadata = {
  title: 'Participants',
  robots: { index: false, follow: false },
};

export default function ParticipantsPage() {
  return (
    <Container className="py-10">
      <header className="mb-8">
        <h1 className="font-serif text-3xl">Participants</h1>
        <p className="mt-2 text-fg-muted">
          {stats.participants.toLocaleString('fr-FR')} comptes ont joué au moins un
          code. Les {participations.length} participations les plus récentes sont
          affichées.
        </p>
      </header>

      <Card className="mb-6">
        <CardBody>
          <form className="flex flex-wrap items-end gap-4">
            <div className="min-w-56 flex-1">
              <Field label="Rechercher" htmlFor="q">
                <Input id="q" placeholder="Nom, courriel ou code" />
              </Field>
            </div>
            <div className="min-w-44">
              <Field label="Statut du lot" htmlFor="status">
                <Select id="status" defaultValue="">
                  <option value="">Tous</option>
                  <option value="TO_CLAIM">À réclamer</option>
                  <option value="REDEEMED">Remis</option>
                  <option value="EXPIRED">Expiré</option>
                </Select>
              </Field>
            </div>
            <div className="min-w-44">
              <Field label="Lot" htmlFor="prize">
                <Select id="prize" defaultValue="">
                  <option value="">Tous</option>
                  {stats.byPrize.map((row) => (
                    <option key={row.prizeId} value={row.prizeId}>
                      {getPrize(row.prizeId).label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Button type="submit">Filtrer</Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Participant</Th>
                <Th>Inscription</Th>
                <Th>Code</Th>
                <Th>Lot</Th>
                <Th>Statut</Th>
                <Th>Joué le</Th>
              </tr>
            </thead>
            <tbody>
              {participations.map((participation) => {
                const user = users.find((u) => u.id === participation.userId);
                const prize = getPrize(participation.prizeId);
                return (
                  <tr key={participation.id}>
                    <Td>
                      <span className="font-medium">
                        {user?.firstName} {user?.lastName}
                      </span>
                      <br />
                      <span className="text-xs text-fg-muted">{user?.email}</span>
                    </Td>
                    <Td>
                      <Badge>
                        {user?.provider === 'credential'
                          ? 'Formulaire'
                          : user?.provider === 'google'
                            ? 'Google'
                            : 'Facebook'}
                      </Badge>
                    </Td>
                    <Td className="font-mono text-xs tracking-wider">
                      {participation.ticketCode}
                    </Td>
                    <Td>{prize.label}</Td>
                    <Td>
                      <PrizeStatusBadge status={participation.prizeStatus} />
                    </Td>
                    <Td className="whitespace-nowrap">
                      {formatDate(participation.createdAt)}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      <p className="mt-4 text-sm text-fg-muted">
        Besoin de retrouver un client pour lui remettre son lot ?{' '}
        <Link href="/employe" className="underline">
          Utilisez l&apos;espace boutique
        </Link>
        .
      </p>
    </Container>
  );
}
