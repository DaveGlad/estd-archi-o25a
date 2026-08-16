import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, PageHeader } from '../../../components/layout/container';
import { Table, Td, Th } from '../../../components/ui/table';
import { Alert } from '../../../components/ui/alert';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  robots: { index: false, follow: true },
};

const rows = [
  ['Nom, prénom, courriel', 'Gestion du compte et attribution des lots', 'Exécution du contrat', '3 ans après le dernier contact'],
  ['Mot de passe chiffré', 'Sécurité du compte', 'Exécution du contrat', '3 ans après le dernier contact'],
  ['Genre, date de naissance', 'Statistiques anonymisées sur les gagnants', 'Intérêt légitime', '3 ans après le dernier contact'],
  ['Codes joués, lots, remises', 'Preuve du bon déroulement du jeu', 'Obligation liée au règlement déposé', '5 ans'],
  ['Courriel pour la communication', 'Envoi d’offres commerciales', 'Consentement', 'Jusqu’au retrait du consentement'],
  ['Adresse IP hachée', 'Prévention de la fraude', 'Intérêt légitime', '12 mois'],
  ['Données de mesure d’audience', 'Analyse de la fréquentation', 'Consentement', '13 mois'],
];

export default function ConfidentialitePage() {
  return (
    <>
      <PageHeader
        title="Politique de confidentialité"
        intro="Dernière mise à jour : 20 octobre 2026"
      />
      <Container className="py-14">
        <div className="rich-text">
          <h2>Responsable de traitement</h2>
          <p>
            Thé Tip Top, société anonyme dont le siège est situé 18 rue Léon Frot,
            75011 Paris.
          </p>

          <h2>Données collectées et finalités</h2>
        </div>

        <div className="mt-4 max-w-4xl rounded-[var(--radius)] border border-border bg-surface">
          <Table>
            <thead>
              <tr>
                <Th>Données</Th>
                <Th>Finalité</Th>
                <Th>Base légale</Th>
                <Th>Conservation</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell) => (
                    <Td key={cell}>{cell}</Td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="rich-text mt-10">
          <h2>Destinataires</h2>
          <p>
            Les données sont traitées par Thé Tip Top et par l&apos;agence Furious
            Ducks en qualité de sous-traitant. Elles sont accessibles aux employés en
            boutique dans la seule limite nécessaire à la remise des lots, et
            communiquées à l&apos;huissier de justice pour les besoins du contrôle du
            tirage au sort. Aucune donnée n&apos;est vendue ni cédée à des tiers à des
            fins commerciales.
          </p>

          <h2>Hébergement et transferts</h2>
          <p>
            Les données sont hébergées au sein de l&apos;Union européenne. Aucun
            transfert hors de l&apos;Union n&apos;est effectué, à l&apos;exception des
            services d&apos;authentification tiers, dont l&apos;utilisation résulte du
            choix de l&apos;utilisateur au moment de son inscription.
          </p>

          <h2>Vos droits</h2>
          <p>
            Vous disposez d&apos;un droit d&apos;accès, de rectification,
            d&apos;effacement, de limitation, d&apos;opposition et de portabilité,
            ainsi que du droit de retirer votre consentement à tout moment et de
            définir des directives relatives au sort de vos données après votre décès.
          </p>
          <p>
            Ces droits s&apos;exercent depuis votre{' '}
            <Link href="/mon-compte/confidentialite">espace personnel</Link> ou par
            courriel à l&apos;adresse indiquée dans les mentions légales. Une réponse
            est apportée dans un délai d&apos;un mois.
          </p>
        </div>

        <div className="mt-6 max-w-3xl">
          <Alert tone="warning" title="Une limite à connaître sur l'effacement">
            <p>
              La suppression de votre compte n&apos;entraîne pas celle de vos
              participations, qui doivent rester consultables pour prouver le bon
              déroulement du jeu devant l&apos;huissier. Ces participations sont
              anonymisées et non détruites : le lien avec votre identité disparaît, la
              preuve statistique subsiste.
            </p>
          </Alert>
        </div>

        <div className="rich-text mt-10">
          <h2>Cookies</h2>
          <p>
            Un bandeau permet d&apos;accepter ou de refuser les cookies catégorie par
            catégorie. Le refus est aussi simple que l&apos;acceptation, et le choix est
            modifiable à tout moment depuis la page{' '}
            <Link href="/cookies">gestion des cookies</Link>.
          </p>

          <h2>Sécurité</h2>
          <p>
            Les mots de passe sont stockés sous forme chiffrée, les échanges sont
            protégés par le protocole HTTPS, les adresses IP sont hachées, les accès
            sont nominatifs et journalisés, et les sauvegardes sont chiffrées. En cas
            de violation de données présentant un risque pour les personnes, celles-ci
            sont informées dans les conditions prévues par la réglementation.
          </p>

          <h2>Réclamation</h2>
          <p>
            En cas de désaccord, vous pouvez introduire une réclamation auprès de la
            Commission nationale de l&apos;informatique et des libertés.
          </p>
        </div>
      </Container>
    </>
  );
}
