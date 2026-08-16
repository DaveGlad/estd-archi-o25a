import {
  MOCK_TODAY,
  contest,
  participations,
  prizes,
  stats,
  stores,
  ticketCodes,
  users,
} from './data';
import type { Participation, Prize, SubmitCodeResult, User } from './types';

export * from './types';
export { MOCK_TODAY, contest, prizes, stats, stores, users, participations };

const CODE_PATTERN = /^[A-Z0-9]{10}$/;

export function getPrize(id: string): Prize {
  const prize = prizes.find((p) => p.id === id);
  if (!prize) throw new Error(`Unknown prize: ${id}`);
  return prize;
}

export function getTicketPrizes(): Prize[] {
  return prizes
    .filter((p) => p.type === 'TICKET_PRIZE')
    .sort((a, b) => a.rank - b.rank);
}

export function getGrandPrize(): Prize {
  return getPrize('prz_grand');
}

export function getStore(id: string | null | undefined) {
  return id ? stores.find((s) => s.id === id) : undefined;
}

export function getUser(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

/** The signed-in customer used across the mocked screens. */
export function currentUser(): User {
  return users[0];
}

export function currentEmployee(): User {
  const employee = users.find((u) => u.role === 'EMPLOYEE');
  if (!employee) throw new Error('No employee in the mock data set');
  return employee;
}

export function currentAdmin(): User {
  const admin = users.find((u) => u.role === 'ADMIN');
  if (!admin) throw new Error('No admin in the mock data set');
  return admin;
}

export function participationsOf(userId: string): Participation[] {
  return participations
    .filter((p) => p.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getParticipation(id: string): Participation | undefined {
  return participations.find((p) => p.id === id);
}

export function contestIsOpen(): boolean {
  return MOCK_TODAY >= contest.startsAt && MOCK_TODAY <= contest.endsAt;
}

/** Customers matching a free-text search, used by the in-store employee screen. */
export function searchCustomers(query: string): User[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return users.filter(
    (u) =>
      u.role === 'CUSTOMER' &&
      (u.email.toLowerCase().includes(q) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        participationsOf(u.id).some((p) => p.ticketCode.toLowerCase() === q))
  );
}

/**
 * Mocked version of POST /v1/participations.
 * Follows the exact branch order of use case UC-01 so the screens exercise
 * every error path the real API will return.
 */
export function submitCode(raw: string): SubmitCodeResult {
  const code = raw.trim().toUpperCase();

  if (!CODE_PATTERN.test(code)) return { outcome: 'INVALID_FORMAT' };
  if (code === 'ZZZZZZZZZZ') return { outcome: 'RATE_LIMITED', retryInMinutes: 15 };
  if (!contestIsOpen()) return { outcome: 'CONTEST_CLOSED', endsAt: contest.endsAt };

  const ticket = ticketCodes.find((t) => t.code === code);
  if (!ticket) return { outcome: 'UNKNOWN_CODE' };

  if (ticket.status !== 'AVAILABLE') {
    const existing = participations.find((p) => p.ticketCode === code);
    return {
      outcome: 'ALREADY_USED',
      usedAt: ticket.usedAt ?? MOCK_TODAY,
      byCurrentUser: existing?.userId === currentUser().id,
    };
  }

  const prize = getPrize(ticket.prizeId);
  const participation: Participation = {
    id: `prt_${code.toLowerCase()}`,
    userId: currentUser().id,
    ticketCode: code,
    prizeId: prize.id,
    prizeStatus: 'TO_CLAIM',
    claimDeadline: contest.claimDeadline,
    createdAt: MOCK_TODAY,
  };

  return { outcome: 'WON', participation, prize };
}
