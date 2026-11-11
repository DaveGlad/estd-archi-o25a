import type { Metadata } from 'next';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Container, PageHeader } from '@theetiptop-contest/ui/container';
import { Button } from '@theetiptop-contest/ui/button';
import { Card, CardBody } from '@theetiptop-contest/ui/card';
import { Field } from '@theetiptop-contest/ui/field';
import { Input, Select, Textarea } from '@theetiptop-contest/ui/input';

export const metadata: Metadata = {
  title: 'Nous contacter',
  description:
    'Une question sur le jeu-concours, un code qui ne fonctionne pas, un lot à réclamer ? Écrivez-nous.',
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Nous contacter"
        intro="Nous répondons sous deux jours ouvrés. Pour une question sur un code, pensez à joindre une photo de votre ticket."
      />

      <Container className="grid gap-10 py-14 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <Card>
          <CardBody>
            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Prénom" htmlFor="firstName" required>
                  <Input id="firstName" name="firstName" required />
                </Field>
                <Field label="Nom" htmlFor="lastName" required>
                  <Input id="lastName" name="lastName" required />
                </Field>
              </div>

              <Field label="Adresse de courriel" htmlFor="email" required>
                <Input id="email" name="email" type="email" required />
              </Field>

              <Field label="Sujet" htmlFor="subject" required>
                <Select id="subject" name="subject" required>
                  <option value="">Choisissez un sujet</option>
                  <option value="code">Un code ne fonctionne pas</option>
                  <option value="lot">Le retrait d’un lot</option>
                  <option value="compte">Mon compte</option>
                  <option value="donnees">Mes données personnelles</option>
                  <option value="autre">Autre</option>
                </Select>
              </Field>

              <Field label="Message" htmlFor="message" required>
                <Textarea id="message" name="message" required />
              </Field>

              <label className="flex gap-3 text-sm">
                <input type="checkbox" name="consent" required className="mt-0.5 size-4 shrink-0" />
                <span>
                  J&apos;accepte que ces informations soient utilisées pour traiter ma
                  demande. <span className="text-danger">*</span>
                </span>
              </label>

              <Button type="submit" size="lg">
                Envoyer le message
              </Button>
            </form>
          </CardBody>
        </Card>

        <aside className="space-y-5">
          <Card>
            <CardBody className="space-y-4 text-sm">
              <div className="flex gap-3">
                <Mail className="mt-0.5 size-5 shrink-0 text-accent-strong" aria-hidden="true" />
                <div>
                  <p className="font-medium">Par courriel</p>
                  <p className="text-fg-muted">contact@theetiptop.fr</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Phone className="mt-0.5 size-5 shrink-0 text-accent-strong" aria-hidden="true" />
                <div>
                  <p className="font-medium">Par téléphone</p>
                  <p className="text-fg-muted">01 43 00 00 11, du lundi au samedi</p>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-accent-strong" aria-hidden="true" />
                <div>
                  <p className="font-medium">Siège social</p>
                  <p className="text-fg-muted">18 rue Léon Frot, 75011 Paris</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </aside>
      </Container>
    </>
  );
}
