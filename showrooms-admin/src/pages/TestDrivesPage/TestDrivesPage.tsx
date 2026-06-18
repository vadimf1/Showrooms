import { useEffect, useRef, useState } from 'react';
import { getTestDrives, updateTestDriveStatus } from '../../features/test-drives/api/testDrives.api';
import { TestDriveRequest, TestDriveStatus } from '../../features/test-drives/model/testDrive.types';
import ConfirmModal from '../../features/test-drives/components/ConfirmModal';

const ISearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
const ICheck  = () => <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>;
const IX      = () => <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>;

const BADGE: Record<TestDriveStatus, string> = {
  PENDING:   'badge-pending',
  CONFIRMED: 'badge-confirmed',
  COMPLETED: 'badge-completed',
  CANCELLED: 'badge-cancelled',
};
const LABELS: Record<TestDriveStatus, string> = {
  PENDING: 'Ожидает', CONFIRMED: 'Подтверждён', COMPLETED: 'Завершён', CANCELLED: 'Отменён',
};

const PAGE_SIZE = 20;

const TestDrivesPage = () => {
  const [requests, setRequests] = useState<TestDriveRequest[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [statusFilter, setStatusFilter] = useState<TestDriveStatus | 'all'>('all');
  const [q, setQ]               = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [confirmTarget, setConfirmTarget] = useState<TestDriveRequest | null>(null);
  const [actionTarget, setActionTarget] = useState<{ request: TestDriveRequest; next: TestDriveStatus } | null>(null);
  const [actioning, setActioning] = useState(false);

  const handleSearch = (val: string) => {
    setQ(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQ(val);
      setPage(1);
    }, 350);
  };

  const handleStatusChange = (val: TestDriveStatus | 'all') => {
    setStatusFilter(val);
    setPage(1);
  };

  useEffect(() => {
    setLoading(true);
    getTestDrives({
      page,
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: debouncedQ || undefined,
    })
      .then(d => { setRequests(d.results); setTotal(d.count); })
      .finally(() => setLoading(false));
  }, [page, statusFilter, debouncedQ]);

  const handleAction = (request: TestDriveRequest, next: TestDriveStatus) => {
    if (next === 'CONFIRMED') {
      setConfirmTarget(request);
      return;
    }
    setActionTarget({ request, next });
  };

  const handleActionConfirm = async () => {
    if (!actionTarget) return;
    setActioning(true);
    try {
      const updated = await updateTestDriveStatus(actionTarget.request.id, actionTarget.next);
      setRequests(prev => prev.map(r => r.id === updated.id ? updated : r));
      setActionTarget(null);
    } finally {
      setActioning(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const pageNums = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const set = new Set([1, totalPages, page - 1, page, page + 1].filter(p => p >= 1 && p <= totalPages));
    return [...set].sort((a, b) => a - b);
  })();

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Тест-драйвы</h1>
          <p>Записи клиентов и их статусы.</p>
        </div>
        <div className="page-actions">
        </div>
      </div>

      <div className="table-toolbar">
        <div className="toolbar-search">
          <ISearch />
          <input
            value={q}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Поиск клиента, телефона, авто…"
          />
        </div>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={e => handleStatusChange(e.target.value as TestDriveStatus | 'all')}
        >
          <option value="all">Все статусы</option>
          <option value="PENDING">Ожидает</option>
          <option value="CONFIRMED">Подтверждён</option>
          <option value="COMPLETED">Завершён</option>
          <option value="CANCELLED">Отменён</option>
        </select>
        <div className="toolbar-spacer" />
        <span className="result-count">{total} заявок</span>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Автомобиль</th>
              <th>Клиент</th>
              <th>Телефон</th>
              <th>Шоурум</th>
              <th>Дата</th>
              <th>Статус</th>
              <th className="col-actions">Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>Загрузка…</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>Заявок не найдено</td></tr>
            ) : requests.map(r => (
              <tr key={r.id}>
                <td>
                  <div className="car-cell">
                    <div className="car-swatch" style={{ background: r.color_hex || '#888' }} />
                    <div className="car-info">
                      <span className="car-name">{r.car_model_info}</span>
                      <span className="car-trim">{r.color_name}</span>
                    </div>
                  </div>
                </td>
                <td style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.customer_name}</td>
                <td className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{r.customer_phone}</td>
                <td style={{ color: 'var(--ink-2)' }}>{r.showroom_name || '—'}</td>
                <td style={{ color: 'var(--ink-2)' }}>
                  {r.preferred_date
                    ? `${r.preferred_date.split('-').reverse().join('.')}${r.preferred_time ? ' ' + r.preferred_time.slice(0, 5) : ''}`
                    : '—'}
                </td>
                <td><span className={`badge ${BADGE[r.status]}`}>{LABELS[r.status]}</span></td>
                <td className="col-actions">
                  <div className="td-actions">
                    {r.status === 'PENDING' && (
                      <>
                        <button className="btn btn-primary btn-sm" onClick={() => handleAction(r, 'CONFIRMED')}>
                          <ICheck />Подтвердить
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleAction(r, 'CANCELLED')}>
                          <IX />Отменить
                        </button>
                      </>
                    )}
                    {r.status === 'CONFIRMED' && (
                      <>
                        <button className="btn btn-primary btn-sm" onClick={() => handleAction(r, 'COMPLETED')}>
                          <ICheck />Завершить
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleAction(r, 'CANCELLED')}>
                          <IX />Отменить
                        </button>
                      </>
                    )}
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

      {confirmTarget && (
        <ConfirmModal
          request={confirmTarget}
          onClose={() => setConfirmTarget(null)}
          onConfirmed={updated => {
            setRequests(prev => prev.map(r => r.id === updated.id ? updated : r));
            setConfirmTarget(null);
          }}
        />
      )}

      {actionTarget && (
        <div className="modal-overlay" onMouseDown={e => e.target === e.currentTarget && setActionTarget(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="delete-confirm-body">
              <div className={`delete-icon-wrap${actionTarget.next === 'CANCELLED' ? '' : ''}`}
                style={actionTarget.next === 'COMPLETED'
                  ? { background: 'var(--success-soft)', color: 'var(--success)' }
                  : { background: 'var(--danger-soft)', color: 'var(--danger)' }
                }
              >
                {actionTarget.next === 'COMPLETED' ? <ICheck /> : <IX />}
              </div>
              <h3>
                {actionTarget.next === 'COMPLETED' ? 'Завершить тест-драйв?' : 'Отменить тест-драйв?'}
              </h3>
              <p className="delete-desc">{actionTarget.request.car_model_info}</p>
              <p className="delete-vin">{actionTarget.request.customer_name}</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setActionTarget(null)}>Назад</button>
              <button
                className={`btn ${actionTarget.next === 'COMPLETED' ? 'btn-primary' : 'btn-danger-solid'}`}
                onClick={handleActionConfirm}
                disabled={actioning}
              >
                {actioning ? 'Сохранение…' : actionTarget.next === 'COMPLETED' ? 'Завершить' : 'Отменить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TestDrivesPage;
