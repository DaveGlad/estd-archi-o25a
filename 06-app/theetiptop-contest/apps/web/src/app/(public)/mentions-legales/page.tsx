import type { Metadata } from 'next';
import { Container, PageHeader } from '../../../components/layout/container';

export const metadata: Metadata = {
  title: 'Mentions légales',
  robots: { index: false, follow: true },
};

export default function MentionsLegalesPage() {
  return (
    <>
      <PageHeader title="Mentions légales" />
      <Container className="py-14">
        <div className="rich-text">
          <h2>Éditeur du site</h2>
          <dl>
            <dt>Dénomination sociale</dt>
            <dd>Thé Tip Top</dd>
            <dt>Forme juridique et capital</dt>
            <dd>Société anonyme au capital de 150 000 €</dd>
            <dt>Siège social</dt>
            <dd>18 rue Léon Frot, 75011 Paris</dd>
            <dt>Immatriculation</dt>
            <dd>RCS Paris, numéro à compléter. SIRET à compléter.</dd>
            <dt>TVA intracommunautaire</dt>
            <dd>Numéro à compléter</dd>
            <dt>Contact</dt>
            <dd>contact@theetiptop.fr, 01 43 00 00 11</dd>
            <dt>Directeur de la publication</dt>
            <dd>Monsieur Eric Bourdon</dd>
          </dl>

          <h2>Hébergeur</h2>
          <p>
            Le site est hébergé sur un serveur situé dans l&apos;Union européenne. La
            dénomination, l&apos;adresse et le téléphone de l&apos;hébergeur sont à
            compléter avant la mise en ligne.
          </p>

          <h2>Réalisation</h2>
          <p>
            Site conçu et développé par l&apos;agence Furious Ducks, spécialiste des
            technologies open source.
          </p>

          <h2>Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des contenus présents sur ce site, textes, images, logos,
            éléments graphiques et code source, est protégé par le droit de la
            propriété intellectuelle. Toute reproduction ou représentation, totale ou
            partielle, sans autorisation écrite préalable est interdite.
          </p>
          <p>
            Les typographies utilisées font l&apos;objet de licences dont le détail
            figure dans la charte graphique du projet. Les visuels sont soit produits
            par l&apos;agence, soit acquis sous licence commerciale.
          </p>

          <h2>Projet pédagogique</h2>
          <p>
            <strong>
              Ce site est un projet étudiant fictif, réalisé dans le cadre d&apos;une
              formation. Aucune commande, aucun achat, aucune réservation et aucune
              participation réelle ne peut y être effectué. L&apos;entreprise Thé Tip
              Top, les personnes citées et l&apos;opération décrite sont fictives.
            </strong>
          </p>

          <h2>Signalement de contenu</h2>
          <p>
            Conformément à la loi pour la confiance dans l&apos;économie numérique,
            tout contenu manifestement illicite peut être signalé à l&apos;éditeur à
            l&apos;adresse indiquée ci-dessus.
          </p>
        </div>
      </Container>
    </>
  );
}
