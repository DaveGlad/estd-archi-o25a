/**
 * Standalone Prisma client for the command-line scripts.
 *
 * The scripts (seed, code generation, conformity check) run outside the NestJS container,
 * so they cannot use `PrismaService`. They still need the same driver adapter Prisma 7
 * requires, hence this small factory rather than three copies of the same boilerplate.
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { config as loadDotenv } from 'dotenv';

import { PrismaClient } from '../apps/api/src/generated/prisma/client.js';

loadDotenv({ quiet: true });

export function createScriptClient(): PrismaClient {
  const connectionString = process.env['DATABASE_URL'];

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env, then start the containers with:\n' +
        '  docker compose -f ../../05-workflow/docker/compose.dev.yml up -d'
    );
  }

  return new PrismaClient({
    // A single connection: these scripts are strictly sequential, and a pool would only
    // make the measured insert timings harder to interpret.
    adapter: new PrismaPg({ connectionString, max: 1 }),
    log: ['warn', 'error'],
  });
}

/** Formats a duration for the measurement tables of the specification document. */
export function formatDuration(milliseconds: number): string {
  // Sub-millisecond readings are the interesting ones for a single indexed lookup;
  // rounding them to "0 ms" would throw away the figure the specification needs.
  if (milliseconds < 1) return `${(milliseconds * 1_000).toFixed(0)} µs`;
  if (milliseconds < 10) return `${milliseconds.toFixed(2)} ms`;
  if (milliseconds < 1_000) return `${Math.round(milliseconds)} ms`;
  const seconds = milliseconds / 1_000;
  if (seconds < 60) return `${seconds.toFixed(2)} s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes} min ${(seconds % 60).toFixed(1)} s`;
}
