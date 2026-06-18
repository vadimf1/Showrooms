import { useEffect, useState, useCallback } from "react";
import { Car, CarFilters } from "../model/car.types";
import { getCarsCatalog } from "../api/cars.api";

const STATE_KEY = "autohub_catalog_state";

const loadSaved = (): { page: number; filters: CarFilters } => {
  try { return JSON.parse(sessionStorage.getItem(STATE_KEY) ?? "{}"); }
  catch { return { page: 1, filters: {} }; }
};

const useCars = () => {
  const saved = loadSaved();
  const [cars, setCars]       = useState<Car[]>([]);
  const [page, setPage]       = useState<number>(saved.page ?? 1);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [filters, setFilters] = useState<CarFilters>(saved.filters ?? {});

  
  useEffect(() => {
    sessionStorage.setItem(STATE_KEY, JSON.stringify({ page, filters }));
  }, [page, filters]);

  const fetchCars = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCarsCatalog(page, filters);
      setCars(data.cars);
      setTotal(data.count);
    } catch {
      setError("Не удалось загрузить автомобили");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchCars(); }, [fetchCars]);

  const applyFilters = (f: CarFilters) => { setFilters(f); setPage(1); };

  return { cars, page, setPage, total, loading, error, filters, applyFilters };
};

export default useCars;
