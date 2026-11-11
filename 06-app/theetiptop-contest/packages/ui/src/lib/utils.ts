import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names, with later Tailwind utilities winning over earlier ones.
 *
 * `clsx` alone concatenates, so `cn('p-2', 'p-4')` would emit both and let CSS source
 * order decide — which makes a component's `className` override unreliable. `twMerge`
 * resolves the conflict in favour of the last one, which is what a caller expects.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats an amount held in cents.
 *
 * Every monetary value in the system is an integer number of cents — see the schema
 * comments — so this is the only place a division by 100 happens. The decimals are dropped
 * on round amounts: "12 €" reads better than "12,00 €" on a prize card, and the prizes are
 * mostly round.
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

/**
 * Formats a nullable date, for the columns the API can legitimately leave empty: a store
 * with no recorded opening date, a prize never claimed.
 */
export function formatDateOrDash(iso: string | null | undefined): string {
  return iso ? formatDate(iso) : '—';
}

/**
 * Whole days left before a deadline.
 *
 * `from` defaults to now. It stays a parameter because the tests need a fixed instant:
 * an assertion against "14 days left" that reads the system clock passes today and fails
 * tomorrow.
 */
export function daysUntil(iso: string, from: string | Date = new Date()): number {
  const ms = new Date(iso).getTime() - new Date(from).getTime();
  return Math.ceil(ms / 86_400_000);
}

/** Formats a count with French thousands separators. Used on every figure of the dashboard. */
export function formatCount(value: number): string {
  return value.toLocaleString('fr-FR');
}
