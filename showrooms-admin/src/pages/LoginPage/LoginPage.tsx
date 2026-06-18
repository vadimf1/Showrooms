import { useState } from 'react';
import { login, AuthUser } from '../../features/auth/api/auth.api';

type Props = { onLogin: (access: string, refresh: string, user: AuthUser) => void };

export default function LoginPage({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setLoading(true);
    setError('');
    try {
      const data = await login(username.trim(), password);
      if (data.user.role === 'CLIENT') {
        setError('У вас нет доступа к панели администратора.');
        return;
      }
      onLogin(data.access, data.refresh, data.user);
    } catch {
      setError('Неверный логин или пароль.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-mark">A</div>
          <div>
            <div className="logo-text">AutoHub</div>
            <div className="logo-sub">Showroom Admin</div>
          </div>
        </div>

        <h2 className="login-title">Вход</h2>
        <p className="login-sub">Войдите как сотрудник или администратор.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Имя пользователя</span>
            <input
              className="form-input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="ivan.petrov@autohub.com"
              autoComplete="username"
              autoFocus
            />
          </label>
          <label className="form-field" style={{ marginTop: 12 }}>
            <span>Пароль</span>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading || !username.trim() || !password}
            style={{ width: '100%', marginTop: 20, height: 42 }}
          >
            {loading ? 'Вход…' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}
