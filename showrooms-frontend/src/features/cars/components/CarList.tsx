import { Car, CarFilters as ICarFilters } from "../model/car.types";
import CarCard from "./CarCard";
import CarFiltersPanel from "./CarFilters";
import Pagination from "../../../shared/ui/Pagination";
import useCars from "../hooks/useCars";

type Props = {
  favs: Set<string>;
  onFav: (id: string) => void;
  onOpen: (car: Car) => void;
};

const Spinner = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
      </path>
    </svg>
  </div>
);

const CarList = ({ favs, onFav, onOpen }: Props) => {
  const { cars, page, setPage, total, loading, error, filters, applyFilters } = useCars();

  return (
    <div className="layout">
      <CarFiltersPanel filters={filters} onApply={(f: ICarFilters) => applyFilters(f)} />

      <div className="main">
        <div className="results-bar">
          <span className="results-count">
            {loading ? "Загрузка…" : `${total.toLocaleString("ru-RU")} результатов`}
          </span>
        </div>

        {error && <p style={{ color: "var(--danger)", fontSize: 14, marginBottom: 16 }}>{error}</p>}

        {loading ? (
          <Spinner />
        ) : cars.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#888" }}>
            Автомобили не найдены
          </div>
        ) : (
          <div className="grid">
            {cars.map(car => (
              <CarCard
                key={car.id}
                car={car}
                fav={favs.has(car.id)}
                onFav={() => onFav(car.id)}
                onOpen={() => onOpen(car)}
              />
            ))}
          </div>
        )}

        {total > 0 && !loading && (
          <Pagination page={page} total={total} pageSize={20} onChange={setPage} />
        )}
      </div>
    </div>
  );
};

export default CarList;
