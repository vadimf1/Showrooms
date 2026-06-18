import { useEffect, useRef, useState } from 'react';
import { fmtMoney } from '../../shared/utils/money';
import { getCars } from '../../features/cars/api/cars.api';
import { Car, CarStatus } from '../../features/cars/model/car.types';
import AddCarModal from '../../features/cars/components/AddCarModal';
import AddCatalogModal from '../../features/cars/components/AddCatalogModal';
import EditCarModal from '../../features/cars/components/EditCarModal';
import DeleteConfirmModal from '../../features/cars/components/DeleteConfirmModal';

const ISearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
const IEdit  = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 3.5a2.1 2.1 0 113 3L7 19l-4 1 1-4z"/></svg>;
const ITrash = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6"/></svg>;
const IPlus  = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>;
const ISort  = () => <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M7 12h10M11 18h2"/></svg>;

const STATUS_LABELS: Record<CarStatus, string> = { AVAILABLE: 'Доступен', SOLD: 'Продан', RESERVED: 'Зарезервирован' };
const STATUS_CLASS: Record<CarStatus, string>  = { AVAILABLE: 'badge-available', SOLD: 'badge-sold', RESERVED: 'badge-reserved' };

const SORT_OPTIONS = [
  { value: '-created_at', label: 'Сначала новые' },
  { value: 'created_at',  label: 'Сначала старые' },
  { value: 'sale_price',  label: 'Цена: по возрастанию' },
  { value: '-sale_price', label: 'Цена: по убыванию' },
  { value: 'mileage',     label: 'Пробег: по возрастанию' },
  { value: '-mileage',    label: 'Пробег: по убыванию' },
  { value: '-trim__year', label: 'Год: сначала новые' },
  { value: 'trim__year',  label: 'Год: сначала старые' },
];

const PAGE_SIZE = 20;

const CarsPage = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [status, setStatus] = useState<CarStatus | 'all'>('all');
  const [ordering, setOrdering] = useState('-created_at');
  const [showAddModal, setShowAddModal]         = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogRefresh, setCatalogRefresh]     = useState(0);
  const [editingCar, setEditingCar]             = useState<Car | null>(null);
  const [deletingCar, setDeletingCar]           = useState<Car | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  
  const handleSearch = (val: string) => {
    setQ(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQ(val);
      setPage(1);
    }, 350);
  };

  useEffect(() => {
    setLoading(true);
    getCars({
      page,
      search: debouncedQ || undefined,
      status: status === 'all' ? undefined : status,
      ordering,
    })
      .then(d => { setCars(d.results); setTotal(d.count); })
      .finally(() => setLoading(false));
  }, [page, debouncedQ, status, ordering]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleStatusChange = (val: CarStatus | 'all') => {
    setStatus(val);
    setPage(1);
  };

  const handleOrderingChange = (val: string) => {
    setOrdering(val);
    setPage(1);
  };

  
  const pageNums = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const set = new Set([1, totalPages, page - 1, page, page + 1].filter(p => p >= 1 && p <= totalPages));
    return [...set].sort((a, b) => a - b);
  })();

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Автомобили</h1>
          <p>Управление всем автопарком по всем шоурумам.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}><IPlus /> Добавить авто</button>
        </div>
      </div>

      <div className="table-toolbar">
        <div className="toolbar-search">
          <ISearch />
          <input
            value={q}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Поиск по марке, модели, VIN…"
          />
        </div>
        <select
          className="filter-select"
          value={status}
          onChange={e => handleStatusChange(e.target.value as CarStatus | 'all')}
        >
          <option value="all">Все статусы</option>
          <option value="AVAILABLE">Доступен</option>
          <option value="RESERVED">Зарезервирован</option>
          <option value="SOLD">Продан</option>
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ISort />
          <select
            className="filter-select"
            value={ordering}
            onChange={e => handleOrderingChange(e.target.value)}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="toolbar-spacer" />
        <span className="result-count">{total} авто</span>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Автомобиль</th>
              <th>VIN</th>
              <th>Цвет</th>
              <th className="right">Пробег</th>
              <th className="right">Цена</th>
              <th>Статус</th>
              <th>Шоурум</th>
              <th className="col-actions" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>Загрузка…</td></tr>
            ) : cars.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>Ничего не найдено</td></tr>
            ) : cars.map(c => (
              <tr key={c.id}>
                <td>
                  <div className="car-cell">
                    <div className="car-swatch" style={{ background: c.color_hex }} />
                    <div className="car-info">
                      <span className="car-name">
                        {c.trim.car_model.make} {c.trim.car_model.model}
                        <span style={{ color: 'var(--muted)', fontWeight: 500 }}> · {c.trim.year}</span>
                      </span>
                      <span className="car-trim">{c.trim.name}</span>
                    </div>
                  </div>
                </td>
                <td className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{c.vin}</td>
                <td>
                  <span className="color-cell">
                    <span className="color-dot" style={{ background: c.color_hex }} />
                    {c.color_name}
                  </span>
                </td>
                <td className="num right">{c.mileage.toLocaleString()} km</td>
                <td className="num right price">{fmtMoney(c.sale_price)}</td>
                <td><span className={`badge ${STATUS_CLASS[c.status]}`}>{STATUS_LABELS[c.status]}</span></td>
                <td style={{ color: 'var(--ink-2)' }}>{c.showroom?.name ?? '—'}</td>
                <td className="col-actions">
                  <div className="actions-row">
                    <button className="btn-icon-sm" title="Edit" onClick={() => setEditingCar(c)}><IEdit /></button>
                    <button className="btn-icon-sm danger" title="Delete" onClick={() => setDeletingCar(c)}><ITrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="pagination">
            <span>
              Показано <b style={{ color: 'var(--ink)' }}>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}</b> из <b style={{ color: 'var(--ink)' }}>{total}</b>
            </span>
            <div className="pg-controls">
              <button className="pg-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
              {pageNums.map((p, i) => {
                const prev = pageNums[i - 1];
                return (
                  <>
                    {prev && p - prev > 1 && <button key={`ellipsis-${p}`} className="pg-btn" disabled>…</button>}
                    <button
                      key={p}
                      className={`pg-btn${p === page ? ' active' : ''}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  </>
                );
              })}
              <button className="pg-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          </div>
        )}
      </div>
      {showAddModal && (
        <AddCarModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => { setShowAddModal(false); setPage(1); setDebouncedQ(''); setQ(''); }}
          onOpenCatalog={() => setShowCatalogModal(true)}
          refreshSignal={catalogRefresh}
        />
      )}
      {showCatalogModal && (
        <AddCatalogModal
          onClose={() => { setShowCatalogModal(false); setCatalogRefresh(n => n + 1); }}
        />
      )}
      {editingCar && (
        <EditCarModal
          car={editingCar}
          onClose={() => setEditingCar(null)}
          onSaved={updated => {
            setCars(prev => prev.map(c => c.id === updated.id ? updated : c));
            setEditingCar(null);
          }}
          onOpenCatalog={() => setShowCatalogModal(true)}
          refreshSignal={catalogRefresh}
        />
      )}
      {deletingCar && (
        <DeleteConfirmModal
          car={deletingCar}
          onClose={() => setDeletingCar(null)}
          onDeleted={() => {
            setCars(prev => prev.filter(c => c.id !== deletingCar.id));
            setTotal(t => t - 1);
            setDeletingCar(null);
          }}
        />
      )}
    </>
  );
};

export default CarsPage;
