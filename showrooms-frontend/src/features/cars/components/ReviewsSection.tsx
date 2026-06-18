import { useState } from 'react';
import type { CarReview, CarReviewsResponse } from '../model/car.types';
import { formatDate } from '../../../shared/utils/format';
import { reviewWord } from '../../../shared/utils/pluralize';
import { IChevDown } from '../../../shared/ui/icons';

function StarRow({ rating, size }: { rating: number; size: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} style={{ fontSize: size, color: n <= Math.round(rating) ? '#f59e0b' : '#d1d5db', lineHeight: 1 }}>★</span>
      ))}
    </div>
  );
}

export default function ReviewsSection({ data }: { data: CarReviewsResponse }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? data.results : data.results.slice(0, 5);

  return (
    <section className="d-section">
      <div className="d-section-h">
        <div>
          <h2>
            Отзывы
            <span style={{ fontWeight: 500, color: 'var(--muted)', fontSize: 16, letterSpacing: '-0.01em', marginLeft: 6 }}>
              · {data.count}
            </span>
          </h2>
          <div className="d-section-sub">Реальные отзывы покупателей и участников тест-драйвов</div>
        </div>
      </div>

      <div className="reviews-summary">
        <div className="reviews-score-big">{data.avg_rating.toFixed(1)}</div>
        <div className="reviews-score-right">
          <StarRow rating={data.avg_rating} size={20} />
          <div className="reviews-count-text">{data.count} {reviewWord(data.count)}</div>
        </div>
      </div>

      <div className="reviews-list">
        {visible.map((r: CarReview) => (
          <div key={r.id} className="review-card">
            <div className="review-top">
              <div className="review-author-block">
                <div className="review-avatar">{r.initials}</div>
                <div className="review-author-name">{r.author}</div>
              </div>
              <div className="review-meta-right">
                <StarRow rating={r.rating} size={14} />
                <div className="review-date">{formatDate(r.created_at)}</div>
              </div>
            </div>
            <div className="review-body">{r.description}</div>
          </div>
        ))}
      </div>

      {!showAll && data.results.length > 5 && (
        <button className="review-show-more" onClick={() => setShowAll(true)}>
          <IChevDown /> Показать ещё
        </button>
      )}
    </section>
  );
}
