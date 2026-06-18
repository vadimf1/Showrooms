import { Car } from "../model/car.types";
import { formatPrice } from "../../../shared/utils/formatPrice";

type Props = { car: Car; onOpen: () => void; fav: boolean; onFav: () => void };

const CityIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
    <path d="M3 21h18"/><path d="M5 21V10l5-3v14"/><path d="M14 21V6l6 3v12"/>
    <path d="M7 14v.01M7 17v.01M16 12v.01M16 15v.01M16 18v.01"/>
  </svg>
);
const Arrow = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M5 12h14M13 6l6 6-6 6"/>
  </svg>
);
const Heart = ({ filled }: { filled: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
    <path d="M12 21s-7-4.5-9.5-9C.5 7.5 4 3 8 4.5 10 5 12 7 12 7s2-2 4-2.5c4-1.5 7.5 3 5.5 7.5C19 16.5 12 21 12 21Z"/>
  </svg>
);
const CarSilhouette = () => (
  <svg viewBox="0 0 200 80" preserveAspectRatio="xMidYMid meet" style={{ width: "54%", opacity: 0.18 }}>
    <path d="M14 60C14 60,22 44,38 42L70 38C80 30,100 26,120 28L148 32C162 34,176 42,186 48L186 60Z" fill="currentColor"/>
    <circle cx="52" cy="62" r="10" fill="transparent" stroke="currentColor" strokeWidth="3"/>
    <circle cx="150" cy="62" r="10" fill="transparent" stroke="currentColor" strokeWidth="3"/>
  </svg>
);

const formatPriceFrom = (p: string) => "от " + formatPrice(p);

const citiesCount = (id: string) => {
  const sum = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return (sum % 6) + 2;
};
const cityWord = (n: number) =>
  n % 10 === 1 && n % 100 !== 11 ? "город"
  : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? "города"
  : "городов";

const CarCard = ({ car, onOpen, fav, onFav }: Props) => {
  const photo = car.images?.[0];
  const n = citiesCount(car.id);

  return (
    <article className="card" onClick={onOpen}>
      <div className="card-photo">
        {photo
          ? <img src={photo.image} alt={`${car.make} ${car.model}`} />
          : (
            <div className="card-ph">
              <CarSilhouette />
              <span className="card-ph-label">Фото скоро появится</span>
            </div>
          )
        }
        <div className="ph-label">{car.make} · {car.model}</div>
        <button
          className={`card-fav ${fav ? "active" : ""}`}
          onClick={e => { e.stopPropagation(); onFav(); }}
        >
          <Heart filled={fav} />
        </button>
      </div>
      <div className="card-body">
        <div className="card-title">{car.make}</div>
        <div className="card-sub">{car.model}</div>
        <div className="card-price">{formatPriceFrom(car.price_from)}</div>
        <div className="card-foot">
          <span className="cities-line">
            <CityIcon />
            <b>{n}</b>&nbsp;{cityWord(n)}
          </span>
          <span className="card-link">Подробнее <Arrow /></span>
        </div>
      </div>
    </article>
  );
};

export default CarCard;
