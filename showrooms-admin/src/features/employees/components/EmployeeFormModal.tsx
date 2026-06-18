import { useEffect, useState } from 'react';
import { createEmployee, updateEmployee } from '../api/employees.api';
import { EmployeeFull } from '../model/employee.types';
import { getShowrooms } from '../../showrooms/api/showrooms.api';
import { ShowroomFull } from '../../showrooms/model/showroom.types';

const IX = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>;

type Form = {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  position: string;
  salary: string;
  showroomId: string;
};

type Props = {
  employee?: EmployeeFull;
  onClose: () => void;
  onSaved: (e: EmployeeFull) => void;
};

export default function EmployeeFormModal({ employee, onClose, onSaved }: Props) {
  const isEdit = Boolean(employee);

  const [form, setForm] = useState<Form>({
    firstName:  employee?.first_name   ?? '',
    lastName:   employee?.last_name    ?? '',
    username:   employee?.username     ?? '',
    password:   '',
    position:   employee?.position     ?? '',
    salary:     employee?.salary       ?? '',
    showroomId: employee?.showroom_id  ?? '',
  });
  const [showrooms, setShowrooms] = useState<ShowroomFull[]>([]);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  const set = (patch: Partial<Form>) => setForm(f => ({ ...f, ...patch }));

  useEffect(() => {
    getShowrooms({ page: 1 }).then(r => setShowrooms(r.results));
  }, []);

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.username.trim() || !form.position.trim() || !form.salary) {
      setError('Заполните все обязательные поля (*)');
      return;
    }
    if (!isEdit && !form.password.trim()) {
      setError('Укажите пароль для нового сотрудника');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      first_name: form.firstName.trim(),
      last_name:  form.lastName.trim(),
      username:   form.username.trim(),
      position:   form.position.trim(),
      salary:     parseFloat(form.salary),
      showroom_id: form.showroomId || null,
      ...(form.password.trim() ? { password: form.password.trim() } : {}),
    };
    try {
      const result = isEdit
        ? await updateEmployee(employee!.id, payload)
        : await createEmployee(payload);
      onSaved(result);
    } catch (e: unknown) {
      const data = (e as { response?: { data?: unknown } })?.response?.data;
      if (data && typeof data === 'object') {
        const msgs = Object.entries(data as Record<string, string[]>)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' · ');
        setError(msgs);
      } else {
        setError('Ошибка при сохранении');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">

        <div className="modal-header">
          <div>
            <h2>{isEdit ? 'Редактировать сотрудника' : 'Добавить сотрудника'}</h2>
            {isEdit && <p className="modal-sub">{employee!.first_name} {employee!.last_name}</p>}
          </div>
          <button className="modal-close" onClick={onClose}><IX /></button>
        </div>

        <div className="modal-body">

          <div className="form-section-label">Личные данные</div>
          <div className="form-row">
            <label className="form-field">
              <span>Имя *</span>
              <input className="form-input" value={form.firstName}
                onChange={e => set({ firstName: e.target.value })} placeholder="Иван" />
            </label>
            <label className="form-field">
              <span>Фамилия *</span>
              <input className="form-input" value={form.lastName}
                onChange={e => set({ lastName: e.target.value })} placeholder="Петров" />
            </label>
          </div>

          <div className="form-section-label" style={{ marginTop: 22 }}>Аккаунт</div>
          <div className="form-row">
            <label className="form-field">
              <span>Логин *</span>
              <input className="form-input" value={form.username}
                onChange={e => set({ username: e.target.value })} placeholder="ivan.petrov@autohub.com" />
            </label>
            <label className="form-field">
              <span>Пароль {isEdit ? '' : '*'}</span>
              <input className="form-input" type="password" value={form.password}
                onChange={e => set({ password: e.target.value })}
                placeholder={isEdit ? 'Оставьте пустым для сохранения' : 'Установить пароль'} />
            </label>
          </div>

          <div className="form-section-label" style={{ marginTop: 22 }}>Работа</div>
          <div className="form-row">
            <label className="form-field">
              <span>Должность *</span>
              <input className="form-input" value={form.position}
                onChange={e => set({ position: e.target.value })} placeholder="Менеджер продаж" />
            </label>
            <label className="form-field">
              <span>Зарплата ($) *</span>
              <input className="form-input" type="number" min="0" value={form.salary}
                onChange={e => set({ salary: e.target.value })} placeholder="80000" />
            </label>
          </div>
          <label className="form-field" style={{ marginBottom: 12 }}>
            <span>Шоурум</span>
            <select className="form-select" value={form.showroomId}
              onChange={e => set({ showroomId: e.target.value })}>
              <option value="">— Не назначен —</option>
              {showrooms.map(s => <option key={s.id} value={s.id}>{s.name} · {s.address.city}</option>)}
            </select>
          </label>

        </div>

        {error && <div className="modal-error">{error}</div>}

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Сохранение…' : isEdit ? 'Сохранить изменения' : 'Добавить сотрудника'}
          </button>
        </div>

      </div>
    </div>
  );
}
