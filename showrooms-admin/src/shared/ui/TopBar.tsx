import { useEffect, useRef, useState } from 'react';
import { logout } from '../../features/auth/api/auth.api';
import { AuthUser } from '../../features/auth/api/auth.api';

const ILogOut = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>;

const ROLE_LABELS: Record<string, string> = { ADMIN: 'Администратор', EMPLOYEE: 'Сотрудник' };

function avatarInitials(user: AuthUser): string {
  if (user.first_name && user.last_name) {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  }
  return user.email.slice(0, 2).toUpperCase();
}

function displayName(user: AuthUser): string {
  if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
  return user.email;
}

type Props = { crumb: string; onLogout: () => void; user: AuthUser };

const TopBar = ({ crumb, onLogout, user }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  const initials = avatarInitials(user);
  const name = displayName(user);

  return (
    <header className="admin-topbar">
      <div className="breadcrumb">
        <span className="crumb">AutoHub</span>
        <span className="sep">/</span>
        <span className="crumb current">{crumb}</span>
      </div>
      <div className="topbar-spacer" />
      <div className="topbar-actions">
        <div className="topbar-divider" />
        <div className="admin-avatar" ref={menuRef} style={{ position: 'relative' }}>
          <button
            className="av-btn"
            onClick={() => setMenuOpen(o => !o)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px' }}
          >
            <div className="av">{initials}</div>
            <span className="av-name">{name.split(' ')[0]}</span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transition: 'transform 0.15s', transform: menuOpen ? 'rotate(180deg)' : 'none' }}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>

          {menuOpen && (
            <div className="topbar-dropdown">
              <div className="topbar-dropdown-header">
                <div className="av" style={{ width: 32, height: 32, fontSize: 12 }}>{initials}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{ROLE_LABELS[user.role] ?? user.role}</div>
                </div>
              </div>
              <div className="topbar-dropdown-divider" />
              <div className="topbar-dropdown-divider" />
              <button className="topbar-dropdown-item danger" onClick={handleLogout}>
                <ILogOut /> Выйти
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
