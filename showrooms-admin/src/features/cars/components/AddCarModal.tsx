import { useEffect, useState } from 'react';
import { createCar, getAllCarModels, getCarTrimsForModel } from '../api/cars.api';
import { CarModel, CarTrim } from '../model/car.types';
import { getShowrooms } from '../../showrooms/api/showrooms.api';
import { getDealers } from '../../dealers/api/dealers.api';
import { ShowroomFull } from '../../showrooms/model/showroom.types';
import { DealerFull } from '../../dealers/model/dealer.types';
import Combobox, { ComboboxOption } from '../../../shared/ui/Combobox';

const IX       = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>;
const IArrow   = () => <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>;

const PRESET_COLORS = [
  { name: 'Pearl White',    hex: '#f0efe8' },
  { name: 'Obsidian Black', hex: '#1a1a1a' },
  { name: 'Portimao Blue',  hex: '#1e3a5f' },
  { name: 'Brooklyn Grey',  hex: '#7a7a7a' },
  { name: 'Crimson Red',    hex: '#8b1a1a' },
  { name: 'Arctic Silver',  hex: '#c0c0c8' },
];

type Status = 'AVAILABLE' | 'RESERVED' | 'SOLD';

type Form = {
  makeFilter: string;
  carModelId: string;
  trimId: string;
  vin: string;
  colorName: string;
  colorHex: string;
  mileage: string;
  purchasePrice: string;
  salePrice: string;
  status: Status;
  showroomId: string;
  dealerId: string;
};

const INIT: Form = {
  makeFilter: '', carModelId: '', trimId: '',
  vin: '', colorName: '', colorHex: '',
  mileage: '0', purchasePrice: '', salePrice: '',
  status: 'AVAILABLE', showroomId: '', dealerId: '',
};

type Props = {
  onClose: () => void;
  onCreated: () => void;
  onOpenCatalog: () => void;
  refreshSignal?: number;
};

export default function AddCarModal({ onClose, onCreated, onOpenCatalog, refreshSignal }: Props) {
  const [allModels, setAllModels]         = useState<CarModel[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [trims, setTrims]                 = useState<CarTrim[]>([]);
  const [trimsLoading, setTrimsLoading]   = useState(false);
  const [showrooms, setShowrooms]         = useState<ShowroomFull[]>([]);
  const [dealers, setDealers]             = useState<DealerFull[]>([]);
  const [form, setForm]                   = useState<Form>(INIT);
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState('');

  const set = (patch: Partial<Form>) => setForm(f => ({ ...f, ...patch }));

  const fetchModels = () => {
    setModelsLoading(true);
    getAllCarModels()
      .then(ms => setAllModels(ms.sort((a, b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`))))
      .finally(() => setModelsLoading(false));
  };

  useEffect(() => {
    fetchModels();
    getShowrooms().then(r => setShowrooms(r.results));
    getDealers().then(r => setDealers(r.results));
  }, []);

  
  useEffect(() => {
    if (refreshSignal) fetchModels();
  }, [refreshSignal]);

  useEffect(() => {
    if (form.carModelId && refreshSignal) {
      getCarTrimsForModel(form.carModelId).then(setTrims);
    }
  }, [refreshSignal]);

  useEffect(() => {
    if (!form.carModelId) { setTrims([]); return; }
    setTrimsLoading(true);
    getCarTrimsForModel(form.carModelId).then(setTrims).finally(() => setTrimsLoading(false));
    set({ trimId: '' });
  }, [form.carModelId]);

  const makes = [...new Set(allModels.map(m => m.make))].sort();
  const makeOptions: ComboboxOption[] = makes.map(m => ({ value: m, label: m }));
  const modelOptions: ComboboxOption[] = allModels
    .filter(m => !form.makeFilter || m.make === form.makeFilter)
    .map(m => ({ value: m.id, label: `${m.make} ${m.model}` }));

  const selectedTrim = trims.find(t => t.id === form.trimId);

  const handleSubmit = async () => {
    if (!form.trimId || !form.vin.trim() || !form.salePrice || !form.purchasePrice) {
      setError('Заполните все обязательные поля (*)');
      return;
    }
    if (form.vin.trim().length !== 17) {
      setError('VIN должен быть ровно 17 символов');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await createCar({
        trim_id: form.trimId,
        vin: form.vin.trim().toUpperCase(),
        color_name: form.colorName,
        color_hex: form.colorHex || '#cccccc',
        mileage: parseInt(form.mileage) || 0,
        purchase_price: parseFloat(form.purchasePrice),
        sale_price: parseFloat(form.salePrice),
        status: form.status,
        showroom_id: form.showroomId || null,
        dealer_id: form.dealerId || null,
      });
      onCreated();
    } catch (e: unknown) {
      const data = (e as { response?: { data?: unknown } })?.response?.data;
      if (data && typeof data === 'object') {
        const msgs = Object.entries(data as Record<string, string[]>)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' · ');
        setError(msgs);
      } else {
        setError('Ошибка при создании автомобиля');
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
            <h2>Добавить автомобиль</h2>
            <p className="modal-sub">Добавить новое авто в инвентарь</p>
          </div>
          <button className="modal-close" onClick={onClose}><IX /></button>
        </div>

        <div className="modal-body">

          {}
          <button className="catalog-hint" onClick={onOpenCatalog}>
            <span>Нужной модели или комплектации нет в списке?</span>
            <span className="catalog-hint-link">Добавить модель / комплектацию <IArrow /></span>
          </button>

          {}
          <div className="form-section-label" style={{ marginTop: 18 }}>Автомобиль</div>
          <div className="form-row">
            <label className="form-field">
              <span>Марка</span>
              <Combobox
                options={makeOptions}
                value={form.makeFilter}
                onChange={v => set({ makeFilter: v, carModelId: '', trimId: '' })}
                placeholder="Фильтр по марке…"
                loading={modelsLoading}
              />
            </label>
            <label className="form-field">
              <span>Модель *</span>
              <Combobox
                options={modelOptions}
                value={form.carModelId}
                onChange={v => set({ carModelId: v })}
                placeholder={form.makeFilter ? 'Выберите модель…' : 'Сначала выберите марку…'}
                loading={modelsLoading}
              />
            </label>
          </div>

          <label className="form-field" style={{ marginBottom: 12 }}>
            <span>Комплектация *</span>
            <select
              className="form-select"
              value={form.trimId}
              onChange={e => set({ trimId: e.target.value })}
              disabled={!form.carModelId || trimsLoading}
            >
              <option value="">
                {trimsLoading ? 'Загрузка…' : form.carModelId ? 'Выберите комплектацию…' : 'Сначала выберите модель'}
              </option>
              {trims.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} · {t.year} · {t.engine_hp} hp · {t.engine_fuel_type} · {t.transmission_type}
                </option>
              ))}
            </select>
          </label>

          {selectedTrim && (
            <div className="trim-info-strip">
              <span>{selectedTrim.vehicle_style}</span>
              <span>{selectedTrim.engine_cylinders}-cyl</span>
              <span>{selectedTrim.driven_wheels}</span>
              <span>{selectedTrim.number_of_doors} doors</span>
              <span>{selectedTrim.city_mpg}/{selectedTrim.highway_mpg} mpg</span>
            </div>
          )}

          {}
          <div className="form-section-label" style={{ marginTop: 22 }}>Детали</div>
          <div className="form-row">
            <label className="form-field">
              <span>VIN * <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(17 символов)</span></span>
              <input
                className="form-input mono"
                value={form.vin}
                onChange={e => set({ vin: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
                placeholder="1HGBH41JXMN109186"
                maxLength={17}
              />
            </label>
            <label className="form-field">
              <span>Статус *</span>
              <select className="form-select" value={form.status} onChange={e => set({ status: e.target.value as Status })}>
                <option value="AVAILABLE">Доступен</option>
                <option value="RESERVED">Зарезервирован</option>
                <option value="SOLD">Продан</option>
              </select>
            </label>
          </div>
          <div className="form-row">
            <label className="form-field">
              <span>Пробег (км)</span>
              <input className="form-input" type="number" min="0" value={form.mileage} onChange={e => set({ mileage: e.target.value })} placeholder="0" />
            </label>
            <div />
          </div>

          {}
          <div className="form-section-label" style={{ marginTop: 22 }}>Цвет</div>
          <div className="color-presets">
            {PRESET_COLORS.map(c => (
              <button
                key={c.hex}
                className={`color-preset${form.colorHex === c.hex ? ' selected' : ''}`}
                style={{ background: c.hex }}
                title={c.name}
                onClick={() => set({ colorName: c.name, colorHex: c.hex })}
              />
            ))}
            <input type="color" className="color-picker-input" value={form.colorHex || '#cccccc'}
              title="Custom color" onChange={e => set({ colorHex: e.target.value, colorName: '' })} />
          </div>
          <div className="form-row" style={{ marginTop: 10 }}>
            <label className="form-field">
              <span>Название цвета</span>
              <input className="form-input" value={form.colorName} onChange={e => set({ colorName: e.target.value })} placeholder="Pearl White" />
            </label>
            <label className="form-field">
              <span>Hex</span>
              <input className="form-input mono" value={form.colorHex} onChange={e => set({ colorHex: e.target.value })} placeholder="#cccccc" />
            </label>
          </div>

          {}
          <div className="form-section-label" style={{ marginTop: 22 }}>Цены</div>
          <div className="form-row">
            <label className="form-field">
              <span>Закупочная цена ($) *</span>
              <input className="form-input" type="number" min="0" value={form.purchasePrice} onChange={e => set({ purchasePrice: e.target.value })} placeholder="0" />
            </label>
            <label className="form-field">
              <span>Цена продажи ($) *</span>
              <input className="form-input" type="number" min="0" value={form.salePrice} onChange={e => set({ salePrice: e.target.value })} placeholder="0" />
            </label>
          </div>

          {}
          <div className="form-section-label" style={{ marginTop: 22 }}>Назначение</div>
          <div className="form-row">
            <label className="form-field">
              <span>Шоурум</span>
              <select className="form-select" value={form.showroomId} onChange={e => set({ showroomId: e.target.value })}>
                <option value="">— Не назначен —</option>
                {showrooms.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
            <label className="form-field">
              <span>Дилер</span>
              <select className="form-select" value={form.dealerId} onChange={e => set({ dealerId: e.target.value })}>
                <option value="">— Не назначен —</option>
                {dealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </label>
          </div>

        </div>

        {error && <div className="modal-error">{error}</div>}

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Добавление…' : 'Добавить авто →'}
          </button>
        </div>

      </div>
    </div>
  );
}
