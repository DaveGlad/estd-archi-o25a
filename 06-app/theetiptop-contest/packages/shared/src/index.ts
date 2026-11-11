/**
 * Package shared between the NestJS API and its consumers.
 *
 * It holds nothing but types and constants: no dependency on Prisma, Nest or React. That
 * is what lets it be imported indifferently by the API, by a Next.js server component and
 * by a client component, without dragging anything useless into the browser bundle.
 *
 * It is also the technical justification for the monorepo: one place where the contract
 * evolves, and a compiler that flags any break across the three consumers immediately.
 */

export * from './lib/enums';
export * from './lib/contest-rules';
export * from './lib/contracts/catalogue';
export * from './lib/contracts/user';
export * from './lib/contracts/participation';
export * from './lib/contracts/back-office';
export * from './lib/contracts/pos';
