import { useState } from 'react';
import { createDealer, updateDealer } from '../api/dealers.api';
import { DealerFull } from '../model/dealer.types';

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
  dealer?: DealerFull;
  onClose: () => void;
  onSaved: (d: DealerFull) => void;
};

export default function DealerFormModal({ dealer, onClose, onSaved }: Props) {
  const isEdit = Boolean(dealer);

  const [form, setForm] = useState<Form>({
    name:       dealer?.name                   ?? '',
    country:    dealer?.address?.country       ?? '',
    city:       dealer?.address?.city          ?? '',
    state:      dealer?.address?.state         ?? '',
    street:     dealer?.address?.street        ?? '',
    postalCode: dealer?.address?.postal_code   ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (patch: Partial<Form>) => setForm(f => ({ ...f, ...patch }));

  const hasAddress = form.country.trim() || form.city.trim() || form.street.trim() || form.postalCode.trim();

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Укажите имя дилера (*)');
      return;
    }
    if (hasAddress && (!form.country.trim() || !form.city.trim() || !form.street.trim() || !form.postalCode.trim())) {
      setError('Заполните все поля адреса или оставьте все пустыми');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      name: form.name.trim(),
      address: hasAddress ? {
        country:     form.country.trim(),
        city:        form.city.trim(),
        state:       form.state.trim() || null,
        street:      form.street.trim(),
        postal_code: form.postalCode.trim(),
      } : null,
    };
    try {
      const result = isEdit
        ? await updateDealer(dealer!.id, payload)
        : await createDealer(payload);
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
            <h2>{isEdit ? 'Редактировать дилера' : 'Добавить дилера'}</h2>
            {isEdit && <p className="modal-sub">{dealer!.name}</p>}
          </div>
          <button className="modal-close" onClick={onClose}><IX /></button>
        </div>

        <div className="modal-body">

          <div className="form-section-label">Общие данные</div>
          <label className="form-field" style={{ marginBottom: 12 }}>
            <span>Имя *</span>
            <input
              className="form-input"
              value={form.name}
              onChange={e => set({ name: e.target.value })}
              placeholder="Ivan Petrov"
            />
          </label>

          <div className="form-section-label" style={{ marginTop: 22 }}>
            Адрес <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(необязательно)</span>
          </div>
          <div className="form-row">
            <label className="form-field">
              <span>Страна</span>
              <input className="form-input" value={form.country}
                onChange={e => set({ country: e.target.value })} placeholder="Россия" />
            </label>
            <label className="form-field">
              <span>Город</span>
              <input className="form-input" value={form.city}
                onChange={e => set({ city: e.target.value })} placeholder="Москва" />
            </label>
          </div>
          <div className="form-row">
            <label className="form-field">
              <span>Улица</span>
              <input className="form-input" value={form.street}
                onChange={e => set({ street: e.target.value })} placeholder="ул. Ленина 12" />
            </label>
            <label className="form-field">
              <span>Индекс</span>
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
            {saving ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Добавить дилера'}
          </button>
        </div>

      </div>
    </div>
  );
}
