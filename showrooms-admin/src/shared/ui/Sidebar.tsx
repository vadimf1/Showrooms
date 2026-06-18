import { AdminPage } from '../../app/App';
import { AuthUser } from '../../features/auth/api/auth.api';
import { usePermissions } from '../hooks/usePermissions';

type Props = { page: AdminPage; onNav: (p: AdminPage) => void; user: AuthUser; };

const NAV: { id: AdminPage; label: string; count?: number; adminOnly?: boolean; icon: React.ReactNode }[] = [
  {
    id: 'dashboard', label: 'Дашборд',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>,
  },
  {
    id: 'cars', label: 'Автомобили',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h14M5 17v2a1 1 0 001 1h1a1 1 0 001-1v-2M19 17v2a1 1 0 01-1 1h-1a1 1 0 01-1-1v-2"/><path d="M3 13l1.5-5a2 2 0 012-1.5h11a2 2 0 012 1.5L21 13v4H3v-4z"/><circle cx="7.5" cy="13.5" r="1"/><circle cx="16.5" cy="13.5" r="1"/></svg>,
  },
  {
    id: 'showrooms', label: 'Шоурумы',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01M9 16h.01M15 16h.01"/></svg>,
  },
  {
    id: 'dealers', label: 'Дилеры',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0M16 11.5a3 3 0 100-6M21.5 20a5 5 0 00-4.5-5"/></svg>,
  },
  {
    id: 'employees', label: 'Сотрудники', adminOnly: true,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="1.5"/><path d="M8 7V5a4 4 0 018 0v2"/><circle cx="12" cy="14" r="2.5"/></svg>,
  },
  {
    id: 'testdrives', label: 'Тест-драйвы',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="1.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>,
  },
];

const ROLE_LABELS: Record<string, string> = { ADMIN: 'Администратор', EMPLOYEE: 'Сотрудник' };

const Sidebar = ({ page, onNav, user }: Props) => {
  const { permissions } = usePermissions();

  const visibleNav = NAV.filter(n => !n.adminOnly || permissions.can_manage_employees);

  return (
    <>
      <div className="sidebar-logo">
        <div className="logo-mark">A</div>
        <div>
          <div className="logo-text">AutoHub</div>
          <div className="logo-sub">Showroom Admin</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-group-label">Рабочее пространство</div>
        {visibleNav.map(n => (
          <button
            key={n.id}
            className={`nav-item${page === n.id ? ' active' : ''}`}
            onClick={() => onNav(n.id)}
          >
            {n.icon}
            <span>{n.label}</span>
            {n.count != null && <span className="nav-count">{n.count}</span>}
          </button>
        ))}

        <div className="nav-group-label">Отчёты</div>
        <button
          className={`nav-item${page === 'sales' ? ' active' : ''}`}
          onClick={() => onNav('sales')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 6-7"/></svg>
          <span>Продажи</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar">
            {user.first_name && user.last_name
              ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
              : user.email.slice(0, 2).toUpperCase()}
          </div>
          <div className="who">
            <span className="name">
              {user.first_name && user.last_name
                ? `${user.first_name} ${user.last_name}`
                : user.email}
            </span>
            <span className="role">{ROLE_LABELS[user.role] ?? user.role}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
