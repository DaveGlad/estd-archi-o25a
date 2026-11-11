import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Card, CardBody, CardHeader, CardTitle } from '@theetiptop-contest/ui/card';
import { formatDate } from '@theetiptop-contest/ui/utils';
import { getCurrentUser } from '@theetiptop-contest/api-client/server';

import { ProfileForm } from '../../../../components/account/profile-form';

export const metadata: Metadata = { title: 'Mes informations' };

const PROVIDER_LABELS: Record<string, string> = {
  credential: 'Courriel et mot de passe',
  google: 'Compte Google',
  facebook: 'Compte Facebook',
};

export default async function InformationsPage() {
  const user = await getCurrentUser();

  // The layout already guards the area; this is here so TypeScript knows `user` is not
  // null, and so the page is still correct if it is ever rendered outside that layout.
  if (!user) redirect('/connexion?next=/mon-compte/informations');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
        </CardHeader>
        <ProfileForm user={user} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4 text-sm">
          <div>
            <p className="font-medium">Méthode de connexion</p>
            <p className="text-fg-muted">
              {PROVIDER_LABELS[user.provider] ?? user.provider}
            </p>
          </div>
          <p className="text-fg-muted">Compte créé le {formatDate(user.createdAt)}.</p>
        </CardBody>
      </Card>
    </div>
  );
}
