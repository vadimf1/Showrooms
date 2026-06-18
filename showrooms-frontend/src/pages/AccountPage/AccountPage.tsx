import { useState } from 'react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { userInitials } from '../../shared/utils/format';
import { IUser, IHeart, ICal, IKey, IBack, IOut } from '../../shared/ui/icons';
import ProfileTab from './tabs/ProfileTab';
import FavoritesTab from './tabs/FavoritesTab';
import TestDrivesTab from './tabs/TestDrivesTab';
import PurchasesTab from './tabs/PurchasesTab';
import type { CarInitialConfig } from '../../features/cars/model/car.types';

type TabId = 'profile' | 'favs' | 'tests' | 'buys';

const TABS: { id: TabId; label: string; icon: JSX.Element }[] = [
  { id: 'profile', label: 'Профиль',      icon: <IUser /> },
  { id: 'favs',    label: 'Избранное',    icon: <IHeart /> },
  { id: 'tests',   label: 'Тест-драйвы', icon: <ICal /> },
  { id: 'buys',    label: 'Покупки',      icon: <IKey /> },
];

const LABELS: Record<TabId, string> = {
  profile: 'Профиль', favs: 'Избранное', tests: 'Тест-драйвы', buys: 'Покупки',
};

type Props = { onBackToCatalog: () => void; onOpenCar?: (id: string, config?: CarInitialConfig) => void; initialTab?: TabId };

export default function AccountPage({ onBackToCatalog, onOpenCar, initialTab = 'profile' }: Props) {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<TabId>(initialTab);

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email || '';

  const handleLogout = async () => { await logout(); onBackToCatalog(); };

  return (
    <div className="account-app">
      <aside className="account-sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">A</div>
          <div>
            <div className="logo-text">AutoHub</div>
            <div className="logo-sub">Личный кабинет</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-group-label">Аккаунт</div>
          {TABS.map(t => (
            <button key={t.id} className={'nav-item' + (tab === t.id ? ' active' : '')} onClick={() => setTab(t.id)}>
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="back-to-catalog" onClick={onBackToCatalog}>
            <IBack /> В каталог
          </button>
        </div>
      </aside>

      <main className="account-main">
        <header className="account-topbar">
          <div className="acc-crumbs">
            <span>AutoHub</span>
            <span className="sep">/</span>
            <span>Личный кабинет</span>
            <span className="sep">/</span>
            <span className="current">{LABELS[tab]}</span>
          </div>
          <div className="topbar-spacer" />
          <div className="topbar-user">
            <div className="avatar">{userInitials(user)}</div>
            <span className="name">{fullName}</span>
          </div>
          <div className="topbar-divider" />
          <button className="signout" onClick={handleLogout}><IOut /> Выйти</button>
        </header>

        <div className="account-content">
          {tab === 'profile' && <ProfileTab />}
          {tab === 'favs'    && <FavoritesTab onOpenCar={onOpenCar} />}
          {tab === 'tests'   && <TestDrivesTab onOpenCar={onOpenCar} />}
          {tab === 'buys'    && <PurchasesTab />}
        </div>
      </main>

      <nav className="mobile-tabbar">
        {TABS.map(t => (
          <button key={t.id} className={'tabbar-item' + (tab === t.id ? ' active' : '')} onClick={() => setTab(t.id)}>
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
