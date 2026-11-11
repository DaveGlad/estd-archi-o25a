/**
 * Reference data for the contest, in one place.
 *
 * Shared by the seed script and by the integration tests, so a test never asserts against
 * numbers the seed did not actually insert. The prize split itself is not duplicated here:
 * it lives in `@theetiptop-contest/shared` as `TICKET_PRIZES`, which is also what the
 * conformity test counts the database against.
 */

/**
 * Contest window.
 *
 * Dates deliberately match those the front end was mocked against, so the copy already
 * written on the public pages ("entries are open until...") stays accurate: 30 days of
 * play from the Nice store opening, then 30 days to claim.
 */
export const CONTEST = {
  name: 'Le Grand Jeu Thé Tip Top',
  slug: 'grand-jeu-2026',
  startsAt: new Date('2026-11-02T00:00:00.000Z'),
  endsAt: new Date('2026-12-02T23:59:59.000Z'),
  claimDeadline: new Date('2027-01-01T23:59:59.000Z'),
  rulesFiledAt: new Date('2026-10-20T00:00:00.000Z'),
  rulesUrl: '/jeu-concours/reglement',
} as const;

/**
 * The 10 Thé Tip Top stores.
 *
 * Nice is the tenth, opened the day the contest starts: its opening is the whole reason
 * for the operation, which is why the front end highlights it.
 */
export const STORES = [
  { name: 'Paris Léon Frot', address: '18 rue Léon Frot', postalCode: '75011', city: 'Paris', phone: '01 43 00 00 11', openedAt: '2014-03-01' },
  { name: 'Paris Martyrs', address: '42 rue des Martyrs', postalCode: '75009', city: 'Paris', phone: '01 43 00 00 09', openedAt: '2016-09-15' },
  { name: 'Lyon Presqu’île', address: '7 rue de la Monnaie', postalCode: '69002', city: 'Lyon', phone: '04 72 00 00 02', openedAt: '2017-11-04' },
  { name: 'Bordeaux Chartrons', address: '21 rue Notre-Dame', postalCode: '33000', city: 'Bordeaux', phone: '05 56 00 00 33', openedAt: '2018-06-12' },
  { name: 'Nantes Graslin', address: '5 rue Franklin', postalCode: '44000', city: 'Nantes', phone: '02 40 00 00 44', openedAt: '2019-05-20' },
  { name: 'Lille Vieille Bourse', address: '12 rue Basse', postalCode: '59000', city: 'Lille', phone: '03 20 00 00 59', openedAt: '2020-10-08' },
  { name: 'Strasbourg Petite France', address: '3 rue des Dentelles', postalCode: '67000', city: 'Strasbourg', phone: '03 88 00 00 67', openedAt: '2021-09-30' },
  { name: 'Toulouse Saint-Étienne', address: '9 rue Croix-Baragnon', postalCode: '31000', city: 'Toulouse', phone: '05 61 00 00 31', openedAt: '2023-04-18' },
  { name: 'Rennes Sainte-Anne', address: '14 rue Saint-Melaine', postalCode: '35000', city: 'Rennes', phone: '02 99 00 00 35', openedAt: '2025-02-11' },
  { name: 'Nice Vieille Ville', address: '11 rue de la Préfecture', postalCode: '06300', city: 'Nice', phone: '04 93 00 00 06', openedAt: '2026-11-02' },
] as const;

/** The Nice store, looked up by name in a few places. Kept here so the string exists once. */
export const NICE_STORE_NAME = 'Nice Vieille Ville';

/**
 * Demo accounts, for the demonstration and the end-to-end tests.
 *
 * ⚠️ Inserted only when `NODE_ENV !== 'production'`. Seeding a known administrator
 * password into production would hand the back office to anyone who read this file in the
 * repository — and the repository is what the examiners will read.
 */
export const DEMO_PASSWORD = 'MotDePasse2026!';

export const DEMO_ACCOUNTS = [
  {
    email: 'admin@theetiptop.fr',
    firstName: 'Éric',
    lastName: 'Bourdon',
    role: 'ADMIN',
    gender: 'MALE',
    birthDate: null,
    postalCode: null,
    phone: null,
    storeName: null,
    marketingConsent: false,
  },
  {
    email: 'sofia.legrand@theetiptop.fr',
    firstName: 'Sofia',
    lastName: 'Legrand',
    role: 'EMPLOYEE',
    gender: 'FEMALE',
    birthDate: null,
    postalCode: null,
    phone: null,
    storeName: NICE_STORE_NAME,
    marketingConsent: false,
  },
  {
    email: 'camille.rousseau@example.fr',
    firstName: 'Camille',
    lastName: 'Rousseau',
    role: 'CUSTOMER',
    gender: 'FEMALE',
    birthDate: '1991-04-12',
    postalCode: '06000',
    phone: '06 12 34 56 78',
    storeName: null,
    marketingConsent: true,
  },
  {
    email: 'theo.marchand@example.fr',
    firstName: 'Théo',
    lastName: 'Marchand',
    role: 'CUSTOMER',
    gender: 'MALE',
    birthDate: '1984-09-30',
    postalCode: '06300',
    phone: null,
    storeName: null,
    marketingConsent: false,
  },
  {
    email: 'leila.benali@example.fr',
    firstName: 'Leïla',
    lastName: 'Benali',
    role: 'CUSTOMER',
    gender: 'FEMALE',
    birthDate: '1997-01-22',
    postalCode: '69003',
    phone: '07 88 12 45 03',
    storeName: null,
    marketingConsent: true,
  },
] as const;
