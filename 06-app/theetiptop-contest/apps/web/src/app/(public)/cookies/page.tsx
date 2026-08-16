import type { Metadata } from 'next';
import { Container, PageHeader } from '../../../components/layout/container';
import { Button } from '../../../components/ui/button';
import { Card, CardBody } from '../../../components/ui/card';

export const metadata: Metadata = {
  title: 'Gestion des cookies',
  robots: { index: false, follow: true },
};

const categories = [
  {
    id: 'necessary',
    name: 'Cookies nécessaires',
    text: 'Session, sécurité et préférences d’affichage. Sans eux, le site ne peut pas fonctionner.',
    required: true,
  },
  {
    id: 'analytics',
    name: 'Mesure d’audience',
    text: 'Statistiques de fréquentation, pour comprendre quelles pages sont consultées et améliorer le parcours.',
    required: false,
  },
  {
    id: 'social',
    name: 'Réseaux sociaux et publicité',
    text: 'Partage de contenus et mesure des campagnes publicitaires.',
    required: false,
  },
];

export default function CookiesPage() {
  return (
    <>
      <PageHeader
        title="Gestion des cookies"
        intro="Vous décidez, catégorie par catégorie. Refuser est aussi simple qu’accepter, et votre choix reste modifiable à tout moment depuis cette page."
      />
      <Container className="py-14">
        <ul className="max-w-3xl space-y-4">
          {categories.map((category) => (
            <li key={category.id}>
              <Card>
                <CardBody className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-xl">
                    <p className="font-medium">{category.name}</p>
                    <p className="mt-1 text-sm text-fg-muted">{category.text}</p>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      defaultChecked={category.required}
                      disabled={category.required}
                      className="size-4"
                    />
                    {category.required ? 'Toujours actif' : 'Autoriser'}
                  </label>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button>Enregistrer mes choix</Button>
          <Button variant="secondary">Tout accepter</Button>
          <Button variant="secondary">Tout refuser</Button>
        </div>
      </Container>
    </>
  );
}
