import { redirect } from 'next/navigation';
import type { Role, UserDto } from '@theetiptop-contest/shared';
import { getCurrentUser } from '@theetiptop-contest/api-client/server';

/**
 * Guards a back-office area and returns the signed-in staff member.
 *
 * Called from the two layouts rather than from each page: a layout wraps every route
 * beneath it, so a screen added later is guarded by default. The opposite convention — a
 * check per page — is how one screen ends up reachable without the right role after a
 * refactor.
 *
 * This is **not** the security boundary. The API enforces the same roles on every endpoint
 * (`@Roles(...)` plus a global `RolesGuard`), so a request crafted by hand is refused
 * regardless of what the front end did. What this gives is the right behaviour for a human
 * who lands on the wrong URL: a redirect instead of a page that renders empty and then
 * fails on its first fetch.
 */
export async function requireRole<T extends Role>(
  ...allowed: T[]
): Promise<UserDto & { role: T }> {
  const user = await getCurrentUser();

  if (!user) redirect('/connexion');

  // `(allowed as Role[])` rather than `allowed`: `Array<T>.includes` wants a `T`, and
  // `user.role` is the full `Role` union. Widening the array for the check is the correct
  // direction — the question being asked is "is this role one of the allowed ones", which
  // is well defined for any `Role`.
  if (!(allowed as Role[]).includes(user.role)) {
    // Sent to the area their own role does have access to, rather than to a dead end.
    // A customer has no business in the back office at all and goes back to the login
    // screen, where the copy explains the back office is for staff.
    if (user.role === 'EMPLOYEE') redirect('/employe');
    if (user.role === 'ADMIN') redirect('/admin');
    redirect('/connexion?error=forbidden');
  }

  // The narrowing is the point of the generic: a caller that wrote
  // `requireRole('EMPLOYEE', 'ADMIN')` gets back a user whose `role` cannot be
  // 'CUSTOMER', which is what lets it be passed straight to a component that only
  // accepts the two staff roles. The cast is safe because of the check above, and
  // TypeScript cannot narrow a field through an `includes` on a widened array.
  return user as UserDto & { role: T };
}
