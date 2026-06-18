import { ReactNode, useEffect, useState } from 'react';
import apiClient from '../../shared/api/apiClient';
import { fmtMoney } from '../../shared/utils/money';

const ICheck    = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>;
const ICalendar = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="1.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>;
const IFlag     = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22V4s2-2 6-2 6 2 10 2v12c-4 0-6-2-10-2s-6 2-6 2"/></svg>;
const IBuilding = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01M9 16h.01M15 16h.01"/></svg>;
const IArrowUp  = () => <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>;
const IPlus     = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>;
const IUsers    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0M16 11.5a3 3 0 100-6M21.5 20a5 5 0 00-4.5-5"/></svg>;
const IBuildings = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01M9 16h.01M15 16h.01"/></svg>;
const ICar      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h14M5 17v2a1 1 0 001 1h1a1 1 0 001-1v-2M19 17v2a1 1 0 01-1 1h-1a1 1 0 01-1-1v-2"/><path d="M3 13l1.5-5a2 2 0 012-1.5h11a2 2 0 012 1.5L21 13v4H3v-4z"/><circle cx="7.5" cy="13.5" r="1"/><circle cx="16.5" cy="13.5" r="1"/></svg>;
const ICart     = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2"/><path d="M5 10v8a3 3 0 003 3h8a3 3 0 003-3v-8"/></svg>;

type Stats = {
  total_cars: number;
  available: number;
  reserved: number;
  sold_this_month: number;
  revenue_this_month: number;
  showrooms: number;
  pending_test_drives: number;
};

type ActivityItem = {
  type: 'sale' | 'test_drive';
  status?: string;
  text: string;
  meta: string;
  created_at: string;
};

type StatProps = {
  tone: string; label: string; value: string;
  icon: ReactNode; sub: string; deltaDir?: 'up' | 'flat';
};

const StatCard = ({ tone, label, value, icon, sub, deltaDir }: StatProps) => (
  <div className={`stat-card s-${tone}`}>
    <div className="stat-head">
      <div className="stat-label">{label}</div>
      <div className="stat-icon">{icon}</div>
    </div>
    <div className="stat-value">{value}</div>
    <div className="stat-sub">
      {deltaDir === 'up' && <span className="delta up"><IArrowUp />актуально</span>}
      <span>{sub}</span>
    </div>
  </div>
);

const timeAgo = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)    return 'только что';
  if (diff < 3600)  return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  return `${Math.floor(diff / 86400)} дн назад`;
};

const activityIcon = (item: ActivityItem) => {
  if (item.type === 'sale') return { icon: <ICart />, tone: 'green' };
  const tones: Record<string, string> = { PENDING: 'blue', CONFIRMED: 'amber', COMPLETED: 'green', CANCELLED: 'gray' };
  return { icon: <ICalendar />, tone: tones[item.status ?? ''] ?? 'blue' };
};

type Props = { onNav?: (page: import('../../app/App').AdminPage) => void };

const DashboardPage = ({ onNav }: Props) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/admin/dashboard/')
      .then(r => {
        setStats(r.data.stats);
        setActivity(r.data.recent_activity);
      })
      .finally(() => setLoading(false));
  }, []);

  const availPct = stats ? Math.round((stats.available / (stats.total_cars || 1)) * 100) : 0;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Дашборд</h1>
          <p>Склад и активность по всем шоурумам AutoHub.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          tone="blue" label="Всего авто" icon={<ICar />}
          value={loading ? '—' : String(stats!.total_cars)}
          sub="в инвентаре"
        />
        <StatCard
          tone="green" label="Доступно" icon={<ICheck />}
          value={loading ? '—' : String(stats!.available)}
          sub={loading ? '' : `${availPct}% парка`}
        />
        <StatCard
          tone="amber" label="Зарезервировано" icon={<IFlag />}
          value={loading ? '—' : String(stats!.reserved)}
          sub="ждут клиентов"
        />
        <StatCard
          tone="gray" label="Продано в этом месяце" icon={<ICart />}
          value={loading ? '—' : String(stats!.sold_this_month)}
          sub={loading ? '' : `выручка ${fmtMoney(stats!.revenue_this_month)}`}
        />
        <StatCard
          tone="violet" label="Шоурумы" icon={<IBuilding />}
          value={loading ? '—' : String(stats!.showrooms)}
          sub="активных"
        />
        <StatCard
          tone="rose" label="Ожидают тест-драйва" icon={<ICalendar />}
          value={loading ? '—' : String(stats!.pending_test_drives)}
          sub="новых заявок"
        />
      </div>

      <div className="dash-row">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Последние события</h3>
              <div className="panel-sub">Продажи и заявки на тест-драйв</div>
            </div>
          </div>
          <div className="panel-body">
            {loading && (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
                Загрузка…
              </div>
            )}
            {!loading && activity.length === 0 && (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
                Событий пока нет
              </div>
            )}
            {activity.map((a, i) => {
              const { icon, tone } = activityIcon(a);
              return (
                <div key={i} className="activity">
                  <div className={`a-icon ${tone}`}>{icon}</div>
                  <div className="a-body">
                    <div className="a-text">{a.text}</div>
                    <div className="a-meta">{a.meta ? `${a.meta} · ` : ''}{timeAgo(a.created_at)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Быстрые действия</h3>
              <div className="panel-sub">Частые операции администратора</div>
            </div>
          </div>
          <div className="quick-grid">
            <button className="quick-action" onClick={() => onNav?.('cars')}>
              <div className="qa-icon"><IPlus /></div>
              <div className="qa-title">Добавить авто</div>
              <div className="qa-desc">Создать новую запись</div>
            </button>
            <button className="quick-action" onClick={() => onNav?.('testdrives')}>
              <div className="qa-icon"><ICalendar /></div>
              <div className="qa-title">Тест-драйвы</div>
              <div className="qa-desc">Управление заявками</div>
            </button>
            <button className="quick-action" onClick={() => onNav?.('employees')}>
              <div className="qa-icon"><IUsers /></div>
              <div className="qa-title">Сотрудники</div>
              <div className="qa-desc">Список сотрудников</div>
            </button>
            <button className="quick-action" onClick={() => onNav?.('showrooms')}>
              <div className="qa-icon"><IBuildings /></div>
              <div className="qa-title">Шоурумы</div>
              <div className="qa-desc">Список шоурумов</div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
