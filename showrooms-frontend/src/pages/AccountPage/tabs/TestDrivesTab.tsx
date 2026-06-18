import { useState, useEffect } from 'react';
import { getTestDrives, cancelTestDrive } from '../../../features/account/api/account.api';
import type { TestDriveItem } from '../../../features/account/model/account.types';
import type { CarInitialConfig } from '../../../features/cars/model/car.types';
import { createReview, getMyReviews } from '../../../features/reviews/api/reviews.api';
import type { ReviewData } from '../../../features/reviews/model/review.types';
import ReviewModal from '../../../features/reviews/components/ReviewModal';
import { ICal, IClose, IStar, IChk } from '../../../shared/ui/icons';
import { formatDate } from '../../../shared/utils/format';

const STATUS = {
  PENDING:   { label: 'Ожидает',     cls: 'pill-warn' },
  CONFIRMED: { label: 'Подтверждён', cls: 'pill-info' },
  COMPLETED: { label: 'Завершён',    cls: 'pill-success' },
  CANCELLED: { label: 'Отменён',     cls: 'pill-neutral' },
};

type Props = { onOpenCar?: (id: string, config?: CarInitialConfig) => void };

export default function TestDrivesTab({ onOpenCar }: Props) {
  const [items, setItems]               = useState<TestDriveItem[]>([]);
  const [loading, setLoading]           = useState(true);
  const [cancelTarget, setCancelTarget] = useState<TestDriveItem | null>(null);
  const [cancelling, setCancelling]     = useState(false);
  const [reviews, setReviews]           = useState<Record<string, ReviewData>>({});
  const [modalFor, setModalFor]         = useState<TestDriveItem | null>(null);

  useEffect(() => {
    Promise.all([
      getTestDrives().catch(() => [] as TestDriveItem[]),
      getMyReviews().catch(() => ({ car_model: {}, test_drive: {} })),
    ]).then(([drives, myReviews]) => {
      setItems(drives);
      setReviews(myReviews.test_drive);
    }).finally(() => setLoading(false));
  }, []);

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelTestDrive(cancelTarget.id);
      setItems(prev => prev.map(t => t.id === cancelTarget.id ? { ...t, status: 'CANCELLED' } : t));
      setCancelTarget(null);
    } catch {} finally {
      setCancelling(false);
    }
  };

  const handleReviewSubmit = async (rating: number, description: string) => {
    if (!modalFor) return;
    const data = await createReview('test_drive', modalFor.id, rating, description);
    setReviews(prev => ({ ...prev, [modalFor.id]: data }));
    setModalFor(null);
  };

  if (loading) return <div className="page-header"><div><h1>Тест-драйвы</h1></div></div>;

  return (
    <>
      {modalFor && (
        <ReviewModal itemName={modalFor.car_model_info} onSubmit={handleReviewSubmit} onClose={() => setModalFor(null)} />
      )}

      <div className="page-header">
        <div>
          <h1>Тест-драйвы</h1>
          <p>Ваши запросы и подтверждённые записи в шоурумах AutoHub.</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="acc-empty">
          <div className="acc-empty-art"><ICal /></div>
          <h3>Тест-драйвов пока нет</h3>
          <p>Выберите автомобиль в каталоге и оставьте заявку — менеджер шоурума свяжется с вами для подтверждения времени.</p>
        </div>
      ) : (
        <div className="timeline">
          {items.map(t => {
            const s = STATUS[t.status] ?? STATUS.PENDING;
            const colorHex = t.color_hex || '#c8c8cc';
            const reviewed = !!reviews[t.id];
            return (
              <div
                key={t.id}
                className={'td-card' + (t.car_model_id && onOpenCar ? ' td-card-clickable' : '')}
                onClick={() => {
                  if (t.car_model_id && onOpenCar) {
                    onOpenCar(t.car_model_id, {
                      body:  t.body_style,
                      hp:    t.engine_hp,
                      fuel:  t.fuel_type,
                      trans: t.transmission_type,
                      drive: t.drive_type,
                      colorHex:  t.color_hex || undefined,
                      colorName: t.color_name || undefined,
                    });
                  }
                }}
              >
                <div className="td-color" style={{ background: colorHex }} />
                <div className="td-info">
                  <div className="name">{t.car_model_info}</div>
                  {t.color_name && <div className="color-name">{t.color_name}</div>}
                  <div className="row">
                    <span>
                      <span className="k">Шоурум</span>
                      <span className="v">{t.showroom_name}{t.city ? `, ${t.city}` : ''}</span>
                    </span>
                    {t.preferred_date && t.preferred_date !== 'None' && (
                      <span>
                        <span className="k">Дата</span>
                        <span className="v mono">{formatDate(t.preferred_date)}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="td-meta-right">
                  <span className={'pill ' + s.cls}>{s.label}</span>
                  {t.status === 'PENDING' && (
                    <button className="acc-btn acc-btn-danger acc-btn-sm" onClick={e => { e.stopPropagation(); setCancelTarget(t); }}>
                      Отменить
                    </button>
                  )}
                  {t.status === 'COMPLETED' && (
                    reviewed
                      ? <span className="rv-done-badge"><IChk /> Отзыв оставлен</span>
                      : <button className="acc-btn acc-btn-outline acc-btn-sm" onClick={e => { e.stopPropagation(); setModalFor(t); }}><IStar /> Отзыв</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {cancelTarget && (
        <div className="tg-modal-overlay" onClick={() => setCancelTarget(null)}>
          <div className="tg-modal" onClick={e => e.stopPropagation()}>
            <div className="tg-modal-head">
              <div className="tg-modal-title">Отменить тест-драйв</div>
              <button className="tg-modal-close" onClick={() => setCancelTarget(null)}><IClose /></button>
            </div>
            <div className="tg-modal-body">
              <p>Отменить заявку на тест-драйв <strong>{cancelTarget.car_model_info}</strong>?</p>
              <div className="tg-modal-actions">
                <button className="acc-btn acc-btn-danger acc-btn-sm" onClick={handleCancelConfirm} disabled={cancelling}>
                  {cancelling ? 'Отменяем…' : 'Да, отменить'}
                </button>
                <button className="acc-btn acc-btn-ghost acc-btn-sm" onClick={() => setCancelTarget(null)}>Назад</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
