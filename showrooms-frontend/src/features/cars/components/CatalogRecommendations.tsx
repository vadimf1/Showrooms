import { useEffect, useRef, useState } from "react";
import { Car } from "../model/car.types";
import { getCatalogRecommendations } from "../api/cars.api";
import { formatPrice } from "../../../shared/utils/formatPrice";

const HISTORY_KEY = "autohub_history";

type Props = {
  favs: Set<string>;
  onFav: (id: string) => void;
  onOpen: (car: Car) => void;
};

const CarSilhouette = () => (
  <svg viewBox="0 0 200 80" preserveAspectRatio="xMidYMid meet" style={{ width: "54%", opacity: 0.18 }}>
    <path d="M14 60C14 60,22 44,38 42L70 38C80 30,100 26,120 28L148 32C162 34,176 42,186 48L186 60Z" fill="currentColor"/>
    <circle cx="52" cy="62" r="10" fill="transparent" stroke="currentColor" strokeWidth="3"/>
    <circle cx="150" cy="62" r="10" fill="transparent" stroke="currentColor" strokeWidth="3"/>
  </svg>
);

const Heart = ({ filled }: { filled: boolean }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
    <path d="M12 21s-7-4.5-9.5-9C.5 7.5 4 3 8 4.5 10 5 12 7 12 7s2-2 4-2.5c4-1.5 7.5 3 5.5 7.5C19 16.5 12 21 12 21Z"/>
  </svg>
);

const ChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
);

const ChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);

const CatalogRecommendations = ({ favs, onFav, onOpen }: Props) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const history: string[] = (() => {
      try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]"); }
      catch { return []; }
    })();

    const favIds = [...favs].slice(0, 3);
    const combined = [...new Set([...history.slice(0, 3), ...favIds])].slice(0, 6);

    if (combined.length === 0) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    getCatalogRecommendations(combined)
      .then(data => { if (!cancelled) { setCars(data); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const scroll = (dir: -1 | 1) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  if (loading || cars.length === 0) return null;

  return (
    <section className="rec-section">
      <div className="rec-header">
        <h2 className="rec-title">Рекомендуем вам</h2>
        <div className="rec-nav">
          <button className="rec-arrow" onClick={() => scroll(-1)}><ChevronLeft /></button>
          <button className="rec-arrow" onClick={() => scroll(1)}><ChevronRight /></button>
        </div>
      </div>
      <div className="rec-track" ref={trackRef}>
        {cars.map(car => {
          const photo = car.images?.[0];
          return (
            <article key={car.id} className="rec-card" onClick={() => onOpen(car)}>
              <div className="rec-card-photo">
                {photo
                  ? <img src={photo.image} alt={`${car.make} ${car.model}`} />
                  : <div className="card-ph"><CarSilhouette /></div>
                }
                <button
                  className={`card-fav ${favs.has(car.id) ? "active" : ""}`}
                  onClick={e => { e.stopPropagation(); onFav(car.id); }}
                >
                  <Heart filled={favs.has(car.id)} />
                </button>
              </div>
              <div className="rec-card-body">
                <div className="rec-card-make">{car.make}</div>
                <div className="rec-card-model">{car.model}</div>
                <div className="rec-card-price">от {formatPrice(car.price_from)}</div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default CatalogRecommendations;
