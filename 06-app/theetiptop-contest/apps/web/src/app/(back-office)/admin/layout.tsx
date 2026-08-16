import { BackOfficeShell } from '../../../components/back-office/shell';
import { currentAdmin } from '../../../lib/mock';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = currentAdmin();
  return (
    <BackOfficeShell user={user} role="ADMIN">
      {children}
    </BackOfficeShell>
  );
}
