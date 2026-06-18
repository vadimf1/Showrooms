import { ReactNode } from 'react';
import { AdminPage, PAGE_LABELS } from '../../app/App';
import { AuthUser } from '../../features/auth/api/auth.api';
import Sidebar from '../ui/Sidebar';
import TopBar from '../ui/TopBar';

type Props = {
  page: AdminPage;
  onNav: (p: AdminPage) => void;
  onLogout: () => void;
  user: AuthUser;
  children: ReactNode;
};

const AdminLayout = ({ page, onNav, onLogout, user, children }: Props) => (
  <>
    <aside className="admin-sidebar">
      <Sidebar page={page} onNav={onNav} user={user} />
    </aside>
    <main className="admin-main">
      <TopBar crumb={PAGE_LABELS[page]} onLogout={onLogout} user={user} />
      <div className="admin-content">{children}</div>
    </main>
  </>
);

export default AdminLayout;
