import { BackOfficeShell } from '../../../components/back-office/shell';
import { currentEmployee } from '../../../lib/mock';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const user = currentEmployee();
  return (
    <BackOfficeShell user={user} role="EMPLOYEE">
      {children}
    </BackOfficeShell>
  );
}
