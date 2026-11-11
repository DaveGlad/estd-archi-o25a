import type { Metadata } from 'next';
import Link from 'next/link';
import { Gift, Ticket, TrendingUp, Users } from 'lucide-react';
import { Container } from '@theetiptop-contest/ui/container';
import { ParticipationChart } from '@theetiptop-contest/ui/charts/participation-chart';
import { PrizeChart } from '@theetiptop-contest/ui/charts/prize-chart';
import { Card, CardBody, CardHeader, CardTitle } from '@theetiptop-contest/ui/card';
import { Stat } from '@theetiptop-contest/ui/stat';
import { daysUntil, formatCount, formatDate } from '@theetiptop-contest/ui/utils';
import { getContest, getStats } from '@theetiptop-contest/api-client/server';

export const metadata: Metadata = {
  title: 'Tableau de bord',
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const [contest, stats] = await Promise.all([getContest(), getStats()]);

  const daysLeft = daysUntil(contest.endsAt);

  // Guarded divisions: on the morning the contest opens, `codesUsed` is 0 and an
  // unguarded ratio renders "NaN %" on the dashboard an administrator is watching.
  const usageRate =
    stats.codesIssued > 0 ? Math.round((stats.codesUsed / stats.codesIssued) * 100) : 0;
  const redemptionRate =
    stats.codesUsed > 0 ? Math.round((stats.prizesRedeemed / stats.codesUsed) * 100) : 0;

  return (
    <Container className="py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-accent-strong uppercase">
            {contest.name}
          </p>
          <h1 className="mt-2 font-serif text-3xl">Tableau de bord</h1>
          <p className="mt-2 text-fg-muted">
            Jeu ouvert jusqu&apos;au {formatDate(contest.endsAt)}, soit {daysLeft} jours
            restants.
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Codes en jeu"
          value={formatCount(stats.codesIssued)}
          hint={`${formatCount(stats.codesDispensed)} distribués en caisse`}
          icon={<Ticket className="size-4" aria-hidden="true" />}
        />
        <Stat
          label="Codes utilisés"
          value={formatCount(stats.codesUsed)}
          hint={`${usageRate} % des codes en jeu`}
          icon={<TrendingUp className="size-4" aria-hidden="true" />}
        />
        <Stat
          label="Participants"
          value={formatCount(stats.participants)}
          hint="Comptes distincts ayant joué"
          icon={<Users className="size-4" aria-hidden="true" />}
        />
        <Stat
          label="Lots remis"
          value={formatCount(stats.prizesRedeemed)}
          hint={`${redemptionRate} % des lots gagnés`}
          icon={<Gift className="size-4" aria-hidden="true" />}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Participations par jour</CardTitle>
          </CardHeader>
          <CardBody>
            <ParticipationChart data={stats.dailyParticipations} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lots remis et en attente</CardTitle>
          </CardHeader>
          <CardBody>
            <PrizeChart
              data={stats.byPrize.map((row) => ({
                name: row.prizeLabel,
                redeemed: row.redeemed,
                pending: row.won - row.redeemed,
              }))}
            />
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { href: '/admin/statistiques', title: 'Statistiques détaillées', text: 'Profil des gagnants, activité par boutique.' },
          { href: '/admin/export', title: 'Export emailing', text: `${formatCount(stats.marketingOptIn)} contacts consentants.` },
          { href: '/admin/tirage', title: 'Tirage au sort', text: 'À effectuer à la clôture, sous contrôle d’huissier.' },
        ].map((link) => (
          <Link key={link.href} href={link.href} className="block">
            <Card className="h-full transition-colors hover:bg-muted">
              <CardBody>
                <p className="font-medium">{link.title}</p>
                <p className="mt-1 text-sm text-fg-muted">{link.text}</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </Container>
  );
}
