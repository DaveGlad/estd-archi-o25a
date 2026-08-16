import type {
  Contest,
  Participation,
  Prize,
  Store,
  TicketCode,
  User,
} from './types';

/**
 * Fixed "now" for the mocked front end. Every relative date on screen is
 * computed from this constant so the screenshots stay reproducible.
 * The contest is mid-run: 16 days elapsed, 14 to go.
 */
export const MOCK_TODAY = '2026-11-18T10:30:00.000Z';

export const contest: Contest = {
  id: 'ctst_nice_2026',
  name: 'Le Grand Jeu Thé Tip Top',
  slug: 'grand-jeu-2026',
  startsAt: '2026-11-02T00:00:00.000Z',
  endsAt: '2026-12-02T23:59:59.000Z',
  claimDeadline: '2027-01-01T23:59:59.000Z',
  minimumPurchaseCents: 4900,
  plannedCodeCount: 500_000,
  codeLength: 10,
  bailiffName: 'Maître Arnaud Rick',
  rulesFiledAt: '2026-10-20T00:00:00.000Z',
};

export const prizes: Prize[] = [
  {
    id: 'prz_infuser',
    label: 'Un infuseur à thé',
    description:
      'Infuseur en acier inoxydable gravé, livré dans sa pochette en coton bio.',
    type: 'TICKET_PRIZE',
    valueCents: 1200,
    targetPercentage: 60,
    targetQuantity: 300_000,
    rank: 1,
  },
  {
    id: 'prz_detox',
    label: 'Une boîte de 100 g de thé détox ou d’infusion',
    description:
      'Au choix parmi nos détox et nos infusions, toutes préparées à la main.',
    type: 'TICKET_PRIZE',
    valueCents: 1800,
    targetPercentage: 20,
    targetQuantity: 100_000,
    rank: 2,
  },
  {
    id: 'prz_signature',
    label: 'Une boîte de 100 g de thé signature',
    description:
      'Un de nos mélanges maison, créés et assemblés dans notre atelier.',
    type: 'TICKET_PRIZE',
    valueCents: 2400,
    targetPercentage: 10,
    targetQuantity: 50_000,
    rank: 3,
  },
  {
    id: 'prz_box39',
    label: 'Un coffret découverte à 39 €',
    description: 'Cinq thés à découvrir, présentés dans un coffret en bois.',
    type: 'TICKET_PRIZE',
    valueCents: 3900,
    targetPercentage: 6,
    targetQuantity: 30_000,
    rank: 4,
  },
  {
    id: 'prz_box69',
    label: 'Un coffret découverte à 69 €',
    description:
      'Notre plus grand coffret : neuf thés, un infuseur et un carnet de dégustation.',
    type: 'TICKET_PRIZE',
    valueCents: 6900,
    targetPercentage: 4,
    targetQuantity: 20_000,
    rank: 5,
  },
  {
    id: 'prz_grand',
    label: 'Une année de thé',
    description:
      'Le gros lot, tiré au sort parmi tous les participants à la clôture du jeu, sous le contrôle de notre huissier.',
    type: 'GRAND_PRIZE',
    valueCents: 36_000,
    targetPercentage: null,
    targetQuantity: 1,
    rank: 0,
  },
];

export const stores: Store[] = [
  { id: 'str_paris11', name: 'Paris Léon Frot', address: '18 rue Léon Frot', postalCode: '75011', city: 'Paris', phone: '01 43 00 00 11', openedAt: '2014-03-01' },
  { id: 'str_paris9', name: 'Paris Martyrs', address: '42 rue des Martyrs', postalCode: '75009', city: 'Paris', phone: '01 43 00 00 09', openedAt: '2016-09-15' },
  { id: 'str_lyon', name: 'Lyon Presqu’île', address: '7 rue de la Monnaie', postalCode: '69002', city: 'Lyon', phone: '04 72 00 00 02', openedAt: '2017-11-04' },
  { id: 'str_bordeaux', name: 'Bordeaux Chartrons', address: '21 rue Notre-Dame', postalCode: '33000', city: 'Bordeaux', phone: '05 56 00 00 33', openedAt: '2018-06-12' },
  { id: 'str_nantes', name: 'Nantes Graslin', address: '5 rue Franklin', postalCode: '44000', city: 'Nantes', phone: '02 40 00 00 44', openedAt: '2019-05-20' },
  { id: 'str_lille', name: 'Lille Vieille Bourse', address: '12 rue Basse', postalCode: '59000', city: 'Lille', phone: '03 20 00 00 59', openedAt: '2020-10-08' },
  { id: 'str_strasbourg', name: 'Strasbourg Petite France', address: '3 rue des Dentelles', postalCode: '67000', city: 'Strasbourg', phone: '03 88 00 00 67', openedAt: '2021-09-30' },
  { id: 'str_toulouse', name: 'Toulouse Saint-Étienne', address: '9 rue Croix-Baragnon', postalCode: '31000', city: 'Toulouse', phone: '05 61 00 00 31', openedAt: '2023-04-18' },
  { id: 'str_rennes', name: 'Rennes Sainte-Anne', address: '14 rue Saint-Melaine', postalCode: '35000', city: 'Rennes', phone: '02 99 00 00 35', openedAt: '2025-02-11' },
  { id: 'str_nice', name: 'Nice Vieille Ville', address: '11 rue de la Préfecture', postalCode: '06300', city: 'Nice', phone: '04 93 00 00 06', openedAt: '2026-11-02', isNew: true },
];

export const users: User[] = [
  {
    id: 'usr_camille',
    email: 'camille.rousseau@example.fr',
    firstName: 'Camille',
    lastName: 'Rousseau',
    role: 'CUSTOMER',
    gender: 'FEMALE',
    birthDate: '1991-04-12',
    postalCode: '06000',
    phone: '06 12 34 56 78',
    marketingConsent: true,
    marketingConsentAt: '2026-11-05T14:02:00.000Z',
    contestRulesAcceptedAt: '2026-11-05T14:02:00.000Z',
    createdAt: '2026-11-05T14:02:00.000Z',
    provider: 'credential',
  },
  {
    id: 'usr_theo',
    email: 'theo.marchand@example.fr',
    firstName: 'Théo',
    lastName: 'Marchand',
    role: 'CUSTOMER',
    gender: 'MALE',
    birthDate: '1984-09-30',
    postalCode: '06300',
    phone: null,
    marketingConsent: false,
    marketingConsentAt: null,
    contestRulesAcceptedAt: '2026-11-09T09:41:00.000Z',
    createdAt: '2026-11-09T09:41:00.000Z',
    provider: 'google',
  },
  {
    id: 'usr_leila',
    email: 'leila.benali@example.fr',
    firstName: 'Leïla',
    lastName: 'Benali',
    role: 'CUSTOMER',
    gender: 'FEMALE',
    birthDate: '1997-01-22',
    postalCode: '69003',
    phone: '07 88 12 45 03',
    marketingConsent: true,
    marketingConsentAt: '2026-11-12T18:20:00.000Z',
    contestRulesAcceptedAt: '2026-11-12T18:20:00.000Z',
    createdAt: '2026-11-12T18:20:00.000Z',
    provider: 'facebook',
  },
  {
    id: 'usr_employee',
    email: 'sofia.legrand@theetiptop.fr',
    firstName: 'Sofia',
    lastName: 'Legrand',
    role: 'EMPLOYEE',
    gender: 'FEMALE',
    birthDate: null,
    postalCode: null,
    phone: null,
    marketingConsent: false,
    marketingConsentAt: null,
    contestRulesAcceptedAt: null,
    createdAt: '2026-10-01T08:00:00.000Z',
    storeId: 'str_nice',
    provider: 'credential',
  },
  {
    id: 'usr_admin',
    email: 'admin@theetiptop.fr',
    firstName: 'Éric',
    lastName: 'Bourdon',
    role: 'ADMIN',
    gender: 'MALE',
    birthDate: null,
    postalCode: null,
    phone: null,
    marketingConsent: false,
    marketingConsentAt: null,
    contestRulesAcceptedAt: null,
    createdAt: '2026-09-15T08:00:00.000Z',
    provider: 'credential',
  },
];

/**
 * A handful of codes, enough to exercise every branch of UC-01.
 * The real table holds 500 000 rows, generated before the contest opens.
 */
export const ticketCodes: TicketCode[] = [
  { code: 'A7K2M9QX41', prizeId: 'prz_signature', status: 'AVAILABLE', usedAt: null },
  { code: 'B3P8T5RW02', prizeId: 'prz_infuser', status: 'AVAILABLE', usedAt: null },
  { code: 'C9Z1L4NV76', prizeId: 'prz_box69', status: 'AVAILABLE', usedAt: null },
  { code: 'D2H6Y8SB35', prizeId: 'prz_detox', status: 'AVAILABLE', usedAt: null },
  { code: 'E5J3F7GD18', prizeId: 'prz_box39', status: 'USED', usedAt: '2026-11-14T16:12:00.000Z' },
  { code: 'F8N4X2KC63', prizeId: 'prz_infuser', status: 'USED', usedAt: '2026-11-06T11:05:00.000Z' },
  { code: 'G1R7W9MZ54', prizeId: 'prz_detox', status: 'USED', usedAt: '2026-11-10T19:47:00.000Z' },
];

export const participations: Participation[] = [
  {
    id: 'prt_001',
    userId: 'usr_camille',
    ticketCode: 'F8N4X2KC63',
    prizeId: 'prz_infuser',
    prizeStatus: 'REDEEMED',
    claimDeadline: '2027-01-01T23:59:59.000Z',
    createdAt: '2026-11-06T11:05:00.000Z',
    redemption: {
      id: 'rdm_001',
      issuedByName: 'Sofia Legrand',
      storeId: 'str_nice',
      channel: 'IN_STORE',
      issuedAt: '2026-11-08T15:22:00.000Z',
    },
  },
  {
    id: 'prt_002',
    userId: 'usr_camille',
    ticketCode: 'G1R7W9MZ54',
    prizeId: 'prz_detox',
    prizeStatus: 'TO_CLAIM',
    claimDeadline: '2027-01-01T23:59:59.000Z',
    createdAt: '2026-11-10T19:47:00.000Z',
  },
  {
    id: 'prt_003',
    userId: 'usr_theo',
    ticketCode: 'E5J3F7GD18',
    prizeId: 'prz_box39',
    prizeStatus: 'TO_CLAIM',
    claimDeadline: '2027-01-01T23:59:59.000Z',
    createdAt: '2026-11-14T16:12:00.000Z',
  },
];

/** Aggregates shown in the admin dashboard. */
export const stats = {
  codesIssued: 500_000,
  codesUsed: 128_470,
  participants: 41_233,
  prizesRedeemed: 79_812,
  prizesExpired: 0,
  marketingOptIn: 27_905,
  byPrize: [
    { prizeId: 'prz_infuser', won: 77_082, redeemed: 51_004 },
    { prizeId: 'prz_detox', won: 25_694, redeemed: 16_338 },
    { prizeId: 'prz_signature', won: 12_847, redeemed: 7_921 },
    { prizeId: 'prz_box39', won: 7_708, redeemed: 3_012 },
    { prizeId: 'prz_box69', won: 5_139, redeemed: 1_537 },
  ],
  byGender: [
    { gender: 'FEMALE' as const, count: 24_308 },
    { gender: 'MALE' as const, count: 15_112 },
    { gender: 'OTHER' as const, count: 611 },
    { gender: 'UNDISCLOSED' as const, count: 1_202 },
  ],
  byAgeRange: [
    { range: '18-24', count: 4_970 },
    { range: '25-34', count: 12_284 },
    { range: '35-44', count: 11_003 },
    { range: '45-54', count: 7_411 },
    { range: '55-64', count: 3_889 },
    { range: '65+', count: 1_676 },
  ],
  byStore: [
    { storeId: 'str_nice', codesUsed: 23_119 },
    { storeId: 'str_paris11', codesUsed: 19_884 },
    { storeId: 'str_paris9', codesUsed: 16_402 },
    { storeId: 'str_lyon', codesUsed: 14_770 },
    { storeId: 'str_bordeaux', codesUsed: 11_235 },
    { storeId: 'str_nantes', codesUsed: 10_118 },
    { storeId: 'str_lille', codesUsed: 9_640 },
    { storeId: 'str_strasbourg', codesUsed: 8_502 },
    { storeId: 'str_toulouse', codesUsed: 8_014 },
    { storeId: 'str_rennes', codesUsed: 6_786 },
  ],
  dailyParticipations: [
    { day: '02/11', count: 1_920 }, { day: '03/11', count: 3_410 },
    { day: '04/11', count: 4_105 }, { day: '05/11', count: 5_982 },
    { day: '06/11', count: 7_331 }, { day: '07/11', count: 9_204 },
    { day: '08/11', count: 8_876 }, { day: '09/11', count: 6_402 },
    { day: '10/11', count: 7_115 }, { day: '11/11', count: 9_890 },
    { day: '12/11', count: 8_233 }, { day: '13/11', count: 9_771 },
    { day: '14/11', count: 12_408 }, { day: '15/11', count: 11_902 },
    { day: '16/11', count: 7_640 }, { day: '17/11', count: 8_120 },
    { day: '18/11', count: 5_161 },
  ],
};
