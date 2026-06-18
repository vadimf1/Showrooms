import { useState } from 'react';

const IClose = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

type Props = {
  itemName: string;
  onSubmit: (rating: number, description: string) => Promise<void>;
  onClose: () => void;
};

export default function ReviewModal({ itemName, onSubmit, onClose }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const active = hover || rating;
  const canSubmit = rating > 0 && text.trim().length >= 3 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit(rating, text.trim());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rv-modal-overlay" onClick={onClose}>
      <div className="rv-modal-card" onClick={e => e.stopPropagation()}>
        <div className="rv-modal-head">
          <h3>Оставить отзыв</h3>
          <button className="rv-modal-close acc-btn" onClick={onClose}><IClose /></button>
        </div>

        <div className="rv-modal-item-name">{itemName}</div>

        <div>
          <div className="rv-label">Оценка</div>
          <div className="rv-stars-row">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                className={'rv-star-btn' + (n <= active ? ' lit' : '')}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
              >★</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div className="rv-label">Комментарий</div>
          <textarea
            className="rv-textarea"
            placeholder="Поделитесь впечатлениями об автомобиле и обслуживании…"
            value={text}
            onChange={e => setText(e.target.value)}
          />
        </div>

        <button
          className="acc-btn acc-btn-primary acc-btn-block"
          style={{ opacity: canSubmit ? 1 : 0.45, cursor: canSubmit ? 'pointer' : 'default' }}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {submitting ? 'Публикуем…' : 'Опубликовать отзыв'}
        </button>
      </div>
    </div>
  );
}
