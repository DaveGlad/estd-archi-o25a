import { requireRole } from '../../lib/require-role';
import { BackOfficeShell } from '../../components/back-office/shell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // An EMPLOYEE landing here is redirected to /employe by the guard; a customer, to the
  // login screen. ADMIN is listed alone on purpose — `RolesGuard` on the API has no role
  // hierarchy either, so the two sides agree.
  const user = await requireRole('ADMIN');

  return (
    <BackOfficeShell user={user} role="ADMIN">
      {children}
    </BackOfficeShell>
  );
}
