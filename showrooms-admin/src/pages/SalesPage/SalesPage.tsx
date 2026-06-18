import { useEffect, useRef, useState } from 'react';
import { getSales, deleteSale } from '../../features/sales/api/sales.api';
import { SaleList, PaymentMethod } from '../../features/sales/model/sale.types';
import NewSaleModal from '../../features/sales/components/NewSaleModal';
import { fmtMoney } from '../../shared/utils/money';

const ISearch   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
const IPlus     = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>;
const ITrash    = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6"/></svg>;
const IRuble    = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 4h5a4 4 0 010 8H8v9M5 12h9M5 16h9"/></svg>;
const IReceipt  = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4v16l2-1 2 1 2-1 2 1 2-1 2 1 2-1V4"/><path d="M8 9h8M8 13h6"/></svg>;
const ITrend    = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 6-7"/></svg>;

const PAY_LABELS: Record<PaymentMethod, string> = { cash: 'Наличные', credit: 'Кредит', tradein: 'Трейд-ин' };
const PAGE_SIZE = 20;

function formatDate(d: string) {
  return d.split('-').reverse().join('.');
}

export default function SalesPage() {
  const [sales, setSales]       = useState<SaleList[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [q, setQ]               = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SaleList | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleSearch = (val: string) => {
    setQ(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQ(val);
      setPage(1);
    }, 350);
  };

  const load = () => {
    setLoading(true);
    getSales({ page, search: debouncedQ || undefined, page_size: PAGE_SIZE })
      .then(d => { setSales(d.results); setTotal(d.count); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, debouncedQ]);

  const handleCreated = (sale: SaleList) => {
    setSales(prev => [sale, ...prev]);
    setTotal(t => t + 1);
  };

  const handleDelete = async (id: string) => {
    await deleteSale(id);
    setSales(prev => prev.filter(s => s.id !== id));
    setTotal(t => t - 1);
    setDeleteTarget(null);
  };

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.final_price), 0);
  const avgPrice = sales.length ? totalRevenue / sales.length : 0;

  const pageNums: (number | '…')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNums.push(i);
  } else {
    pageNums.push(1);
    if (page > 3) pageNums.push('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pageNums.push(i);
    if (page < totalPages - 2) pageNums.push('…');
    pageNums.push(totalPages);
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Продажи</h1>
          <p>Все закрытые сделки по сети.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><IPlus /> Новая продажа</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card s-blue">
          <div className="stat-head">
            <div className="stat-label">Общая выручка</div>
            <div className="stat-icon"><IRuble /></div>
          </div>
          <div className="stat-value">{fmtMoney(totalRevenue)}</div>
          <div className="stat-sub">
            <span>за этот месяц</span>
          </div>
        </div>
        <div className="stat-card s-green">
          <div className="stat-head">
            <div className="stat-label">Продажи</div>
            <div className="stat-icon"><IReceipt /></div>
          </div>
          <div className="stat-value">{total}</div>
          <div className="stat-sub">
            <span>за этот месяц</span>
          </div>
        </div>
        <div className="stat-card s-amber">
          <div className="stat-head">
            <div className="stat-label">Средний чек</div>
            <div className="stat-icon"><ITrend /></div>
          </div>
          <div className="stat-value">{fmtMoney(Math.round(avgPrice))}</div>
          <div className="stat-sub">
            <span>за этот месяц</span>
          </div>
        </div>
      </div>

      <div className="table-toolbar">
        <div className="toolbar-search">
          <ISearch />
          <input
            value={q}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Поиск клиента, авто, VIN…"
          />
        </div>
        <div className="toolbar-spacer" />
        <span className="result-count">{total} продаж</span>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Автомобиль</th>
              <th>Клиент</th>
              <th>Шоурум</th>
              <th>Сотрудник</th>
              <th>Дата</th>
              <th className="right">Цена</th>
              <th>Оплата</th>
              <th className="col-actions">Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>Загрузка…</td></tr>
              : sales.length === 0
              ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>Продаж пока нет</td></tr>
              : sales.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="car-cell">
                      <div className="car-swatch" style={{ background: s.car_hex }} />
                      <div className="car-info">
                        <span className="car-name">{s.car_name}</span>
                        <span className="car-trim">{s.car_trim} · {s.car_year}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="client-name">{s.client_name}</span></td>
                  <td>
                    <div className="showroom-cell">
                      <div className="sr-name">{s.showroom_name}</div>
                      <div className="sr-city">{s.showroom_city}</div>
                    </div>
                  </td>
                  <td>
                    {s.employee_name
                      ? (
                        <span className="emp-cell">
                          <span className={'av ' + s.employee_grad}>{s.employee_initials}</span>
                          <span>{s.employee_name}</span>
                        </span>
                      )
                      : <span style={{ color: 'var(--muted-2)' }}>—</span>
                    }
                  </td>
                  <td className="num" style={{ color: 'var(--muted)' }}>{formatDate(s.sale_date)}</td>
                  <td className="right">
                    <span className="price-cell">
                      {fmtMoney(s.final_price)}
                    </span>
                  </td>
                  <td><span className={'badge badge-' + s.payment_method}>{PAY_LABELS[s.payment_method]}</span></td>
                  <td className="col-actions">
                    <div className="td-actions">
                      <button
                        className="btn-icon-sm danger"
                        title="Delete"
                        onClick={() => setDeleteTarget(s)}
                      >
                        <ITrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>

        {total > PAGE_SIZE && (
          <div className="pagination">
            <span>Показано {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} из {total} сделок</span>
            <div className="pg-controls">
              <button className="pg-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
              {pageNums.map((n, i) =>
                n === '…'
                  ? <span key={`sep-${i}`} style={{ padding: '0 4px', color: 'var(--muted)' }}>…</span>
                  : <button key={n} className={'pg-btn' + (page === n ? ' active' : '')} onClick={() => setPage(n as number)}>{n}</button>
              )}
              <button className="pg-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          </div>
        )}
      </div>

      {showModal && <NewSaleModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}

      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div>
                <h2>Удалить продажу?</h2>
                <div className="modal-sub">{deleteTarget.car_name} · {deleteTarget.client_name}</div>
              </div>
            </div>
            <div className="modal-body" style={{ padding: '16px 24px' }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
                Это действие необратимо. Запись о продаже будет удалена безвозвратно.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Отмена</button>
              <button
                className="btn btn-primary"
                style={{ background: 'var(--danger)' }}
                onClick={() => handleDelete(deleteTarget.id)}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
