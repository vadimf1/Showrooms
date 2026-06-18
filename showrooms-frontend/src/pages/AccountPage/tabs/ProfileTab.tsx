import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { authPatchMe, authMe } from '../../../features/auth/api/auth.api';
import { unlinkTelegram, linkTelegram } from '../../../features/account/api/account.api';
import { IEdit, ICheck, IClose, ILink, ITg } from '../../../shared/ui/icons';
import { userInitials, displayPhone, stripPlus, formatBirthDate } from '../../../shared/utils/format';

export default function ProfileTab() {
  const { user, setUser } = useAuth();
  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [tgLinking, setTgLinking] = useState(false);
  const [unlinkModal, setUnlinkModal] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [form, setForm] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    birth_date: user?.birth_date ?? '',
    city: user?.city ?? '',
  });

  const startEdit = () => {
    setForm({
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      birth_date: user?.birth_date ?? '',
      city: user?.city ?? '',
    });
    setSaveError('');
    setEdit(true);
  };

  const save = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const updated = await authPatchMe({ ...form, phone: stripPlus(form.phone) });
      setUser(updated);
      setEdit(false);
    } catch {
      setSaveError('Не удалось сохранить. Попробуйте ещё раз.');
    } finally {
      setSaving(false);
    }
  };

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  useEffect(() => () => stopPolling(), []);

  const handleLinkTelegram = async () => {
    setTgLinking(true);
    try {
      const { url } = await linkTelegram();
      window.open(url, '_blank', 'noopener,noreferrer');
      pollRef.current = setInterval(async () => {
        try {
          const updated = await authMe();
          if (updated.telegram_linked) { setUser(updated); stopPolling(); }
        } catch {}
      }, 3000);
    } catch {} finally {
      setTgLinking(false);
    }
  };

  const handleUnlinkConfirm = async () => {
    setUnlinking(true);
    try {
      await unlinkTelegram();
      if (user) setUser({ ...user, telegram_linked: false, telegram_username: null });
      setUnlinkModal(false);
    } catch {} finally {
      setUnlinking(false);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Профиль</h1>
          <p>Личные данные, контакты и привязанные сервисы.</p>
        </div>
        <div className="page-actions">
          {edit ? (
            <>
              <button className="acc-btn acc-btn-ghost acc-btn-sm" onClick={() => setEdit(false)}><IClose /> Отменить</button>
              <button className="acc-btn acc-btn-primary acc-btn-sm" onClick={save} disabled={saving}><ICheck /> {saving ? 'Сохранение…' : 'Сохранить'}</button>
            </>
          ) : (
            <button className="acc-btn acc-btn-outline acc-btn-sm" onClick={startEdit}><IEdit /> Редактировать</button>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="profile-id">
          <div className="profile-avatar">{userInitials(user)}</div>
          <div className="profile-id-info">
            <div className="nm">{user?.first_name} {user?.last_name}</div>
            <div className="em">{user?.email}</div>
          </div>
        </div>
        <div className="panel-body" style={{ borderTop: '1px solid var(--line)' }}>
          {saveError && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{saveError}</div>}
          <div className="profile-form">
            <div className="acc-field">
              <label className="acc-field-label">Имя</label>
              {edit ? <input className="acc-input" value={form.first_name} onChange={set('first_name')} />
                    : <div className="acc-input acc-input-disabled">{user?.first_name || '—'}</div>}
            </div>
            <div className="acc-field">
              <label className="acc-field-label">Фамилия</label>
              {edit ? <input className="acc-input" value={form.last_name} onChange={set('last_name')} />
                    : <div className="acc-input acc-input-disabled">{user?.last_name || '—'}</div>}
            </div>
            <div className="acc-field">
              <label className="acc-field-label">Email</label>
              {edit ? <input className="acc-input" type="email" value={form.email} onChange={set('email')} />
                    : <div className="acc-input acc-input-disabled">{user?.email}</div>}
            </div>
            <div className="acc-field">
              <label className="acc-field-label">Телефон</label>
              {edit ? <input className="acc-input" type="tel" value={form.phone} onChange={set('phone')} placeholder="+7 (___) ___-__-__" />
                    : <div className="acc-input acc-input-disabled mono">{displayPhone(user?.phone ?? '')}</div>}
            </div>
            <div className="acc-field">
              <label className="acc-field-label">Дата рождения</label>
              {edit ? <input className="acc-input" type="date" value={form.birth_date ?? ''} onChange={set('birth_date')} />
                    : <div className="acc-input acc-input-disabled">{formatBirthDate(user?.birth_date ?? null) || '—'}</div>}
            </div>
            <div className="acc-field">
              <label className="acc-field-label">Город</label>
              {edit ? <input className="acc-input" value={form.city} onChange={set('city')} />
                    : <div className="acc-input acc-input-disabled">{user?.city || '—'}</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="tg-block">
          <div className="tg-icon"><ITg /></div>
          <div className="tg-info">
            <div className="t">Telegram</div>
            {user?.telegram_linked ? (
              <>
                <div className="d">Уведомления о тест-драйвах и статусах заказов будут приходить в Telegram.</div>
                {user.telegram_username && <div className="tg-linked"><span className="dot" /> {user.telegram_username}</div>}
              </>
            ) : (
              <div className="d">Привяжите аккаунт, чтобы получать уведомления о статусах заявок и тест-драйвах.</div>
            )}
          </div>
          {user?.telegram_linked
            ? <button className="acc-btn acc-btn-danger acc-btn-sm" onClick={() => setUnlinkModal(true)}><IClose /> Отвязать</button>
            : <button className="acc-btn acc-btn-primary acc-btn-sm" onClick={handleLinkTelegram} disabled={tgLinking}><ILink /> {tgLinking ? 'Загрузка…' : 'Привязать Telegram'}</button>}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Безопасность</h2>
            <p>Управление паролем и сеансами входа.</p>
          </div>
          <button className="acc-btn acc-btn-outline acc-btn-sm">Сменить пароль</button>
        </div>
      </div>

      {unlinkModal && (
        <div className="tg-modal-overlay" onClick={() => setUnlinkModal(false)}>
          <div className="tg-modal" onClick={e => e.stopPropagation()}>
            <div className="tg-modal-head">
              <div className="tg-modal-title"><ITg /> Отвязать Telegram</div>
              <button className="tg-modal-close" onClick={() => setUnlinkModal(false)}><IClose /></button>
            </div>
            <div className="tg-modal-body">
              <p>Вы больше не будете получать уведомления о тест-драйвах и статусах заказов в Telegram.</p>
              <div className="tg-modal-actions">
                <button className="acc-btn acc-btn-danger acc-btn-sm" onClick={handleUnlinkConfirm} disabled={unlinking}>
                  {unlinking ? 'Отвязываем…' : 'Отвязать'}
                </button>
                <button className="acc-btn acc-btn-ghost acc-btn-sm" onClick={() => setUnlinkModal(false)}>Отмена</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
