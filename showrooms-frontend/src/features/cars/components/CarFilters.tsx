import { useState } from "react";
import { CarFilters as ICarFilters } from "../model/car.types";

type Props = { filters: ICarFilters; onApply: (f: ICarFilters) => void };

const MAKES = ["Toyota","BMW","Mercedes","Audi","Ford","Hyundai","Kia","Honda","Nissan","Volkswagen","Mazda","Chevrolet","Dodge","Cadillac","Volvo","Acura","Lexus","Infiniti","Subaru","Jeep","Lincoln","Buick","Chrysler","GMC","Land Rover","Lotus","Mitsubishi","Porsche","Rolls-Royce","FIAT","Bentley","Tesla","Lada","Geely"];
const CITIES = ["Москва","Санкт-Петербург","Казань","Новосибирск","Екатеринбург","Нижний Новгород","Челябинск","Самара","Омск","Ростов-на-Дону","Уфа","Красноярск","Пермь","Воронеж","Волгоград","Краснодар","Сочи","Тюмень","Ижевск","Барнаул"];

const BODIES = [
  { value: "SUV",         label: "Внедорожник" },
  { value: "SEDAN",       label: "Sedan" },
  { value: "HATCHBACK",   label: "Хэтчбек" },
  { value: "COUPE",       label: "Купе" },
  { value: "WAGON",       label: "Универсал" },
  { value: "PICKUP",      label: "Пикап" },
  { value: "CONVERTIBLE", label: "Кабриолет" },
];
const FUELS = [
  { value: "GASOLINE", label: "Бензин" },
  { value: "DIESEL",   label: "Дизель" },
  { value: "ELECTRIC", label: "Электро" },
];
const GEARS = [
  { value: "AUTOMATIC", label: "Автомат" },
  { value: "MANUAL",    label: "Механика" },
  { value: "ROBOT",     label: "Робот" },
];
const DRIVES = [
  { value: "FWD", label: "FWD" },
  { value: "RWD", label: "RWD" },
  { value: "AWD", label: "AWD" },
  { value: "4WD", label: "4WD" },
];
const ORDERING = [
  { value: "price_from",  label: "Сначала дешевле" },
  { value: "-price_from", label: "Сначала дороже" },
  { value: "-year",       label: "Сначала новее" },
  { value: "year",        label: "Сначала старше" },
  { value: "make",        label: "По марке А→Я" },
];

const EMPTY: ICarFilters = {};

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
  </svg>
);

const CarFiltersPanel = ({ filters, onApply }: Props) => {
  const [local, setLocal] = useState<ICarFilters>(filters);
  const set = (k: keyof ICarFilters, v: string | number | undefined) =>
    setLocal(p => ({ ...p, [k]: v }));
  const toggle = (k: keyof ICarFilters, v: string) =>
    setLocal(p => ({ ...p, [k]: p[k] === v ? undefined : v }));

  return (
    <aside className="sidebar">
      {}
      <div className="filter-section" style={{ borderBottom: "none", paddingBottom: 8 }}>
        <div className="search-input">
          <span className="search-icon"><SearchIcon /></span>
          <input
            placeholder="Марка или модель"
            value={local.search ?? ""}
            onChange={e => set("search", e.target.value || undefined)}
          />
        </div>
      </div>

      {}
      <div className="filter-section">
        <div className="filter-label">Местоположение</div>
        <select className="sel" value={local.city ?? ""} onChange={e => set("city", e.target.value || undefined)}>
          <option value="">Все города</option>
          {CITIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {}
      <div className="filter-section">
        <div className="filter-label">Марка</div>
        <select className="sel" value={local.make ?? ""} onChange={e => set("make", e.target.value || undefined)}>
          <option value="">Все марки</option>
          {MAKES.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>

      {}
      <div className="filter-section">
        <div className="filter-label">Тип кузова</div>
        <div className="chips">
          {BODIES.map(b => (
            <button key={b.value} className={`chip ${local.vehicle_style === b.value ? "active" : ""}`}
              onClick={() => toggle("vehicle_style", b.value)}>
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {}
      <div className="filter-section">
        <div className="filter-label">Цена, ₽</div>
        <div className="range-inputs">
          <div className="num-input">
            <span className="nlabel">от</span>
            <input value={local.price_min ?? ""} type="number" placeholder="0"
              onChange={e => set("price_min", e.target.value ? Number(e.target.value) : undefined)} />
            <span className="suffix">₽</span>
          </div>
          <div className="num-input">
            <span className="nlabel">до</span>
            <input value={local.price_max ?? ""} type="number" placeholder="∞"
              onChange={e => set("price_max", e.target.value ? Number(e.target.value) : undefined)} />
            <span className="suffix">₽</span>
          </div>
        </div>
      </div>

      {}
      <div className="filter-section">
        <div className="filter-label">Год выпуска</div>
        <div className="range-inputs">
          <div className="num-input">
            <span className="nlabel">от</span>
            <input value={local.year_min ?? ""} type="number" placeholder="1990"
              onChange={e => set("year_min", e.target.value ? Number(e.target.value) : undefined)} />
          </div>
          <div className="num-input">
            <span className="nlabel">до</span>
            <input value={local.year_max ?? ""} type="number" placeholder="2025"
              onChange={e => set("year_max", e.target.value ? Number(e.target.value) : undefined)} />
          </div>
        </div>
      </div>

      {}
      <div className="filter-section">
        <div className="filter-label">Тип топлива</div>
        <div className="chips">
          {FUELS.map(f => (
            <button key={f.value} className={`chip ${local.engine_fuel_type === f.value ? "active" : ""}`}
              onClick={() => toggle("engine_fuel_type", f.value)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {}
      <div className="filter-section">
        <div className="filter-label">Коробка передач</div>
        <div className="chips">
          {GEARS.map(g => (
            <button key={g.value} className={`chip ${local.transmission_type === g.value ? "active" : ""}`}
              onClick={() => toggle("transmission_type", g.value)}>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {}
      <div className="filter-section">
        <div className="filter-label">Привод</div>
        <div className="chips">
          {DRIVES.map(d => (
            <button key={d.value} className={`chip ${local.driven_wheels === d.value ? "active" : ""}`}
              onClick={() => toggle("driven_wheels", d.value)}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {}
      <div className="filter-section">
        <div className="filter-label">Сортировка</div>
        <select className="sel" value={local.ordering ?? ""} onChange={e => set("ordering", e.target.value || undefined)}>
          <option value="">По умолчанию</option>
          {ORDERING.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="filter-actions">
        <button className="btn btn-dark btn-block" onClick={() => onApply(local)}>
          Применить фильтры
        </button>
        <button className="reset-link" onClick={() => { setLocal(EMPTY); onApply(EMPTY); }}>
          Сбросить всё
        </button>
      </div>
    </aside>
  );
};

export default CarFiltersPanel;
