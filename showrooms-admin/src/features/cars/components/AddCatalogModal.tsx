import { useCallback, useEffect, useRef, useState } from 'react';
import { createCarModel, createCarTrim, deleteTrimImage, getAllCarModels, uploadTrimImage } from '../api/cars.api';
import { CarModel, TrimImage } from '../model/car.types';
import Combobox, { ComboboxOption } from '../../../shared/ui/Combobox';

const IX = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>;
const ICheck = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-5"/></svg>;
const ITrash = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>;
const IUpload = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;

const FUEL_TYPES    = [['GASOLINE','Бензин'],['DIESEL','Дизель'],['ELECTRIC','Электро']] as const;
const TRANSMISSIONS = [['AUTOMATIC','Автомат'],['MANUAL','Механика'],['ROBOT','Робот'],['DIRECT_DRIVE','Прямой привод']] as const;
const DRIVE_TYPES   = [['FWD','Передний (FWD)'],['RWD','Задний (RWD)'],['AWD','Полный (AWD)'],['4WD','Подключаемый (4WD)']] as const;
const BODY_STYLES   = [['SEDAN','Седан'],['SUV','Внедорожник'],['COUPE','Купе'],['CONVERTIBLE','Кабриолет'],['HATCHBACK','Хэтчбек'],['WAGON','Универсал'],['PICKUP','Пикап'],['MINIVAN','Минивэн'],['VAN','Фургон']] as const;

type ModelForm = { make: string; model: string };
const MODEL_INIT: ModelForm = { make: '', model: '' };

function NewModelTab({
  allModels, modelsLoading, onCreated,
}: {
  allModels: CarModel[];
  modelsLoading: boolean;
  onCreated: (m: CarModel) => void;
}) {
  const [form, setForm]     = useState<ModelForm>(MODEL_INIT);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  const set = (p: Partial<ModelForm>) => setForm(f => ({ ...f, ...p }));

  const makes = [...new Set(allModels.map(m => m.make))].sort();
  const makeOptions: ComboboxOption[] = makes.map(m => ({ value: m, label: m }));

  const handleSubmit = async () => {
    if (!form.make.trim() || !form.model.trim()) {
      setError('Заполните марку и название модели');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const created = await createCarModel({ make: form.make.trim(), model: form.model.trim() });
      setSuccess(`Создано: ${created.make} ${created.model}`);
      onCreated(created);
      setForm(MODEL_INIT);
    } catch (e: unknown) {
      const data = (e as { response?: { data?: unknown } })?.response?.data;
      if (data && typeof data === 'object') {
        const msgs = Object.entries(data as Record<string, string[]>)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' · ');
        setError(msgs);
      } else {
        setError('Ошибка при создании');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 18 }}>
        Создайте новую марку и/или модель автомобиля. После создания она сразу появится в форме добавления машины.
      </p>

      {success && (
        <div className="catalog-success">
          <ICheck />{success}
        </div>
      )}

      <div className="form-row">
        <label className="form-field">
          <span>Марка *</span>
          <Combobox
            options={makeOptions}
            value={form.make}
            onChange={v => set({ make: v })}
            placeholder="Выберите или введите марку…"
            loading={modelsLoading}
            onCreateNew={v => set({ make: v })}
            createLabel={v => `Создать марку "${v}"`}
          />
        </label>
        <label className="form-field">
          <span>Модель *</span>
          <input
            className="form-input"
            value={form.model}
            onChange={e => set({ model: e.target.value })}
            placeholder="например X5, Camry, A4…"
          />
        </label>
      </div>

      {error && <div className="modal-error" style={{ margin: '0 0 12px' }}>{error}</div>}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Создание…' : '+ Создать модель'}
        </button>
      </div>
    </div>
  );
}

interface PendingImage {
  localId: string;
  file: File;
  preview: string;
  isDefault: boolean;
  uploading: boolean;
  done: boolean;
  error: boolean;
}

interface DoneGroup {
  colorHex: string;
  colorName: string;
  count: number;
}

interface ColorGroupProps {
  trimId: string;
  usedHexes: string[];
  onUploaded: (group: DoneGroup) => void;
}

function ColorGroup({ trimId, usedHexes, onUploaded }: ColorGroupProps) {
  const [colorHex, setColorHex]   = useState('#cccccc');
  const [colorName, setColorName] = useState('');
  const [images, setImages]       = useState<PendingImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging]   = useState(false);
  const [dupWarn, setDupWarn]     = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useRef(`photo-input-${trimId}-${Math.random().toString(36).slice(2)}`).current;

  const defaultId = images.find(i => i.isDefault)?.localId ?? null;
  const canUpload = images.length > 0 && defaultId !== null && !uploading && colorName.trim().length > 0;

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    setImages(prev => [
      ...prev,
      ...Array.from(files)
        .filter(f => !f.type || f.type.startsWith('image/'))
        .map(f => ({
          localId: crypto.randomUUID(),
          file: f,
          preview: URL.createObjectURL(f),
          isDefault: false,
          uploading: false,
          done: false,
          error: false,
        })),
    ]);
  }, []);

  const setDefault = (localId: string) =>
    setImages(prev => prev.map(i => ({ ...i, isDefault: i.localId === localId })));

  const removeImage = (localId: string) =>
    setImages(prev => {
      const removed = prev.find(i => i.localId === localId);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter(i => i.localId !== localId);
    });

  const handleColorHexChange = (hex: string) => {
    setColorHex(hex);
    setDupWarn(usedHexes.includes(hex));
  };

  const handleUpload = async () => {
    if (!canUpload) return;
    setUploading(true);
    let allOk = true;
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      setImages(prev => prev.map(x => x.localId === img.localId ? { ...x, uploading: true } : x));
      try {
        await uploadTrimImage({
          trim: trimId,
          image: img.file,
          color_name: colorName.trim() || undefined,
          color_hex: colorHex,
          is_default: img.isDefault,
          order: i,
        });
        setImages(prev => prev.map(x => x.localId === img.localId ? { ...x, uploading: false, done: true } : x));
      } catch {
        setImages(prev => prev.map(x => x.localId === img.localId ? { ...x, uploading: false, error: true } : x));
        allOk = false;
      }
    }
    setUploading(false);
    if (allOk) onUploaded({ colorHex, colorName: colorName.trim(), count: images.length });
  };

  return (
    <div className="color-group">
      <div className="color-group-header">
        <input
          type="color"
          className="photo-color-picker"
          value={colorHex}
          onChange={e => handleColorHexChange(e.target.value)}
          title="Цвет"
        />
        <input
          className="form-input"
          style={{ flex: 1 }}
          placeholder="Название цвета (например: Белый перламутр)"
          value={colorName}
          onChange={e => setColorName(e.target.value)}
        />
      </div>

      {dupWarn && (
        <div className="photo-dup-warn">Фото для этого цвета уже добавлены</div>
      )}

      <label
        className={'photo-dropzone' + (dragging ? ' dragging' : '')}
        htmlFor={inputId}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
      >
        <IUpload />
        <span>Перетащите фото сюда или нажмите для выбора</span>
      </label>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
      />

      {images.length > 0 && (
        <>
          {defaultId === null && (
            <div className="photo-no-default-hint">Отметьте одно фото как основное</div>
          )}
          <div className="photo-grid">
            {images.map(img => (
              <div key={img.localId} className={'photo-card' + (img.done ? ' uploaded' : '') + (img.error ? ' errored' : '')}>
                <div className="photo-preview-wrap">
                  <img src={img.preview} alt="" className="photo-preview" />
                  {img.uploading && <div className="photo-uploading-overlay">…</div>}
                  {img.done && <div className="photo-done-badge"><ICheck /></div>}
                  {!img.done && !img.uploading && (
                    <button className="photo-delete-btn" onClick={() => removeImage(img.localId)}><ITrash /></button>
                  )}
                </div>
                <div className="photo-meta">
                  <label className={'photo-default-label' + (img.isDefault ? ' is-default' : '')}>
                    <input
                      type="radio"
                      name={`default-${trimId}`}
                      checked={img.isDefault}
                      onChange={() => setDefault(img.localId)}
                      disabled={img.done || uploading}
                    />
                    Основная
                  </label>
                  {img.error && <div className="photo-error">Ошибка загрузки</div>}
                </div>
              </div>
            ))}
          </div>

          <div className="photo-upload-actions">
            <button className="btn btn-primary" onClick={handleUpload} disabled={!canUpload}>
              {uploading ? 'Загрузка…' : `Загрузить ${images.length > 1 ? `все (${images.length})` : 'фото'}`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function PhotoUploadSection({ trimId, onDone }: { trimId: string; onDone: () => void }) {
  const [doneGroups, setDoneGroups] = useState<DoneGroup[]>([]);
  const [showNewGroup, setShowNewGroup] = useState(true);

  const usedHexes = doneGroups.map(g => g.colorHex);

  const handleGroupUploaded = (group: DoneGroup) => {
    setDoneGroups(prev => [...prev, group]);
    setShowNewGroup(false);
  };

  return (
    <div className="photo-upload-section">
      <div className="photo-upload-header">
        <ICheck />
        <span>Комплектация создана — добавьте фотографии по цветам</span>
      </div>

      {doneGroups.length > 0 && (
        <div className="done-groups-list">
          {doneGroups.map(g => (
            <div key={g.colorHex} className="done-group-chip">
              <span className="done-group-swatch" style={{ background: g.colorHex }} />
              <span>{g.colorName || g.colorHex}</span>
              <span className="done-group-count">{g.count} фото ✓</span>
            </div>
          ))}
        </div>
      )}

      {showNewGroup && (
        <ColorGroup
          key={doneGroups.length}
          trimId={trimId}
          usedHexes={usedHexes}
          onUploaded={handleGroupUploaded}
        />
      )}

      <div className="photo-upload-actions">
        {!showNewGroup && (
          <button className="btn btn-outline" onClick={() => setShowNewGroup(true)}>
            + Добавить ещё цвет
          </button>
        )}
        <button className="btn btn-primary" onClick={onDone}>
          {doneGroups.length > 0 ? 'Готово' : 'Пропустить'}
        </button>
      </div>
    </div>
  );
}

type TrimForm = {
  carModelId: string;
  name: string;
  year: string;
  engine_hp: string;
  engine_cylinders: string;
  engine_fuel_type: string;
  transmission_type: string;
  driven_wheels: string;
  vehicle_style: string;
  number_of_doors: string;
  city_mpg: string;
  highway_mpg: string;
};

const TRIM_INIT: TrimForm = {
  carModelId: '', name: '', year: String(new Date().getFullYear()),
  engine_hp: '', engine_cylinders: '4',
  engine_fuel_type: 'GASOLINE', transmission_type: 'AUTOMATIC',
  driven_wheels: 'FWD', vehicle_style: 'SEDAN',
  number_of_doors: '4', city_mpg: '', highway_mpg: '',
};

function NewTrimTab({
  allModels, modelsLoading, initialModelId,
}: {
  allModels: CarModel[];
  modelsLoading: boolean;
  initialModelId?: string;
}) {
  const [form, setForm]         = useState<TrimForm>({ ...TRIM_INIT, carModelId: initialModelId ?? '' });
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [createdTrimId, setCreatedTrimId] = useState<string | null>(null);

  useEffect(() => {
    if (initialModelId) setForm(f => ({ ...f, carModelId: initialModelId }));
  }, [initialModelId]);

  const set = (p: Partial<TrimForm>) => setForm(f => ({ ...f, ...p }));

  const modelOptions: ComboboxOption[] = allModels.map(m => ({ value: m.id, label: `${m.make} ${m.model}` }));

  const handleSubmit = async () => {
    const { carModelId, year, engine_hp, city_mpg, highway_mpg, number_of_doors } = form;
    if (!carModelId || !year || !city_mpg || !highway_mpg || !number_of_doors) {
      setError('Заполните все обязательные поля (*)');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const created = await createCarTrim({
        car_model_id: carModelId,
        name: form.name.trim(),
        year: parseInt(year),
        engine_hp: engine_hp ? parseInt(engine_hp) : null,
        engine_cylinders: form.engine_cylinders ? parseInt(form.engine_cylinders) : null,
        engine_fuel_type: form.engine_fuel_type,
        transmission_type: form.transmission_type,
        driven_wheels: form.driven_wheels,
        vehicle_style: form.vehicle_style,
        number_of_doors: parseInt(number_of_doors),
        city_mpg: parseInt(city_mpg),
        highway_mpg: parseInt(highway_mpg),
      });
      setCreatedTrimId(created.id);
    } catch (e: unknown) {
      const data = (e as { response?: { data?: unknown } })?.response?.data;
      if (data && typeof data === 'object') {
        const msgs = Object.entries(data as Record<string, string[]>)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' · ');
        setError(msgs);
      } else {
        setError('Ошибка при создании');
      }
    } finally {
      setSaving(false);
    }
  };

  if (createdTrimId) {
    return (
      <PhotoUploadSection
        trimId={createdTrimId}
        onDone={() => {
          setCreatedTrimId(null);
          setForm(f => ({ ...TRIM_INIT, carModelId: f.carModelId }));
        }}
      />
    );
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 18 }}>
        Добавьте комплектацию к существующей модели. После создания она появится в списке при добавлении машины.
      </p>

      <label className="form-field" style={{ marginBottom: 12 }}>
        <span>Модель *</span>
        <Combobox
          options={modelOptions}
          value={form.carModelId}
          onChange={v => set({ carModelId: v })}
          placeholder="Выберите модель…"
          loading={modelsLoading}
        />
      </label>

      <div className="form-section-label">Основное</div>
      <div className="form-row">
        <label className="form-field">
          <span>Название комплектации</span>
          <input className="form-input" value={form.name} onChange={e => set({ name: e.target.value })} placeholder="Sport, Premium, Base…" />
        </label>
        <label className="form-field">
          <span>Год *</span>
          <input className="form-input" type="number" min="1980" max="2030" value={form.year} onChange={e => set({ year: e.target.value })} />
        </label>
      </div>
      <div className="form-row">
        <label className="form-field">
          <span>Кузов *</span>
          <select className="form-select" value={form.vehicle_style} onChange={e => set({ vehicle_style: e.target.value })}>
            {BODY_STYLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label className="form-field">
          <span>Дверей *</span>
          <select className="form-select" value={form.number_of_doors} onChange={e => set({ number_of_doors: e.target.value })}>
            <option value="2">2</option>
            <option value="4">4</option>
          </select>
        </label>
      </div>

      <div className="form-section-label" style={{ marginTop: 16 }}>Двигатель</div>
      <div className="form-row">
        <label className="form-field">
          <span>Тип топлива *</span>
          <select className="form-select" value={form.engine_fuel_type} onChange={e => set({ engine_fuel_type: e.target.value })}>
            {FUEL_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label className="form-field">
          <span>Мощность (HP)</span>
          <input className="form-input" type="number" min="0" value={form.engine_hp} onChange={e => set({ engine_hp: e.target.value })} placeholder="150" />
        </label>
      </div>
      <div className="form-row">
        <label className="form-field">
          <span>Цилиндры</span>
          <input className="form-input" type="number" min="0" max="16" value={form.engine_cylinders} onChange={e => set({ engine_cylinders: e.target.value })} placeholder="4" />
        </label>
        <div />
      </div>

      <div className="form-section-label" style={{ marginTop: 16 }}>Трансмиссия</div>
      <div className="form-row">
        <label className="form-field">
          <span>КПП *</span>
          <select className="form-select" value={form.transmission_type} onChange={e => set({ transmission_type: e.target.value })}>
            {TRANSMISSIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label className="form-field">
          <span>Привод *</span>
          <select className="form-select" value={form.driven_wheels} onChange={e => set({ driven_wheels: e.target.value })}>
            {DRIVE_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
      </div>

      <div className="form-section-label" style={{ marginTop: 16 }}>Расход (mpg)</div>
      <div className="form-row">
        <label className="form-field">
          <span>Город *</span>
          <input className="form-input" type="number" min="0" value={form.city_mpg} onChange={e => set({ city_mpg: e.target.value })} placeholder="12" />
        </label>
        <label className="form-field">
          <span>Трасса *</span>
          <input className="form-input" type="number" min="0" value={form.highway_mpg} onChange={e => set({ highway_mpg: e.target.value })} placeholder="18" />
        </label>
      </div>

      {error && <div className="modal-error" style={{ margin: '0 0 12px' }}>{error}</div>}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Создание…' : '+ Создать комплектацию'}
        </button>
      </div>
    </div>
  );
}

type Tab = 'model' | 'trim';

type Props = { onClose: () => void };

export default function AddCatalogModal({ onClose }: Props) {
  const [tab, setTab]                   = useState<Tab>('model');
  const [allModels, setAllModels]       = useState<CarModel[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [lastCreatedModelId, setLastCreatedModelId] = useState<string | undefined>();

  useEffect(() => {
    getAllCarModels()
      .then(ms => setAllModels(ms.sort((a, b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`))))
      .finally(() => setModelsLoading(false));
  }, []);

  const handleModelCreated = (m: CarModel) => {
    setAllModels(prev => [...prev, m].sort((a, b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`)));
    setLastCreatedModelId(m.id);
  };

  return (
    <div className="modal-overlay modal-overlay-top" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">

        <div className="modal-header">
          <div>
            <h2>Каталог</h2>
            <p className="modal-sub">Добавление модели и комплектации</p>
          </div>
          <button className="modal-close" onClick={onClose}><IX /></button>
        </div>

        <div className="catalog-tabs">
          <button className={`catalog-tab${tab === 'model' ? ' active' : ''}`} onClick={() => setTab('model')}>
            Новая модель
          </button>
          <button className={`catalog-tab${tab === 'trim' ? ' active' : ''}`} onClick={() => setTab('trim')}>
            Новая комплектация
          </button>
        </div>

        <div className="modal-body">
          {tab === 'model' ? (
            <NewModelTab
              allModels={allModels}
              modelsLoading={modelsLoading}
              onCreated={m => {
                handleModelCreated(m);
                setTab('trim');
              }}
            />
          ) : (
            <NewTrimTab
              allModels={allModels}
              modelsLoading={modelsLoading}
              initialModelId={lastCreatedModelId}
            />
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Закрыть</button>
        </div>

      </div>
    </div>
  );
}
