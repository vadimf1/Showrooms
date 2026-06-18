import { useState } from 'react';
import AdminLayout from '../shared/layouts/AdminLayout';
import LoginPage from '../pages/LoginPage/LoginPage';
import DashboardPage from '../pages/DashboardPage/DashboardPage';
import CarsPage from '../pages/CarsPage/CarsPage';
import ShowroomsPage from '../pages/ShowroomsPage/ShowroomsPage';
import DealersPage from '../pages/DealersPage/DealersPage';
import EmployeesPage from '../pages/EmployeesPage/EmployeesPage';
import TestDrivesPage from '../pages/TestDrivesPage/TestDrivesPage';
import SalesPage from '../pages/SalesPage/SalesPage';
import { AuthUser } from '../features/auth/api/auth.api';
import { invalidatePermissions } from '../shared/hooks/usePermissions';

export type AdminPage = 'dashboard' | 'cars' | 'showrooms' | 'dealers' | 'employees' | 'testdrives' | 'sales';

export const PAGE_LABELS: Record<AdminPage, string> = {
  dashboard:  'Дашборд',
  cars:       'Автомобили',
  showrooms:  'Шоурумы',
  dealers:    'Дилеры',
  employees:  'Сотрудники',
  testdrives: 'Тест-драйвы',
  sales:      'Продажи',
};

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function App() {
  const [token, setToken]   = useState<string | null>(() => localStorage.getItem('access_token'));
  const [user, setUser]     = useState<AuthUser | null>(readStoredUser);
  const [page, setPage]     = useState<AdminPage>('dashboard');

  const handleLogin = (access: string, refresh: string, newUser: AuthUser) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    setToken(access);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
    invalidatePermissions();
    setToken(null);
    setUser(null);
  };

  if (!token || !user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const content: Record<AdminPage, React.ReactNode> = {
    dashboard:  <DashboardPage onNav={setPage} />,
    cars:       <CarsPage />,
    showrooms:  <ShowroomsPage />,
    dealers:    <DealersPage />,
    employees:  <EmployeesPage />,
    testdrives: <TestDrivesPage />,
    sales:      <SalesPage />,
  };

  return (
    <div className="admin-app">
      <AdminLayout page={page} onNav={setPage} onLogout={handleLogout} user={user}>
        {content[page]}
      </AdminLayout>
    </div>
  );
}

export default App;
