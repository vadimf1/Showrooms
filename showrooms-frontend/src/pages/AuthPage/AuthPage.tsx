import { useState } from 'react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { EyeIcon } from '../../shared/ui/icons';
import { noSpaces, onlyPhone, stripPlus } from '../../shared/utils/format';
import { type FieldErrors, validateLogin, validateRegister } from '../../features/auth/utils/validation';

type Props = { onSuccess: () => void };

export default function AuthPage({ onSuccess }: Props) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [form, setForm] = useState({
    email: '', password: '', first_name: '', last_name: '', phone: '', birth_date: '',
  });

  const clearError = (k: keyof FieldErrors) =>
    setFieldErrors(p => ({ ...p, [k]: undefined }));

  const handleName = (k: 'first_name' | 'last_name') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [k]: noSpaces(e.target.value) }));
    clearError(k);
    setApiError('');
  };

  const handleEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, email: noSpaces(e.target.value) }));
    clearError('email');
    setApiError('');
  };

  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, phone: onlyPhone(e.target.value) }));
    clearError('phone');
    setApiError('');
  };

  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, password: noSpaces(e.target.value) }));
    clearError('password');
    setApiError('');
  };

  const switchMode = (m: 'login' | 'register') => {
    setMode(m);
    setFieldErrors({});
    setApiError('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const errs = mode === 'login' ? validateLogin(form) : validateRegister(form);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setSubmitting(true);
    setApiError('');
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register({
          email: form.email,
          password: form.password,
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone ? stripPlus(form.phone) : undefined,
          birth_date: form.birth_date || undefined,
        });
      }
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setApiError(msg || 'Ошибка. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  const inp = (hasError?: string) => 'auth-input' + (hasError ? ' auth-input-error' : '');

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-mark">A</div>
          <div className="logo-text">AutoHub</div>
        </div>

        <div className="auth-head">
          <h1>{mode === 'login' ? 'С возвращением' : 'Создать аккаунт'}</h1>
          <p>
            {mode === 'login'
              ? 'Войдите, чтобы продолжить подбор автомобиля'
              : 'Зарегистрируйтесь, чтобы сохранять избранное и записываться на тест-драйвы'}
          </p>
        </div>

        <div className="auth-tabs">
          <button className={'auth-tab' + (mode === 'login' ? ' active' : '')} onClick={() => switchMode('login')}>Войти</button>
          <button className={'auth-tab' + (mode === 'register' ? ' active' : '')} onClick={() => switchMode('register')}>Регистрация</button>
        </div>

        {mode === 'login' ? (
          <form className="auth-form" onSubmit={submit} noValidate>
            <div className="auth-field">
              <label className="auth-field-label">Email</label>
              <input className={inp(fieldErrors.email)} type="email" placeholder="name@example.com"
                value={form.email} onChange={handleEmail} autoComplete="email" />
              {fieldErrors.email && <span className="auth-field-error">{fieldErrors.email}</span>}
            </div>
            <div className="auth-field">
              <label className="auth-field-label">Пароль</label>
              <div className="auth-input-wrap">
                <input className={inp(fieldErrors.password)} type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={handlePassword} autoComplete="current-password" />
                <button type="button" className="input-icon-btn" onClick={() => setShowPwd(v => !v)} aria-label="Показать пароль">
                  <EyeIcon />
                </button>
              </div>
              {fieldErrors.password && <span className="auth-field-error">{fieldErrors.password}</span>}
            </div>
            {apiError && <div className="auth-error">{apiError}</div>}
            <button className="auth-btn auth-btn-primary auth-btn-lg auth-btn-block" type="submit" disabled={submitting}>
              {submitting ? 'Входим…' : 'Войти'}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={submit} noValidate>
            <div className="auth-form-grid-2">
              <div className="auth-field">
                <label className="auth-field-label">Имя <span className="auth-required">*</span></label>
                <input className={inp(fieldErrors.first_name)} placeholder="Александр"
                  value={form.first_name} onChange={handleName('first_name')} />
                {fieldErrors.first_name && <span className="auth-field-error">{fieldErrors.first_name}</span>}
              </div>
              <div className="auth-field">
                <label className="auth-field-label">Фамилия</label>
                <input className="auth-input" placeholder="Корнеев"
                  value={form.last_name} onChange={handleName('last_name')} />
              </div>
            </div>
            <div className="auth-field">
              <label className="auth-field-label">Email <span className="auth-required">*</span></label>
              <input className={inp(fieldErrors.email)} type="email" placeholder="name@example.com"
                value={form.email} onChange={handleEmail} autoComplete="email" />
              {fieldErrors.email && <span className="auth-field-error">{fieldErrors.email}</span>}
            </div>
            <div className="auth-form-grid-2">
              <div className="auth-field">
                <label className="auth-field-label">Телефон</label>
                <input className={inp(fieldErrors.phone)} placeholder="+7 (___) ___-__-__"
                  value={form.phone} onChange={handlePhone} inputMode="tel" />
                {fieldErrors.phone && <span className="auth-field-error">{fieldErrors.phone}</span>}
              </div>
              <div className="auth-field">
                <label className="auth-field-label">Дата рождения</label>
                <input className="auth-input" type="date"
                  value={form.birth_date} onChange={e => setForm(p => ({ ...p, birth_date: e.target.value }))} />
              </div>
            </div>
            <div className="auth-field">
              <label className="auth-field-label">Пароль <span className="auth-required">*</span></label>
              <div className="auth-input-wrap">
                <input className={inp(fieldErrors.password)} type={showPwd ? 'text' : 'password'} placeholder="Не менее 8 символов"
                  value={form.password} onChange={handlePassword} autoComplete="new-password" />
                <button type="button" className="input-icon-btn" onClick={() => setShowPwd(v => !v)}>
                  <EyeIcon />
                </button>
              </div>
              {fieldErrors.password && <span className="auth-field-error">{fieldErrors.password}</span>}
            </div>
            {apiError && <div className="auth-error">{apiError}</div>}
            <button className="auth-btn auth-btn-primary auth-btn-lg auth-btn-block" type="submit" disabled={submitting}>
              {submitting ? 'Создаём…' : 'Создать аккаунт'}
            </button>
          </form>
        )}

        <div className="auth-foot">
          {mode === 'login'
            ? <><span>Нет аккаунта? </span><a onClick={() => switchMode('register')} style={{ cursor: 'pointer' }}>Зарегистрироваться</a></>
            : <><span>Уже зарегистрированы? </span><a onClick={() => switchMode('login')} style={{ cursor: 'pointer' }}>Войти</a></>}
        </div>
      </div>
    </div>
  );
}
