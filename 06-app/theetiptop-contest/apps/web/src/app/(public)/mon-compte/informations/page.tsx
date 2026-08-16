import type { Metadata } from 'next';
import { Button } from '../../../../components/ui/button';
import { Card, CardBody, CardFooter, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Field } from '../../../../components/ui/field';
import { Input, Select } from '../../../../components/ui/input';
import { currentUser } from '../../../../lib/mock';
import { formatDate } from '../../../../lib/utils';

export const metadata: Metadata = { title: 'Mes informations' };

export default function InformationsPage() {
  const user = currentUser();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
        </CardHeader>
        <CardBody>
          <form className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Prénom" htmlFor="firstName" required>
                <Input id="firstName" name="firstName" defaultValue={user.firstName} required />
              </Field>
              <Field label="Nom" htmlFor="lastName" required>
                <Input id="lastName" name="lastName" defaultValue={user.lastName} required />
              </Field>
            </div>

            <Field
              label="Adresse de courriel"
              htmlFor="email"
              required
              hint="Un lien de confirmation sera envoyé à la nouvelle adresse."
            >
              <Input id="email" name="email" type="email" defaultValue={user.email} required />
            </Field>

            <Field label="Téléphone" htmlFor="phone">
              <Input id="phone" name="phone" type="tel" defaultValue={user.phone ?? ''} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Genre" htmlFor="gender">
                <Select id="gender" name="gender" defaultValue={user.gender}>
                  <option value="FEMALE">Femme</option>
                  <option value="MALE">Homme</option>
                  <option value="OTHER">Autre</option>
                  <option value="UNDISCLOSED">Je préfère ne pas répondre</option>
                </Select>
              </Field>
              <Field label="Code postal" htmlFor="postalCode">
                <Input
                  id="postalCode"
                  name="postalCode"
                  inputMode="numeric"
                  maxLength={5}
                  defaultValue={user.postalCode ?? ''}
                />
              </Field>
            </div>
          </form>
        </CardBody>
        <CardFooter className="flex justify-end gap-3">
          <Button variant="secondary">Annuler</Button>
          <Button>Enregistrer</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">Méthode de connexion</p>
              <p className="text-fg-muted">
                {user.provider === 'credential'
                  ? 'Courriel et mot de passe'
                  : `Compte ${user.provider === 'google' ? 'Google' : 'Facebook'}`}
              </p>
            </div>
            <Button variant="secondary" size="sm">
              Changer de mot de passe
            </Button>
          </div>
          <p className="text-fg-muted">
            Compte créé le {formatDate(user.createdAt)}.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
