import { useEffect, useRef, useState } from 'react';
import { fmtMoney } from '../../shared/utils/money';
import { getEmployees } from '../../features/employees/api/employees.api';
import { EmployeeFull } from '../../features/employees/model/employee.types';
import EmployeeFormModal from '../../features/employees/components/EmployeeFormModal';
import DeleteEmployeeConfirmModal from '../../features/employees/components/DeleteEmployeeConfirmModal';

const ISearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
const IEdit   = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 3.5a2.1 2.1 0 113 3L7 19l-4 1 1-4z"/></svg>;
const ITrash  = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6"/></svg>;
const IPlus   = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>;

const PAGE_SIZE = 20;

const ROLE_LABELS: Record<string, string> = {
  EMPLOYEE: 'Сотрудник',
  ADMIN: 'Администратор',
  CLIENT: 'Клиент',
};

const EmployeesPage = () => {
  const [employees, setEmployees]       = useState<EmployeeFull[]>([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState(1);
  const [q, setQ]                       = useState('');
  const [debouncedQ, setDebouncedQ]     = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showAddModal, setShowAddModal]           = useState(false);
  const [editingEmployee, setEditingEmployee]     = useState<EmployeeFull | null>(null);
  const [deletingEmployee, setDeletingEmployee]   = useState<EmployeeFull | null>(null);

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
    getEmployees({ page, search: debouncedQ || undefined })
      .then(d => { setEmployees(d.results); setTotal(d.count); })
      .finally(() => setLoading(false));
  }, [page, debouncedQ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const pageNums = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const set = new Set([1, totalPages, page - 1, page, page + 1].filter(p => p >= 1 && p <= totalPages));
    return [...set].sort((a, b) => a - b);
  })();

  const avatarColor = (id: string) => {
    const hue = (id.charCodeAt(id.length - 1) * 73) % 360;
    return `hsl(${hue} 50% 52%)`;
  };

  const initials = (e: EmployeeFull) =>
    `${e.first_name[0] ?? ''}${e.last_name[0] ?? ''}`.toUpperCase();

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Сотрудники</h1>
          <p>Аккаунты персонала и назначения по шоурумам.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}><IPlus /> Добавить сотрудника</button>
        </div>
      </div>

      <div className="table-toolbar">
        <div className="toolbar-search">
          <ISearch />
          <input
            value={q}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Поиск по имени, логину, должности…"
          />
        </div>
        <div className="toolbar-spacer" />
        <span className="result-count">{total} сотрудников</span>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Сотрудник</th>
              <th>Должность</th>
              <th>Шоурум</th>
              <th>Роль</th>
              <th className="right">Зарплата</th>
              <th className="col-actions" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>Загрузка…</td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>Сотрудников не найдено</td></tr>
            ) : employees.map(e => (
              <tr key={e.id}>
                <td>
                  <div className="car-cell">
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: avatarColor(e.id), color: '#fff',
                      display: 'grid', placeItems: 'center',
                      fontWeight: 700, fontSize: 12, letterSpacing: '0.02em',
                    }}>
                      {initials(e)}
                    </div>
                    <div className="car-info">
                      <span className="car-name">{e.first_name} {e.last_name}</span>
                      <span className="car-trim">{e.username}</span>
                    </div>
                  </div>
                </td>
                <td style={{ color: 'var(--ink-2)' }}>{e.position || '—'}</td>
                <td style={{ color: 'var(--ink-2)' }}>{e.showroom_name || '—'}</td>
                <td>
                  <span className={`badge ${e.role === 'ADMIN' ? 'badge-reserved' : 'badge-available'}`}>
                    {ROLE_LABELS[e.role] ?? e.role}
                  </span>
                </td>
                <td className="num right" style={{ fontWeight: 600, color: 'var(--ink)' }}>
                  {fmtMoney(e.salary)}
                </td>
                <td className="col-actions">
                  <div className="actions-row">
                    <button className="btn-icon-sm" title="Edit" onClick={() => setEditingEmployee(e)}><IEdit /></button>
                    <button className="btn-icon-sm danger" title="Delete" onClick={() => setDeletingEmployee(e)}><ITrash /></button>
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
        <EmployeeFormModal
          onClose={() => setShowAddModal(false)}
          onSaved={created => {
            setEmployees(prev => [created, ...prev]);
            setTotal(t => t + 1);
            setShowAddModal(false);
          }}
        />
      )}
      {editingEmployee && (
        <EmployeeFormModal
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSaved={updated => {
            setEmployees(prev => prev.map(e => e.id === updated.id ? updated : e));
            setEditingEmployee(null);
          }}
        />
      )}
      {deletingEmployee && (
        <DeleteEmployeeConfirmModal
          employee={deletingEmployee}
          onClose={() => setDeletingEmployee(null)}
          onDeleted={() => {
            setEmployees(prev => prev.filter(e => e.id !== deletingEmployee.id));
            setTotal(t => t - 1);
            setDeletingEmployee(null);
          }}
        />
      )}
    </>
  );
};

export default EmployeesPage;
