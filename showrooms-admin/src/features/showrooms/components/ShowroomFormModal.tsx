import { useState } from 'react';
import { createShowroom, updateShowroom } from '../api/showrooms.api';
import { ShowroomFull } from '../model/showroom.types';

const IX = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>;

type Form = {
  name: string;
  country: string;
  city: string;
  state: string;
  street: string;
  postalCode: string;
};

type Props = {
  showroom?: ShowroomFull;
  onClose: () => void;
  onSaved: (s: ShowroomFull) => void;
};

export default function ShowroomFormModal({ showroom, onClose, onSaved }: Props) {
  const isEdit = Boolean(showroom);

  const [form, setForm] = useState<Form>({
    name:       showroom?.name        ?? '',
    country:    showroom?.address.country    ?? '',
    city:       showroom?.address.city       ?? '',
    state:      showroom?.address.state      ?? '',
    street:     showroom?.address.street     ?? '',
    postalCode: showroom?.address.postal_code ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (patch: Partial<Form>) => setForm(f => ({ ...f, ...patch }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.country.trim() || !form.city.trim() || !form.street.trim() || !form.postalCode.trim()) {
      setError('Заполните все обязательные поля (*)');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      name: form.name.trim(),
      address: {
        country:     form.country.trim(),
        city:        form.city.trim(),
        state:       form.state.trim() || null,
        street:      form.street.trim(),
        postal_code: form.postalCode.trim(),
      },
    };
    try {
      const result = isEdit
        ? await updateShowroom(showroom!.id, payload)
        : await createShowroom(payload);
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
            <h2>{isEdit ? 'Редактировать шоурум' : 'Добавить шоурум'}</h2>
            {isEdit && <p className="modal-sub">{showroom!.name}</p>}
          </div>
          <button className="modal-close" onClick={onClose}><IX /></button>
        </div>

        <div className="modal-body">

          <div className="form-section-label">Общие данные</div>
          <label className="form-field" style={{ marginBottom: 12 }}>
            <span>Название *</span>
            <input
              className="form-input"
              value={form.name}
              onChange={e => set({ name: e.target.value })}
              placeholder="AutoHub Central"
            />
          </label>

          <div className="form-section-label" style={{ marginTop: 22 }}>Адрес</div>
          <div className="form-row">
            <label className="form-field">
              <span>Страна *</span>
              <input className="form-input" value={form.country}
                onChange={e => set({ country: e.target.value })} placeholder="Россия" />
            </label>
            <label className="form-field">
              <span>Город *</span>
              <input className="form-input" value={form.city}
                onChange={e => set({ city: e.target.value })} placeholder="Москва" />
            </label>
          </div>
          <div className="form-row">
            <label className="form-field">
              <span>Улица *</span>
              <input className="form-input" value={form.street}
                onChange={e => set({ street: e.target.value })} placeholder="ул. Ленина 12" />
            </label>
            <label className="form-field">
              <span>Индекс *</span>
              <input className="form-input" value={form.postalCode}
                onChange={e => set({ postalCode: e.target.value })} placeholder="123456" />
            </label>
          </div>
          <div className="form-row">
            <label className="form-field">
              <span>Регион</span>
              <input className="form-input" value={form.state}
                onChange={e => set({ state: e.target.value })} placeholder="Московская обл. (необязательно)" />
            </label>
            <div />
          </div>

        </div>

        {error && <div className="modal-error">{error}</div>}

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Добавить шоурум'}
          </button>
        </div>

      </div>
    </div>
  );
}
