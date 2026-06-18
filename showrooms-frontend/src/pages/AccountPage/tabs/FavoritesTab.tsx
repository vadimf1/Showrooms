import { useState, useEffect } from 'react';
import { getFavorites, removeFavorite } from '../../../features/account/api/account.api';
import type { FavoriteItem } from '../../../features/account/model/account.types';
import CarCard from '../../../features/cars/components/CarCard';
import type { Car } from '../../../features/cars/model/car.types';
import { IHeart, IArrow } from '../../../shared/ui/icons';
import { autoWord } from '../../../shared/utils/pluralize';

type Props = { onOpenCar?: (id: string) => void };

const toCarCard = (item: FavoriteItem): Car => ({
  id: item.car_model_id,
  car_id: item.car_model_id,
  make: item.make,
  model: item.model,
  price_from: item.price_from ?? '0',
  dealer: null,
  showroom: null,
  images: item.images,
});

export default function FavoritesTab({ onOpenCar }: Props) {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFavorites()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (id: string) => {
    setItems(p => p.filter(x => x.car_model_id !== id));
    try { await removeFavorite(id); } catch {}
  };

  if (loading) return <div className="page-header"><div><h1>Избранное</h1></div></div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Избранное</h1>
          <p>Сохранённые автомобили — вернитесь к ним в любой момент.</p>
        </div>
        <div className="page-actions">
          <span style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace' }}>
            {items.length} {autoWord(items.length)}
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="acc-empty">
          <div className="acc-empty-art"><IHeart /></div>
          <h3>Нет избранных авто</h3>
          <p>Откройте каталог и нажмите на иконку сердца, чтобы добавить машину в избранное.</p>
          <button className="acc-btn acc-btn-outline acc-btn-sm" style={{ marginTop: 8 }}>
            <IArrow /> В каталог
          </button>
        </div>
      ) : (
        <div className="fav-grid">
          {items.map(item => (
            <CarCard
              key={item.car_model_id}
              car={toCarCard(item)}
              fav={true}
              onFav={() => remove(item.car_model_id)}
              onOpen={() => onOpenCar?.(item.car_model_id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
