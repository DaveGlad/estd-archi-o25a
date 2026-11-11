import { requireRole } from '../../lib/require-role';
import { BackOfficeShell } from '../../components/back-office/shell';

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  // ADMIN is allowed here too: an administrator settling a dispute has to be able to see
  // what the employee sees. The API makes the same call on `/v1/employee/*`.
  const user = await requireRole('EMPLOYEE', 'ADMIN');

  return (
    <BackOfficeShell user={user} role={user.role}>
      {children}
    </BackOfficeShell>
  );
}
