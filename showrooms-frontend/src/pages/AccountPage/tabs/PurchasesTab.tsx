import { useState, useEffect } from 'react';
import { getPurchases } from '../../../features/account/api/account.api';
import type { PurchaseItem } from '../../../features/account/model/account.types';
import { formatPrice } from '../../../shared/utils/formatPrice';
import { createReview, getMyReviews } from '../../../features/reviews/api/reviews.api';
import type { ReviewData } from '../../../features/reviews/model/review.types';
import ReviewModal from '../../../features/reviews/components/ReviewModal';
import { IKey, IStar, IChk } from '../../../shared/ui/icons';
import { formatDate } from '../../../shared/utils/format';

type ModalTarget = { carModelId: string; carName: string };

export default function PurchasesTab() {
  const [items, setItems]       = useState<PurchaseItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [reviews, setReviews]   = useState<Record<string, ReviewData>>({});
  const [modalFor, setModalFor] = useState<ModalTarget | null>(null);

  useEffect(() => {
    Promise.all([
      getPurchases().catch(() => [] as PurchaseItem[]),
      getMyReviews().catch(() => ({ car_model: {}, test_drive: {} })),
    ]).then(([purchases, myReviews]) => {
      setItems(purchases);
      setReviews(myReviews.car_model);
    }).finally(() => setLoading(false));
  }, []);

  const handleReviewSubmit = async (rating: number, description: string) => {
    if (!modalFor) return;
    const data = await createReview('car_model', modalFor.carModelId, rating, description);
    setReviews(prev => ({ ...prev, [modalFor.carModelId]: data }));
    setModalFor(null);
  };

  if (loading) return <div className="page-header"><div><h1>Покупки</h1></div></div>;

  return (
    <>
      {modalFor && (
        <ReviewModal itemName={modalFor.carName} onSubmit={handleReviewSubmit} onClose={() => setModalFor(null)} />
      )}

      <div className="page-header">
        <div>
          <h1>Покупки</h1>
          <p>Все приобретённые автомобили с историей сделок.</p>
        </div>
        <div className="page-actions">
          <span style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace' }}>
            {items.length} авто
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="acc-empty">
          <div className="acc-empty-art"><IKey /></div>
          <h3>Здесь будут ваши покупки</h3>
          <p>После завершения сделки автомобиль появится в этом разделе вместе с документами и историей обслуживания.</p>
        </div>
      ) : (
        <div className="purchases">
          {items.map(p => {
            const reviewed = !!p.car_model_id && !!reviews[p.car_model_id];
            return (
              <div key={p.id} className="purchase-card">
                <div className="purchase-photo">
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 10px, rgba(17,17,17,.025) 10px 11px)' }} />
                  {p.color_name && (
                    <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(255,255,255,.85)', border: '1px solid var(--line)', borderRadius: 6, padding: '3px 7px', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--muted)' }}>
                      {p.color_name.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="purchase-info">
                  <div className="nm">{p.car_name}</div>
                  <div className="sub">{p.year ? `${p.year} · ` : ''}{p.color_name}</div>
                  <div className="purchase-grid">
                    {p.vin && <div><div className="k">VIN</div><div className="v mono">{p.vin}</div></div>}
                    <div><div className="k">Дата покупки</div><div className="v">{formatDate(p.sale_date)}</div></div>
                    {p.dealer_name && <div><div className="k">Менеджер</div><div className="v">{p.dealer_name}</div></div>}
                  </div>
                </div>
                <div className="purchase-side">
                  <span className="pill pill-success">Сделка закрыта</span>
                  <div className="price">{formatPrice(p.final_price)}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.showroom_name}</div>
                  <button className="acc-btn acc-btn-outline acc-btn-sm" style={{ marginTop: 4 }}>Документы</button>
                  {p.car_model_id && (
                    reviewed
                      ? <span className="rv-done-badge" style={{ marginTop: 6 }}><IChk /> Отзыв оставлен</span>
                      : <button className="acc-btn acc-btn-outline acc-btn-sm" style={{ marginTop: 4 }} onClick={() => setModalFor({ carModelId: p.car_model_id!, carName: p.car_name })}><IStar /> Отзыв</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
