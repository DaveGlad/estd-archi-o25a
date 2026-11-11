import type { Metadata } from 'next';
import { Container } from '@theetiptop-contest/ui/container';
import { AgeChart } from '@theetiptop-contest/ui/charts/age-chart';
import { GenderChart } from '@theetiptop-contest/ui/charts/gender-chart';
import { PrizeChart } from '@theetiptop-contest/ui/charts/prize-chart';
import { StoreChart } from '@theetiptop-contest/ui/charts/store-chart';
import { Card, CardBody, CardHeader, CardTitle } from '@theetiptop-contest/ui/card';
import { Table, Td, Th } from '@theetiptop-contest/ui/table';
import { formatCount, formatPrice } from '@theetiptop-contest/ui/utils';
import { getPrizes, getStats } from '@theetiptop-contest/api-client/server';

export const metadata: Metadata = {
  title: 'Statistiques',
  robots: { index: false, follow: false },
};

export default async function StatistiquesPage() {
  // The dashboard aggregates carry the prize label but not its target share or its value;
  // the catalogue is fetched alongside to fill the last two columns of the detail table.
  const [stats, prizes] = await Promise.all([getStats(), getPrizes()]);

  const prizeById = new Map(prizes.map((prize) => [prize.id, prize]));

  const totalValue = stats.byPrize.reduce(
    (sum, row) => sum + row.won * (prizeById.get(row.prizeId)?.valueCents ?? 0),
    0
  );

  const prizeData = stats.byPrize.map((row) => ({
    name: row.prizeLabel,
    redeemed: row.redeemed,
    pending: row.won - row.redeemed,
  }));

  // The store name now comes from the aggregate itself: the API joins it, because the
  // back office has no reason to fetch the whole store catalogue to label a chart.
  const storeData = stats.byStore.map((row) => ({
    name: row.storeName,
    codesUsed: row.codesUsed,
  }));

  return (
    <Container className="py-10">
      <header className="mb-8">
        <h1 className="font-serif text-3xl">Statistiques</h1>
        <p className="mt-2 max-w-2xl text-fg-muted">
          Les données socio-démographiques sont agrégées. Elles ne permettent pas de
          remonter à une personne et servent uniquement à mesurer l&apos;audience de
          l&apos;opération.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par genre</CardTitle>
          </CardHeader>
          <CardBody>
            <GenderChart data={stats.byGender} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Participants par tranche d&apos;âge</CardTitle>
          </CardHeader>
          <CardBody>
            <AgeChart data={stats.byAgeRange} />
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Lots remis et lots en attente de retrait</CardTitle>
        </CardHeader>
        <CardBody>
          <PrizeChart data={prizeData} />
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Détail par lot</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          <Table>
            <caption className="sr-only">
              Lots gagnés, remis, taux de retrait et valeur distribuée, par catégorie de
              lot
            </caption>
            <thead>
              <tr>
                <Th>Lot</Th>
                <Th>Part visée</Th>
                <Th>Gagnés</Th>
                <Th>Remis</Th>
                <Th>Taux de retrait</Th>
                <Th>Valeur distribuée</Th>
              </tr>
            </thead>
            <tbody>
              {stats.byPrize.map((row) => {
                const prize = prizeById.get(row.prizeId);
                return (
                  <tr key={row.prizeId}>
                    <Td>{row.prizeLabel}</Td>
                    <Td className="tabular-nums">{prize?.targetPercentage ?? '—'} %</Td>
                    <Td className="tabular-nums">{formatCount(row.won)}</Td>
                    <Td className="tabular-nums">{formatCount(row.redeemed)}</Td>
                    <Td className="tabular-nums">
                      {/* Guarded: on the morning the contest opens every prize has zero
                          winners, and an unguarded ratio renders "NaN %". */}
                      {row.won > 0 ? `${Math.round((row.redeemed / row.won) * 100)} %` : '—'}
                    </Td>
                    <Td className="tabular-nums">
                      {formatPrice(row.won * (prize?.valueCents ?? 0))}
                    </Td>
                  </tr>
                );
              })}
              <tr>
                <Td className="font-medium">Total</Td>
                <Td className="tabular-nums font-medium">100 %</Td>
                <Td className="tabular-nums font-medium">
                  {formatCount(stats.byPrize.reduce((sum, row) => sum + row.won, 0))}
                </Td>
                <Td className="tabular-nums font-medium">
                  {formatCount(stats.prizesRedeemed)}
                </Td>
                <Td />
                <Td className="tabular-nums font-medium">{formatPrice(totalValue)}</Td>
              </tr>
            </tbody>
          </Table>
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Codes joués par boutique</CardTitle>
        </CardHeader>
        <CardBody>
          <StoreChart data={storeData} />

          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-fg-muted">
              Afficher les valeurs sous forme de tableau
            </summary>
            <div className="mt-3 rounded-[var(--radius-sm)] border border-border">
              <Table>
                <caption className="sr-only">Codes joués par boutique</caption>
                <thead>
                  <tr>
                    <Th>Boutique</Th>
                    <Th>Codes joués</Th>
                    <Th>Part</Th>
                  </tr>
                </thead>
                <tbody>
                  {storeData.map((row) => (
                    <tr key={row.name}>
                      <Td>{row.name}</Td>
                      <Td className="tabular-nums">{formatCount(row.codesUsed)}</Td>
                      <Td className="tabular-nums">
                        {stats.codesUsed > 0
                          ? `${Math.round((row.codesUsed / stats.codesUsed) * 100)} %`
                          : '—'}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </details>
        </CardBody>
      </Card>
    </Container>
  );
}
