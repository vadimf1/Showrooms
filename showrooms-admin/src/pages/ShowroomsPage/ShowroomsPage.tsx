import { useEffect, useRef, useState } from 'react';
import { usePermissions } from '../../shared/hooks/usePermissions';
import { getShowrooms } from '../../features/showrooms/api/showrooms.api';
import { ShowroomFull } from '../../features/showrooms/model/showroom.types';
import ShowroomFormModal from '../../features/showrooms/components/ShowroomFormModal';
import DeleteShowroomConfirmModal from '../../features/showrooms/components/DeleteShowroomConfirmModal';

const ISearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
const IEdit   = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 3.5a2.1 2.1 0 113 3L7 19l-4 1 1-4z"/></svg>;
const ITrash  = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6"/></svg>;
const IPlus   = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>;

const PAGE_SIZE = 20;

const ShowroomsPage = () => {
  const { permissions } = usePermissions();
  const [showrooms, setShowrooms] = useState<ShowroomFull[]>([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [q, setQ]                 = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showAddModal, setShowAddModal]       = useState(false);
  const [editingShowroom, setEditingShowroom] = useState<ShowroomFull | null>(null);
  const [deletingShowroom, setDeletingShowroom] = useState<ShowroomFull | null>(null);

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
    getShowrooms({ page, search: debouncedQ || undefined })
      .then(d => { setShowrooms(d.results); setTotal(d.count); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, debouncedQ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const pageNums = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const set = new Set([1, totalPages, page - 1, page, page + 1].filter(p => p >= 1 && p <= totalPages));
    return [...set].sort((a, b) => a - b);
  })();

  const initials = (name: string) =>
    name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Шоурумы</h1>
          <p>Физические точки продаж и их персонал.</p>
        </div>
        <div className="page-actions">
          {permissions.can_manage_showrooms && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}><IPlus /> Добавить шоурум</button>
          )}
        </div>
      </div>

      <div className="table-toolbar">
        <div className="toolbar-search">
          <ISearch />
          <input
            value={q}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Поиск по названию, городу, адресу…"
          />
        </div>
        <div className="toolbar-spacer" />
        <span className="result-count">{total} шоурумов</span>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Шоурум</th>
              <th>Город</th>
              <th>Адрес</th>
              <th className="right">Дилеры</th>
              <th className="right">Авто</th>
              {permissions.can_manage_showrooms && <th className="col-actions" />}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>Загрузка…</td></tr>
            ) : showrooms.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>Ничего не найдено</td></tr>
            ) : showrooms.map(s => (
              <tr key={s.id}>
                <td>
                  <div className="car-cell">
                    <div style={{
                      width: 42, height: 42, borderRadius: 9, flexShrink: 0,
                      background: 'var(--neutral-soft)', color: 'var(--ink-2)',
                      display: 'grid', placeItems: 'center',
                      fontWeight: 700, fontSize: 13, border: '1px solid var(--line)',
                    }}>
                      {initials(s.name)}
                    </div>
                    <div className="car-info">
                      <span className="car-name">{s.name}</span>
                      <span className="car-trim">SHR-{s.id.slice(-3).toUpperCase()}</span>
                    </div>
                  </div>
                </td>
                <td style={{ color: 'var(--ink-2)' }}>{s.address.city}</td>
                <td style={{ color: 'var(--muted)' }}>{s.address.street}</td>
                <td className="num right">{s.dealer_count ?? '—'}</td>
                <td className="num right" style={{ fontWeight: 600, color: 'var(--ink)' }}>{s.car_count ?? '—'}</td>
                {permissions.can_manage_showrooms && (
                  <td className="col-actions">
                    <div className="actions-row">
                      <button className="btn-icon-sm" title="Edit" onClick={() => setEditingShowroom(s)}><IEdit /></button>
                      <button className="btn-icon-sm danger" title="Delete" onClick={() => setDeletingShowroom(s)}><ITrash /></button>
                    </div>
                  </td>
                )}
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
        <ShowroomFormModal
          onClose={() => setShowAddModal(false)}
          onSaved={created => {
            setShowrooms(prev => [created, ...prev]);
            setTotal(t => t + 1);
            setShowAddModal(false);
          }}
        />
      )}
      {editingShowroom && (
        <ShowroomFormModal
          showroom={editingShowroom}
          onClose={() => setEditingShowroom(null)}
          onSaved={updated => {
            setShowrooms(prev => prev.map(s => s.id === updated.id ? updated : s));
            setEditingShowroom(null);
          }}
        />
      )}
      {deletingShowroom && (
        <DeleteShowroomConfirmModal
          showroom={deletingShowroom}
          onClose={() => setDeletingShowroom(null)}
          onDeleted={() => {
            setShowrooms(prev => prev.filter(s => s.id !== deletingShowroom.id));
            setTotal(t => t - 1);
            setDeletingShowroom(null);
          }}
        />
      )}
    </>
  );
};

export default ShowroomsPage;
