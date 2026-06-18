import { useEffect, useMemo, useState } from 'react';
import {
  confirmTestDrive,
  getAvailableDates,
  getAvailableEmployees,
  getAvailableSlots,
} from '../api/testDrives.api';
import { AvailableEmployee, TestDriveRequest } from '../model/testDrive.types';

const ICar    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h14M5 13l2-5a2 2 0 0 1 2-1.5h6a2 2 0 0 1 2 1.5l2 5M5 13v4M19 13v4M8 17v1.5M16 17v1.5"/><circle cx="7.5" cy="14.5" r=".5"/><circle cx="16.5" cy="14.5" r=".5"/></svg>;
const IX      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>;
const IXSm    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>;
const IPrev   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const INext   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
const IClock  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
const ICaret  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>;
const ICal    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
const IUser   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
const ISearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;

const MONTHS_RU  = ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
const WEEKDAYS   = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const GRAD       = ['g1', 'g2', 'g3'];

function toISO(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function buildGrid(y: number, m: number): (number | null)[] {
  const startDow = (new Date(y, m, 1).getDay() + 6) % 7;
  const days     = new Date(y, m + 1, 0).getDate();
  const cells: (number | null)[] = Array(startDow).fill(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function fmtDate(iso: string) {
  const [, mm, dd] = iso.split('-');
  return `${parseInt(dd)} ${MONTHS_RU[parseInt(mm) - 1]}`;
}

function initials(e: AvailableEmployee) {
  return (e.first_name[0] ?? '') + (e.last_name[0] ?? '');
}

interface CalProps {
  view: { y: number; m: number };
  setView: React.Dispatch<React.SetStateAction<{ y: number; m: number }>>;
  availSet: Set<string>;
  selected: string | null;
  onSelect: (iso: string) => void;
  todayISO: string;
}

function Calendar({ view, setView, availSet, selected, onSelect, todayISO }: CalProps) {
  const grid    = useMemo(() => buildGrid(view.y, view.m), [view]);
  const [ty, tm] = todayISO.split('-').map(Number);
  const canPrev  = !(view.y === ty && view.m === tm - 1);

  const goPrev = () => {
    if (!canPrev) return;
    setView(v => v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 });
  };
  const goNext = () => {
    setView(v => v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 });
  };

  return (
    <div className="cal">
      <div className="cal-head">
        <div className="cal-title">{MONTHS_RU[view.m]} {view.y}</div>
        <div className="cal-nav">
          <button onClick={goPrev} disabled={!canPrev}><IPrev /></button>
          <button onClick={goNext}><INext /></button>
        </div>
      </div>

      <div className="cal-grid">
        {WEEKDAYS.map((w, i) => (
          <div key={w} className={`cal-wd${i >= 5 ? ' we' : ''}`}>{w}</div>
        ))}
        {grid.map((d, i) => {
          if (d == null) return <div key={i} className="cal-day muted" />;
          const iso   = toISO(view.y, view.m, d);
          const avail = availSet.has(iso);
          const sel   = selected === iso;
          const today = iso === todayISO;
          return (
            <button
              key={i}
              className={`cal-day${avail ? ' avail' : ' unavail'}${sel ? ' selected' : ''}${today ? ' today' : ''}`}
              disabled={!avail}
              onClick={() => onSelect(iso)}
            >
              {d}
            </button>
          );
        })}
      </div>

      <div className="cal-legend">
        <div className="lg"><span className="sw sw-avail" /> доступно</div>
        <div className="lg"><span className="sw sw-today" /> сегодня</div>
        <div className="lg"><span className="sw sw-sel"   /> выбрано</div>
      </div>
    </div>
  );
}

type Props = {
  request: TestDriveRequest;
  onClose: () => void;
  onConfirmed: (updated: TestDriveRequest) => void;
};

export default function ConfirmModal({ request, onClose, onConfirmed }: Props) {
  const todayISO = new Date().toISOString().slice(0, 10);
  const [ty, tm] = todayISO.split('-').map(Number);

  const [calView, setCalView]   = useState({ y: ty, m: tm - 1 });
  const [availSet, setAvailSet] = useState<Set<string>>(new Set());
  const [slots, setSlots]       = useState<string[]>([]);
  const [employees, setEmployees] = useState<AvailableEmployee[]>([]);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedEmp,  setSelectedEmp]  = useState<string | null>(null);
  const [empSearch,    setEmpSearch]    = useState('');

  const [loadingDates, setLoadingDates]   = useState(true);
  const [loadingSlots, setLoadingSlots]   = useState(false);
  const [loadingEmps,  setLoadingEmps]    = useState(false);
  const [saving,       setSaving]         = useState(false);
  const [error,        setError]          = useState('');

  
  useEffect(() => {
    setLoadingDates(true);
    getAvailableDates(request.showroom_id)
      .then(dates => setAvailSet(new Set(dates)))
      .catch(() => setError('Не удалось загрузить даты'))
      .finally(() => setLoadingDates(false));
  }, [request.showroom_id]);

  const handleDateSelect = async (iso: string) => {
    setSelectedDate(iso);
    setSelectedTime('');
    setSelectedEmp(null);
    setSlots([]);
    setEmployees([]);
    setLoadingSlots(true);
    try {
      setSlots(await getAvailableSlots(request.showroom_id, iso));
    } catch {
      setError('Не удалось загрузить слоты');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleTimeSelect = async (t: string) => {
    setSelectedTime(t);
    setSelectedEmp(null);
    setEmployees([]);
    setLoadingEmps(true);
    try {
      setEmployees(await getAvailableEmployees(request.showroom_id, selectedDate!, t));
    } catch {
      setError('Не удалось загрузить сотрудников');
    } finally {
      setLoadingEmps(false);
    }
  };

  const filteredEmps = useMemo(() => {
    const q = empSearch.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(e =>
      `${e.first_name} ${e.last_name}`.toLowerCase().includes(q) ||
      e.position.toLowerCase().includes(q)
    );
  }, [employees, empSearch]);

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime || !selectedEmp) return;
    setSaving(true);
    setError('');
    try {
      const updated = await confirmTestDrive(request.id, {
        preferred_date: selectedDate,
        preferred_time: selectedTime,
        employee_id: selectedEmp,
      });
      onConfirmed(updated);
    } catch {
      setError('Ошибка при подтверждении');
      setSaving(false);
    }
  };

  const canSubmit = Boolean(selectedDate && selectedTime && selectedEmp);
  const timeDisabled = !selectedDate || loadingSlots;
  const empDisabled  = !selectedTime  || loadingEmps;

  const selectedEmpObj = employees.find(e => e.id === selectedEmp);

  return (
    <div className="modal-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal td-modal">

        {}
        <header className="td-head">
          <div className="td-head-icon"><ICar /></div>
          <div className="td-head-text">
            <h2 className="td-head-title">Подтверждение тест-драйва</h2>
            <p className="td-head-sub">
              <span className="td-car">{request.car_model_info}</span>
              <span className="td-dot" />
              <span>{request.customer_name}</span>
            </p>
          </div>
          <button className="td-head-close" onClick={onClose}><IX /></button>
        </header>

        {}
        <div className="td-body">
          {}
          <div className="td-pane">
            <p className="td-pane-label">Дата</p>
            {loadingDates
              ? <div className="td-spin">Загрузка дат…</div>
              : <Calendar
                  view={calView}
                  setView={setCalView}
                  availSet={availSet}
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  todayISO={todayISO}
                />
            }
          </div>

          {}
          <div className="td-pane td-pane-r">
            <p className="td-pane-label">Детали записи</p>

            {}
            <div className={`field${timeDisabled ? ' disabled' : ''}`}>
              <div className="field-label">
                <span>Время</span><span className="req">*</span>
                {selectedDate && !loadingSlots && (
                  <span className="hint">{slots.length} слотов</span>
                )}
              </div>
              <div className="time-select">
                <select
                  value={selectedTime}
                  onChange={e => handleTimeSelect(e.target.value)}
                  disabled={timeDisabled}
                >
                  <option value="" disabled>
                    {loadingSlots ? 'Загрузка…' : selectedDate ? 'Выберите время' : 'Сначала выберите дату'}
                  </option>
                  {slots.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="ic-clock"><IClock /></span>
                <span className="ic-caret"><ICaret /></span>
              </div>
            </div>

            {}
            <div className={`field${empDisabled ? ' disabled' : ''}`} style={{ marginTop: 14 }}>
              <div className="field-label">
                <span>Сотрудник</span><span className="req">*</span>
                {!empDisabled && (
                  <span className="hint">{employees.length} доступны</span>
                )}
              </div>

              <div className="emp-search">
                <input
                  type="text"
                  placeholder={empDisabled ? 'Сначала выберите время' : 'Поиск по имени или должности…'}
                  value={empSearch}
                  onChange={e => setEmpSearch(e.target.value)}
                  disabled={empDisabled}
                />
                <span className="ic-search"><ISearch /></span>
                {empSearch && !empDisabled && (
                  <button className="ic-clear" onClick={() => setEmpSearch('')}><IXSm /></button>
                )}
              </div>

              <div className={`emp-scroll${filteredEmps.length > 3 ? ' fade-bottom' : ''}`}>
                {loadingEmps ? (
                  <div className="td-spin" style={{ padding: '16px 0' }}>Загрузка…</div>
                ) : filteredEmps.length === 0 && !empDisabled ? (
                  <div className="emp-empty">
                    <span className="mk">Ничего не найдено</span>
                    Попробуйте другой запрос
                  </div>
                ) : (
                  <div className="emp-list">
                    {filteredEmps.map((e, i) => {
                      const sel = selectedEmp === e.id;
                      return (
                        <button
                          key={e.id}
                          className={`emp-card${sel ? ' selected' : ''}${empDisabled ? ' disabled' : ''}`}
                          onClick={() => !empDisabled && setSelectedEmp(e.id)}
                          disabled={empDisabled}
                        >
                          <div className={`emp-av ${GRAD[i % 3]}`}>{initials(e)}</div>
                          <div className="emp-meta">
                            <span className="emp-name">{e.first_name} {e.last_name}</span>
                            <span className="emp-role">{e.position}</span>
                          </div>
                          <span className="emp-radio" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {!empDisabled && filteredEmps.length > 0 && (
                <div className="emp-count">
                  <span>{filteredEmps.length === employees.length ? 'Показаны все' : `Найдено: ${filteredEmps.length}`}</span>
                  {filteredEmps.length > 3 && <span>прокрутите для выбора</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {error && <div className="modal-error">{error}</div>}

        {}
        <footer className="td-foot">
          <div className="td-summary">
            <span className={`td-chip${selectedDate ? '' : ' empty'}`}>
              <ICal />{selectedDate ? fmtDate(selectedDate) : 'дата'}
            </span>
            <span className={`td-chip${selectedTime ? '' : ' empty'}`}>
              <IClock />{selectedTime || 'время'}
            </span>
            <span className={`td-chip${selectedEmpObj ? '' : ' empty'}`}>
              <IUser />{selectedEmpObj ? initials(selectedEmpObj) : 'сотрудник'}
            </span>
          </div>
          <div className="td-foot-actions">
            <button className="btn btn-ghost" onClick={onClose}>Отмена</button>
            <button className="btn btn-primary" onClick={handleConfirm} disabled={!canSubmit || saving}>
              {saving ? 'Сохранение…' : 'Подтвердить'}
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
}
