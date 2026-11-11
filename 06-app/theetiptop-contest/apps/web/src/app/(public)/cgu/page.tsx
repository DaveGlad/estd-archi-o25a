import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, PageHeader } from '@theetiptop-contest/ui/container';

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  robots: { index: false, follow: true },
};

export default function CguPage() {
  return (
    <>
      <PageHeader
        title="Conditions générales d'utilisation"
        intro="Dernière mise à jour : 20 octobre 2026"
      />
      <Container className="py-14">
        <div className="rich-text">
          <h2>Article 1, objet</h2>
          <p>
            Les présentes conditions définissent les modalités d&apos;accès et
            d&apos;utilisation du site du jeu-concours Thé Tip Top. Toute utilisation
            du site vaut acceptation sans réserve des présentes conditions.
          </p>
          <p>
            Le règlement complet du jeu fait l&apos;objet d&apos;un document distinct,
            déposé auprès de Maître Arnaud Rick, huissier de justice, et{' '}
            <Link href="/jeu-concours/reglement">accessible depuis le site</Link>. En
            cas de contradiction entre les présentes conditions et le règlement, le
            règlement prévaut pour tout ce qui concerne le déroulement du jeu.
          </p>

          <h2>Article 2, accès au site</h2>
          <p>
            L&apos;accès aux pages d&apos;information, à la présentation des lots et au
            règlement est libre et gratuit. La participation au jeu requiert la
            création d&apos;un compte.
          </p>
          <p>
            Le site est accessible en continu, sous réserve des interruptions
            nécessaires à la maintenance ou résultant d&apos;un cas de force majeure.
            Les frais de connexion et d&apos;équipement restent à la charge de
            l&apos;utilisateur.
          </p>

          <h2>Article 3, création de compte</h2>
          <p>
            La création d&apos;un compte est ouverte à toute personne physique majeure
            résidant en France métropolitaine. Elle s&apos;effectue par formulaire ou
            par l&apos;intermédiaire d&apos;un compte Google ou Facebook.
          </p>
          <p>
            L&apos;utilisateur s&apos;engage à fournir des informations exactes et à
            les tenir à jour. Il est seul responsable de la confidentialité de ses
            identifiants. <strong>Un utilisateur ne peut détenir qu&apos;un seul
            compte.</strong> La création de plusieurs comptes par une même personne
            entraîne leur suppression et l&apos;annulation des participations
            correspondantes.
          </p>

          <h2>Article 4, participation au jeu</h2>
          <p>
            La participation s&apos;effectue par la saisie d&apos;un code à dix
            caractères figurant sur un ticket de caisse ou une facture d&apos;un
            montant supérieur à 49 € émis dans une boutique Thé Tip Top pendant la
            période du jeu.
          </p>
          <ul>
            <li>Chaque code ne peut être utilisé qu&apos;une seule fois.</li>
            <li>
              Un utilisateur peut saisir autant de codes qu&apos;il détient de tickets
              éligibles.
            </li>
            <li>
              Le lot associé à chaque code est déterminé avant l&apos;ouverture du jeu
              et ne dépend ni du moment de la saisie ni de l&apos;identité du
              participant.
            </li>
          </ul>
          <p>
            Toute tentative de fraude, notamment l&apos;utilisation de moyens
            automatisés pour générer ou tester des codes, entraîne l&apos;exclusion
            immédiate et l&apos;annulation de toutes les participations de
            l&apos;utilisateur concerné.
          </p>

          <h2>Article 5, attribution et remise des lots</h2>
          <p>
            Le lot gagné est affiché immédiatement après la saisie du code et confirmé
            par courriel. Le participant dispose de la période du jeu, puis de trente
            jours suivant sa clôture, pour réclamer son lot. Passé ce délai, le lot est
            perdu sans possibilité de recours ni de compensation.
          </p>
          <p>
            Les lots sont retirés en boutique ou en ligne. Ils ne peuvent être ni
            échangés, ni repris, ni faire l&apos;objet d&apos;une contrepartie
            financière.
          </p>
          <p>
            Le tirage au sort du gros lot est effectué à l&apos;issue du jeu, sous le
            contrôle de l&apos;huissier dépositaire du règlement.{' '}
            <strong>
              Le nombre de participations d&apos;un utilisateur n&apos;augmente pas ses
              chances d&apos;être tiré au sort.
            </strong>
          </p>

          <h2>Article 6, comportement de l&apos;utilisateur</h2>
          <p>
            L&apos;utilisateur s&apos;engage à ne pas perturber le fonctionnement du
            site, à ne pas tenter d&apos;accéder à des parties non publiques, à ne pas
            extraire massivement de données et à ne pas utiliser le site à des fins
            contraires à la loi. Tout manquement peut entraîner la suspension ou la
            suppression du compte, sans préavis et sans indemnité.
          </p>

          <h2>Article 7, données personnelles</h2>
          <p>
            Le traitement des données personnelles est décrit dans la{' '}
            <Link href="/confidentialite">politique de confidentialité</Link>, qui fait
            partie intégrante des présentes conditions.
          </p>

          <h2>Article 8, propriété intellectuelle</h2>
          <p>
            Les contenus du site sont protégés. Toute reproduction non autorisée est
            interdite, dans les conditions rappelées dans les{' '}
            <Link href="/mentions-legales">mentions légales</Link>.
          </p>

          <h2>Article 9, responsabilité</h2>
          <p>
            L&apos;éditeur met en œuvre les moyens raisonnables pour assurer
            l&apos;exactitude des informations publiées et la disponibilité du site,
            sans garantie d&apos;absence totale d&apos;erreur ou d&apos;interruption. Sa
            responsabilité ne saurait être engagée en cas de dommage résultant
            d&apos;une utilisation non conforme du site, d&apos;une défaillance du
            réseau ou de l&apos;équipement de l&apos;utilisateur, ou d&apos;un cas de
            force majeure.
          </p>

          <h2>Article 10, liens externes</h2>
          <p>
            Le site peut contenir des liens vers des sites tiers, notamment vers les
            réseaux sociaux de la marque. L&apos;éditeur n&apos;exerce aucun contrôle
            sur ces sites et décline toute responsabilité quant à leur contenu.
          </p>

          <h2>Article 11, modification des conditions</h2>
          <p>
            L&apos;éditeur se réserve le droit de modifier les présentes conditions à
            tout moment. La version applicable est celle en vigueur au moment de
            l&apos;utilisation du site. Les modifications ne peuvent en aucun cas
            affecter les règles du jeu telles que déposées chez l&apos;huissier.
          </p>

          <h2>Article 12, droit applicable et litiges</h2>
          <p>
            Les présentes conditions sont soumises au droit français. En cas de litige,
            l&apos;utilisateur peut adresser une réclamation à l&apos;éditeur. À défaut
            de résolution amiable, il peut recourir gratuitement à un médiateur de la
            consommation. À défaut d&apos;accord, les tribunaux français sont
            compétents.
          </p>
        </div>
      </Container>
    </>
  );
}
