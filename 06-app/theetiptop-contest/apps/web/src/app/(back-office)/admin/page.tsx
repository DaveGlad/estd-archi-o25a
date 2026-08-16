import type { Metadata } from 'next';
import Link from 'next/link';
import { Gift, Ticket, TrendingUp, Users } from 'lucide-react';
import { Container } from '../../../components/layout/container';
import { ParticipationChart } from '../../../components/charts/participation-chart';
import { PrizeChart } from '../../../components/charts/prize-chart';
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/card';
import { Stat } from '../../../components/ui/stat';
import { MOCK_TODAY, contest, getPrize, stats } from '../../../lib/mock';
import { daysUntil, formatDate } from '../../../lib/utils';

export const metadata: Metadata = {
  title: 'Tableau de bord',
  robots: { index: false, follow: false },
};

export default function AdminDashboardPage() {
  const daysLeft = daysUntil(contest.endsAt, MOCK_TODAY);
  const usageRate = Math.round((stats.codesUsed / stats.codesIssued) * 100);
  const redemptionRate = Math.round((stats.prizesRedeemed / stats.codesUsed) * 100);

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
          label="Codes distribués"
          value={stats.codesIssued.toLocaleString('fr-FR')}
          hint="Générés avant l’ouverture"
          icon={<Ticket className="size-4" aria-hidden="true" />}
        />
        <Stat
          label="Codes utilisés"
          value={stats.codesUsed.toLocaleString('fr-FR')}
          hint={`${usageRate} % des codes en jeu`}
          icon={<TrendingUp className="size-4" aria-hidden="true" />}
        />
        <Stat
          label="Participants"
          value={stats.participants.toLocaleString('fr-FR')}
          hint="Comptes distincts ayant joué"
          icon={<Users className="size-4" aria-hidden="true" />}
        />
        <Stat
          label="Lots remis"
          value={stats.prizesRedeemed.toLocaleString('fr-FR')}
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
                name: getPrize(row.prizeId).label,
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
          { href: '/admin/export', title: 'Export emailing', text: `${stats.marketingOptIn.toLocaleString('fr-FR')} contacts consentants.` },
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
