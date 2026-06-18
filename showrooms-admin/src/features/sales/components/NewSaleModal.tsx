import { useEffect, useRef, useState } from 'react';
import apiClient from '../../../shared/api/apiClient';
import { Car, PaginatedResponse } from '../../cars/model/car.types';
import { ShowroomFull } from '../../showrooms/model/showroom.types';
import { EmployeeFull } from '../../employees/model/employee.types';
import { createSale } from '../api/sales.api';
import { SaleList, PaymentMethod } from '../model/sale.types';

interface Client { id: string; first_name: string; last_name: string; }

const IClose = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>;
const ICheck = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>;
const ICar = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h14M5 17v2a1 1 0 001 1h1a1 1 0 001-1v-2M19 17v2a1 1 0 01-1 1h-1a1 1 0 01-1-1v-2"/><path d="M3 13l1.5-5a2 2 0 012-1.5h11a2 2 0 012 1.5L21 13v4H3v-4z"/><circle cx="7.5" cy="13.5" r="1"/><circle cx="16.5" cy="13.5" r="1"/></svg>;

const PAY_LABELS: Record<PaymentMethod, string> = { cash: 'Наличные', credit: 'Кредит', tradein: 'Трейд-ин' };
const GRAD = ['g1', 'g2', 'g3', 'g4'];

function initials(first: string, last: string) {
  return (first[0] ?? '') + (last[0] ?? '');
}

function grad(id: string) {
  return GRAD[Math.abs(id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % 4];
}

interface SearchableSelectProps<T> {
  value: string | null;
  selectedItem: T | null;
  onSelect: (id: string, item: T) => void;
  onSearch: (q: string) => Promise<T[]>;
  placeholder: string;
  searchable?: boolean;
  renderTrigger: (item: T) => React.ReactNode;
  renderItem: (item: T) => React.ReactNode;
  getId: (item: T) => string;
  minChars?: number;
}

function SearchableSelect<T>({
  value, selectedItem, onSelect, onSearch, placeholder, searchable = true,
  renderTrigger, renderItem, getId, minChars = 3,
}: SearchableSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) { setQ(''); setItems([]); return; }
    if (!searchable) {
      setLoading(true);
      onSearch('').then(res => { setItems(res); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [open]); 

  const handleQueryChange = (val: string) => {
    setQ(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (val.length < minChars) { setItems([]); return; }
    timerRef.current = setTimeout(() => {
      setLoading(true);
      onSearch(val).then(res => { setItems(res); setLoading(false); }).catch(() => setLoading(false));
    }, 300);
  };

  const emptyHint = loading
    ? 'Загрузка…'
    : searchable
      ? (q.length >= minChars ? 'Ничего не найдено' : `Введите ${minChars}+ символа для поиска`)
      : 'Ничего не найдено';

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className={'select-trigger' + (!selectedItem ? ' placeholder' : '')}
        onClick={() => setOpen(o => !o)}
      >
        {selectedItem ? renderTrigger(selectedItem) : <span>{placeholder}</span>}
      </button>
      {open && (
        <div className="select-pop">
          {searchable && (
            <div className="pop-search">
              <input autoFocus value={q} onChange={e => handleQueryChange(e.target.value)} placeholder={`Введите ${minChars}+ символа…`} />
            </div>
          )}
          <div className="pop-list">
            {items.length === 0
              ? <div className="pop-empty">{emptyHint}</div>
              : items.map(it => (
                  <div
                    key={getId(it)}
                    className={'pop-item' + (value === getId(it) ? ' selected' : '')}
                    onClick={() => { onSelect(getId(it), it); setOpen(false); }}
                  >
                    {renderItem(it)}
                    {value === getId(it) && <span className="pi-check"><ICheck /></span>}
                  </div>
                ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  onClose: () => void;
  onCreated: (sale: SaleList) => void;
}

const today = new Date().toISOString().slice(0, 10);

export default function NewSaleModal({ onClose, onCreated }: Props) {
  const [carId, setCarId] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [showroomId, setShowroomId] = useState<string | null>(null);
  const [empId, setEmpId] = useState<string | null>(null);

  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedShowroom, setSelectedShowroom] = useState<ShowroomFull | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeFull | null>(null);

  const [date, setDate] = useState(today);
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [pay, setPay] = useState<PaymentMethod>('credit');
  const [warranty, setWarranty] = useState('24');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const searchCars = async (q: string): Promise<Car[]> => {
    const res = await apiClient.get<PaginatedResponse<Car>>('/cars/', { params: { search: q, status: 'AVAILABLE', page_size: 20 } });
    return res.data.results;
  };

  const searchClients = async (q: string): Promise<Client[]> => {
    const res = await apiClient.get<PaginatedResponse<Client>>('/clients/', { params: { search: q, page_size: 20 } });
    return res.data.results;
  };

  const loadShowrooms = async (_q: string): Promise<ShowroomFull[]> => {
    const res = await apiClient.get<PaginatedResponse<ShowroomFull>>('/showrooms/', { params: { page_size: 200 } });
    return res.data.results;
  };

  const searchEmployees = async (q: string): Promise<EmployeeFull[]> => {
    const res = await apiClient.get<PaginatedResponse<EmployeeFull>>('/employees/', { params: { search: q, page_size: 20 } });
    return res.data.results;
  };

  const canSubmit = carId && clientId && showroomId && date && price && pay && !saving;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError('');
    try {
      const sale = await createSale({
        car_id: carId!,
        client_id: clientId!,
        showroom_id: showroomId!,
        employee_id: empId || null,
        sale_date: date,
        final_price: Number(price),
        discount: Number(discount) / 100,
        payment_method: pay,
        warranty_period: Number(warranty) || 0,
      });
      onCreated(sale);
      onClose();
    } catch {
      setError('Не удалось сохранить продажу. Проверьте данные.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="scrim" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="sale-modal" role="dialog">
        <header className="modal-head">
          <div className="head-icon"><ICar /></div>
          <div className="head-text">
            <h2 className="head-title">Новая продажа</h2>
            <p className="head-sub">Зарегистрируйте закрытую сделку — укажите авто, клиента и оплату.</p>
          </div>
          <button className="head-close" onClick={onClose}><IClose /></button>
        </header>

        <div className="modal-grid-body">
          <div className="modal-col">
            <div>
              <div className="field-label"><span>Автомобиль</span><span className="req">*</span></div>
              <SearchableSelect
                value={carId}
                selectedItem={selectedCar}
                onSelect={(id, car) => { setCarId(id); setSelectedCar(car); }}
                onSearch={searchCars}
                placeholder="Поиск по марке, модели, VIN…"
                getId={c => c.id}
                renderTrigger={c => (
                  <>
                    <div className="ti-swatch" style={{ background: c.color_hex }} />
                    <span className="ti-main">{c.trim.car_model.make} {c.trim.car_model.model}</span>
                    <span className="ti-sub">· {c.color_name} · …{c.vin.slice(-6)}</span>
                  </>
                )}
                renderItem={c => (
                  <>
                    <div className="pi-swatch" style={{ background: c.color_hex }} />
                    <div className="pi-body">
                      <div className="pi-main">{c.trim.car_model.make} {c.trim.car_model.model} · {c.trim.name}</div>
                      <div className="pi-sub mono">{c.color_name} · …{c.vin.slice(-6)}</div>
                    </div>
                  </>
                )}
              />
            </div>

            <div>
              <div className="field-label"><span>Клиент</span><span className="req">*</span></div>
              <SearchableSelect
                value={clientId}
                selectedItem={selectedClient}
                onSelect={(id, client) => { setClientId(id); setSelectedClient(client); }}
                onSearch={searchClients}
                placeholder="Поиск по имени…"
                getId={c => c.id}
                renderTrigger={c => (
                  <>
                    <div className={'ti-av ' + grad(c.id)}>{initials(c.first_name, c.last_name).toUpperCase()}</div>
                    <span className="ti-main">{c.first_name} {c.last_name}</span>
                  </>
                )}
                renderItem={c => (
                  <>
                    <div className={'pi-av ' + grad(c.id)}>{initials(c.first_name, c.last_name).toUpperCase()}</div>
                    <div className="pi-body">
                      <div className="pi-main">{c.first_name} {c.last_name}</div>
                    </div>
                  </>
                )}
              />
            </div>

            <div>
              <div className="field-label"><span>Шоурум</span><span className="req">*</span></div>
              <SearchableSelect
                value={showroomId}
                selectedItem={selectedShowroom}
                onSelect={(id, showroom) => { setShowroomId(id); setSelectedShowroom(showroom); }}
                onSearch={loadShowrooms}
                placeholder="Выберите шоурум…"
                searchable={false}
                getId={s => s.id}
                renderTrigger={s => (
                  <>
                    <span className="ti-main">{s.name}</span>
                    <span className="ti-sub">· {s.address.city}</span>
                  </>
                )}
                renderItem={s => (
                  <div className="pi-body">
                    <div className="pi-main">{s.name}</div>
                    <div className="pi-sub">{s.address.city}</div>
                  </div>
                )}
              />
            </div>
          </div>

          <div className="modal-col">
            <div>
              <div className="field-label"><span>Сотрудник</span></div>
              <SearchableSelect
                value={empId}
                selectedItem={selectedEmployee}
                onSelect={(id, emp) => { setEmpId(id); setSelectedEmployee(emp); }}
                onSearch={searchEmployees}
                placeholder="Поиск по имени…"
                getId={e => e.id}
                renderTrigger={e => (
                  <>
                    <div className={'ti-av ' + grad(e.id)}>{initials(e.first_name, e.last_name).toUpperCase()}</div>
                    <span className="ti-main">{e.first_name} {e.last_name}</span>
                  </>
                )}
                renderItem={e => (
                  <>
                    <div className={'pi-av ' + grad(e.id)}>{initials(e.first_name, e.last_name).toUpperCase()}</div>
                    <div className="pi-body">
                      <div className="pi-main">{e.first_name} {e.last_name}</div>
                      <div className="pi-sub">{e.position}</div>
                    </div>
                  </>
                )}
              />
            </div>

            <div>
              <div className="field-label"><span>Дата продажи</span><span className="req">*</span></div>
              <input type="date" className="input mono" value={date} onChange={e => setDate(e.target.value)} />
            </div>

            <div>
              <div className="field-label">
                <span>Итоговая цена</span><span className="req">*</span>
                <span className="hint">включая НДС</span>
              </div>
              <div className="price-row">
                <div className="input-prefix-wrap">
                  <span className="input-prefix">$</span>
                  <input
                    className="input mono"
                    placeholder="0"
                    value={price}
                    onChange={e => setPrice(e.target.value.replace(/[^0-9]/g, ''))}
                  />
                </div>
                <div className="input-prefix-wrap">
                  <input
                    className="input mono has-suffix"
                    placeholder="0"
                    value={discount}
                    onChange={e => setDiscount(e.target.value.replace(/[^0-9]/g, ''))}
                    style={{ paddingLeft: 10 }}
                  />
                  <span className="input-suffix">% скидка</span>
                </div>
              </div>
            </div>

            <div>
              <div className="field-label"><span>Способ оплаты</span><span className="req">*</span></div>
              <div className="pay-group" role="radiogroup">
                {(['cash', 'credit', 'tradein'] as PaymentMethod[]).map(p => (
                  <button
                    key={p} type="button" role="radio" aria-checked={pay === p}
                    className={`pay-pill ${p}${pay === p ? ' selected' : ''}`}
                    onClick={() => setPay(p)}
                  >
                    {PAY_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="field-label"><span>Гарантия</span></div>
              <div className="input-prefix-wrap">
                <input
                  className="input mono has-suffix"
                  value={warranty}
                  onChange={e => setWarranty(e.target.value.replace(/[^0-9]/g, ''))}
                  style={{ paddingLeft: 10 }}
                />
                <span className="input-suffix">months</span>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <footer className="modal-foot">
          <div className={'summary-chip' + (selectedCar ? '' : ' empty')}>
            <span className="sc-swatch" style={selectedCar ? { background: selectedCar.color_hex } : {}} />
            <span className="sc-name">
              {selectedCar
                ? `${selectedCar.trim.car_model.make} ${selectedCar.trim.car_model.model} · ${selectedCar.color_name}`
                : 'Автомобиль не выбран'}
            </span>
          </div>
          <div className="foot-actions">
            <button className="btn btn-ghost" onClick={onClose}>Отмена</button>
            <button className="btn btn-primary" disabled={!canSubmit} onClick={handleSubmit}>
              {saving ? 'Сохранение…' : 'Зарегистрировать продажу'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
