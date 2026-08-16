import type { Metadata } from 'next';
import { Container } from '../../../../components/layout/container';
import { AgeChart } from '../../../../components/charts/age-chart';
import { GenderChart } from '../../../../components/charts/gender-chart';
import { PrizeChart } from '../../../../components/charts/prize-chart';
import { StoreChart } from '../../../../components/charts/store-chart';
import { Card, CardBody, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Table, Td, Th } from '../../../../components/ui/table';
import { getPrize, getStore, stats } from '../../../../lib/mock';
import { formatPrice } from '../../../../lib/utils';

export const metadata: Metadata = {
  title: 'Statistiques',
  robots: { index: false, follow: false },
};

export default function StatistiquesPage() {
  const totalValue = stats.byPrize.reduce(
    (sum, row) => sum + row.won * getPrize(row.prizeId).valueCents,
    0
  );

  const prizeData = stats.byPrize.map((row) => ({
    name: getPrize(row.prizeId).label,
    redeemed: row.redeemed,
    pending: row.won - row.redeemed,
  }));

  const storeData = stats.byStore.map((row) => ({
    name: getStore(row.storeId)?.name ?? row.storeId,
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
                const prize = getPrize(row.prizeId);
                return (
                  <tr key={row.prizeId}>
                    <Td>{prize.label}</Td>
                    <Td className="tabular-nums">{prize.targetPercentage} %</Td>
                    <Td className="tabular-nums">{row.won.toLocaleString('fr-FR')}</Td>
                    <Td className="tabular-nums">
                      {row.redeemed.toLocaleString('fr-FR')}
                    </Td>
                    <Td className="tabular-nums">
                      {Math.round((row.redeemed / row.won) * 100)} %
                    </Td>
                    <Td className="tabular-nums">
                      {formatPrice(row.won * prize.valueCents)}
                    </Td>
                  </tr>
                );
              })}
              <tr>
                <Td className="font-medium">Total</Td>
                <Td className="tabular-nums font-medium">100 %</Td>
                <Td className="tabular-nums font-medium">
                  {stats.byPrize.reduce((s, r) => s + r.won, 0).toLocaleString('fr-FR')}
                </Td>
                <Td className="tabular-nums font-medium">
                  {stats.prizesRedeemed.toLocaleString('fr-FR')}
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
                      <Td className="tabular-nums">
                        {row.codesUsed.toLocaleString('fr-FR')}
                      </Td>
                      <Td className="tabular-nums">
                        {Math.round((row.codesUsed / stats.codesUsed) * 100)} %
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
