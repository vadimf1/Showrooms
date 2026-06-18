import { useEffect, useRef, useState } from "react";
import { Car, CarModelDetail, CarReviewsResponse, ConfigurationsResponse, ConfiguratorOption, StockResponse, StockGroup } from "../../features/cars/model/car.types";
import { getCarModelDetail, getCarConfigurations, getCarStock, getCarModelReviews } from "../../features/cars/api/cars.api";
import TestDriveModal from "../../features/cars/components/TestDriveModal";
import RecommendationsCarousel from "../../features/cars/components/RecommendationsCarousel";
import ReviewsSection from "../../features/cars/components/ReviewsSection";
import ColorPlaceholder, { BodySVG } from "../../features/cars/components/ColorPlaceholder";
import { formatPrice } from "../../shared/utils/formatPrice";
import { IBack, IPrev, INext, IPin, IChev, IDown } from "../../shared/ui/icons";
import { FUEL, GEAR, DRIVE, DRIVE_LABEL, DRIVE_SHORT, BODY } from "../../features/cars/config/carLabels";
import { cityWord, dealerWord, stockWord, bodyWord, reviewWord } from "../../shared/utils/pluralize";

type Config = {
  body: string | null;
  hp: number | null;
  fuel: string | null;
  trans: string | null;
  drive: string | null;
};

type Props = {
  car: Car;
  onBack: () => void;
  onToast: (title: string, sub: string) => void;
  favs: Set<string>;
  onFav: (id: string) => void;
  onOpen: (car: Car) => void;
};


const CarDetailPage = ({ car, onBack, onToast, favs, onFav, onOpen }: Props) => {
  const [model, setModel]         = useState<CarModelDetail | null>(null);
  const [cfgOpts, setCfgOpts]     = useState<ConfigurationsResponse | null>(null);
  const [stockData, setStockData] = useState<StockResponse | null>(null);
  const [loading, setLoading]     = useState(true);
  const [config, setConfig]       = useState<Config>({
    body:  car._initialConfig?.body  ?? null,
    hp:    car._initialConfig?.hp    ?? null,
    fuel:  car._initialConfig?.fuel  ?? null,
    trans: car._initialConfig?.trans ?? null,
    drive: car._initialConfig?.drive ?? null,
  });
  const [colorHex, setColorHex]   = useState(car._initialConfig?.colorHex  ?? "#cccccc");
  const [colorName, setColorName] = useState(car._initialConfig?.colorName ?? "");
  const [cityFilter, setCityFilter] = useState("all");
  const [thumb, setThumb]         = useState(0);
  const [modal, setModal]             = useState<StockGroup | null>(null);
  const [reviewsData, setReviewsData] = useState<CarReviewsResponse | null>(null);
  const colorRef = useRef<HTMLElement>(null);
  const stockAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    Promise.all([
      getCarModelDetail(car.id),
      getCarConfigurations(car.id),
      getCarModelReviews(car.id).catch(() => null),
    ]).then(([m, cfg, rv]) => {
      setModel(m);
      setCfgOpts(cfg);
      setReviewsData(rv);
    }).finally(() => setLoading(false));
  }, [car.id]);

  useEffect(() => {
    if (!model || !config.body || config.hp === null || !config.fuel || !config.trans || !config.drive) return;

    stockAbortRef.current?.abort();
    const ctrl = new AbortController();
    stockAbortRef.current = ctrl;

    const color = colorHex !== "#cccccc" ? colorHex : undefined;
    getCarStock(model.id, {
      body: config.body, hp: config.hp, fuel: config.fuel,
      trans: config.trans, drive: config.drive, color,
    }).then(d => {
      if (ctrl.signal.aborted) return;
      setStockData(d);
      setThumb(0);
    });
  }, [model, config.body, config.hp, config.fuel, config.trans, config.drive, colorHex]);

  const opts: ConfiguratorOption[] = cfgOpts?.configurator_options ?? [];
  const availableBodies = cfgOpts?.available_bodies ?? [];

  const bodyOpts  = config.body ? opts.filter(o => o.body === config.body) : opts;
  const engineMap = new Map<string, { hp: number; fuel: string; count: number }>();
  for (const o of bodyOpts) {
    const k = `${o.hp}-${o.fuel}`;
    const ex = engineMap.get(k);
    if (ex) ex.count += o.stock_count;
    else engineMap.set(k, { hp: o.hp, fuel: o.fuel, count: o.stock_count });
  }
  const availableEngines = [...engineMap.values()].sort((a, b) => a.hp - b.hp);

  const engineOpts = config.hp !== null
    ? bodyOpts.filter(o => o.hp === config.hp && o.fuel === config.fuel)
    : bodyOpts;
  const transMap = new Map<string, { trans: string; count: number }>();
  for (const o of engineOpts) {
    const ex = transMap.get(o.trans);
    if (ex) ex.count += o.stock_count;
    else transMap.set(o.trans, { trans: o.trans, count: o.stock_count });
  }
  const availableTrans = [...transMap.values()];

  const transOpts = config.trans ? engineOpts.filter(o => o.trans === config.trans) : engineOpts;
  const driveMap  = new Map<string, { drive: string; count: number }>();
  for (const o of transOpts) {
    const ex = driveMap.get(o.drive);
    if (ex) ex.count += o.stock_count;
    else driveMap.set(o.drive, { drive: o.drive, count: o.stock_count });
  }
  const availableDrives = [...driveMap.values()];

  const matchingOpts  = config.drive ? transOpts.filter(o => o.drive === config.drive) : transOpts;
  const matchingCount = matchingOpts.reduce((s, o) => s + o.stock_count, 0);
  const matchingPrice = matchingOpts.reduce((mn, o) => {
    if (!o.price_from) return mn;
    const p = Number(o.price_from);
    return mn === null || p < mn ? p : mn;
  }, null as number | null);
  const currentComboSpecs = config.drive ? (matchingOpts[0]?.specs ?? null) : null;

  useEffect(() => {
    if (!cfgOpts || config.body !== null) return;
    if (availableBodies.length === 1) setConfig(p => ({ ...p, body: availableBodies[0].style }));
  }, [cfgOpts]);

  useEffect(() => {
    if (config.body === null || config.hp !== null) return;
    if (availableEngines.length === 1) {
      const e = availableEngines[0];
      setConfig(p => ({ ...p, hp: e.hp, fuel: e.fuel }));
    }
  }, [config.body, availableEngines.length]);

  useEffect(() => {
    if (config.hp === null || config.trans !== null) return;
    if (availableTrans.length === 1) setConfig(p => ({ ...p, trans: availableTrans[0].trans }));
  }, [config.hp, availableTrans.length]);

  useEffect(() => {
    if (config.trans === null || config.drive !== null) return;
    if (availableDrives.length === 1) setConfig(p => ({ ...p, drive: availableDrives[0].drive }));
  }, [config.trans, availableDrives.length]);

  useEffect(() => {
    if (!stockData || stockData.colors.length === 0) return;
    if (stockData.colors.some(c => c.hex === colorHex)) return;
    setColorHex(stockData.colors[0].hex);
    setColorName(stockData.colors[0].name);
    setThumb(0);
  }, [stockData?.colors]);

  const allConfigured = !!(config.body && config.hp !== null && config.trans && config.drive);
  const currentStep   = config.drive ? 4 : config.trans ? 3 : config.hp !== null ? 2 : 1;

  const galleryImages = (allConfigured && stockData) ? stockData.gallery_images : (model?.images ?? []);
  const safeThumb     = Math.min(thumb, Math.max(0, galleryImages.length - 1));

  const stockGroups    = stockData?.groups ?? [];
  const visibleGroups  = cityFilter === "all" ? stockGroups : stockGroups.filter(g => g.city === cityFilter);
  const isAll          = cityFilter === "all";

  const cityCounts = (() => {
    const m = new Map<string, number>();
    stockGroups.forEach(g => m.set(g.city, (m.get(g.city) ?? 0) + g.cars.length));
    return m;
  })();

  const totalStockInGroups = stockGroups.reduce((a, g) => a + g.cars.length, 0);

  const pickBody   = (style: string) => { setConfig({ body: style, hp: null, fuel: null, trans: null, drive: null }); setCityFilter("all"); setThumb(0); };
  const pickEngine = (hp: number, fuel: string) => { setConfig(p => ({ ...p, hp, fuel, trans: null, drive: null })); setCityFilter("all"); setThumb(0); };
  const pickTrans  = (trans: string) => { setConfig(p => ({ ...p, trans, drive: null })); setCityFilter("all"); setThumb(0); };
  const pickDrive  = (drive: string) => { setConfig(p => ({ ...p, drive })); setCityFilter("all"); setThumb(0); };
  const pickColor  = (hex: string, name: string) => { setColorHex(hex); setColorName(name); setCityFilter("all"); setThumb(0); };

  if (loading) {
    return (
      <div className="detail-page">
        <button className="d-back-link" onClick={onBack}><IBack /> Назад к каталогу</button>
        <div style={{ textAlign: "center", padding: "80px 0", color: "#888" }}>Загрузка…</div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="detail-page">
        <button className="d-back-link" onClick={onBack}><IBack /> Назад к каталогу</button>
        <div style={{ textAlign: "center", padding: "80px 0", color: "#888" }}>Не удалось загрузить</div>
      </div>
    );
  }

  const displayPrice = allConfigured && matchingPrice !== null
    ? matchingPrice
    : model.price_from ? Number(model.price_from) : null;

  const matchingYears = stockData?.matching.years ?? [];

  return (
    <>
      <div className="detail-page">

        <div className="d-back-row">
          <button className="d-back-link" onClick={onBack}><IBack /> Назад к каталогу</button>
          <nav className="d-crumbs">
            <span onClick={onBack} style={{ cursor: "pointer" }}>Каталог</span>
            <span className="d-crumb-sep">›</span>
            <span>{model.make}</span>
            <span className="d-crumb-sep">›</span>
            <span className="d-crumb-cur">{model.model}</span>
          </nav>
        </div>

        <section className="d-hero">
          <div className="d-gallery">
            <div className="gallery-main">
              {galleryImages[safeThumb]
                ? <img src={galleryImages[safeThumb].image} alt={`${model.make} ${model.model}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <ColorPlaceholder hex={colorHex} bodyStyle={config.body ?? undefined} tag={`${model.make} ${model.model} · ${colorName || "—"}`} />
              }
              <button className="gallery-nav prev" onClick={() => setThumb(t => Math.max(0, t - 1))}><IPrev /></button>
              <button className="gallery-nav next" onClick={() => setThumb(t => Math.min(galleryImages.length - 1, t + 1))}><INext /></button>
              <div className="gallery-counter">{safeThumb + 1} / {galleryImages.length || 1}</div>
            </div>
            {galleryImages.length > 1 && (
              <div className="d-thumbs">
                {galleryImages.slice(0, 5).map((img, i) => (
                  <div key={img.id} className={`thumb ${i === safeThumb ? "active" : ""}`} onClick={() => setThumb(i)}>
                    <img src={img.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="d-hero-side">
            <span className="badge-success"><span className="badge-dot" />В наличии</span>
            <h1 className="d-model-name">{model.make} {model.model}</h1>
            <div className="d-model-sub">
              {model.year_range && <span>{model.year_range}</span>}
              <span className="d-dot" />
              <span>{availableBodies.length} {bodyWord(availableBodies.length)}</span>
              <span className="d-dot" />
              <span>{model.total_stock} авто</span>
            </div>

            <div className="d-model-from">
              <div className="d-from-label">Стартовая цена</div>
              <div className="d-from-value">
                от <span className="d-from-accent">{displayPrice ? formatPrice(displayPrice) : "—"}</span>
              </div>
              <div className="d-from-hint">
                {allConfigured
                  ? `${BODY[config.body!]} · ${config.hp} л.с. · ${GEAR[config.trans!] ?? config.trans} · ${DRIVE_SHORT[config.drive!] ?? config.drive}`
                  : "Настройте конфигурацию ниже — цена обновится"}
              </div>
            </div>

            {reviewsData !== null && (
              <div className="hero-rating">
                <div className="hero-stars">
                  {[1,2,3,4,5].map(n => (
                    <span key={n} className={"hero-star" + (reviewsData.count > 0 && n <= Math.round(reviewsData.avg_rating) ? "" : " empty")}>★</span>
                  ))}
                </div>
                {reviewsData.count > 0 ? (
                  <>
                    <span className="hero-rating-score">{reviewsData.avg_rating.toFixed(1)}</span>
                    <span className="hero-rating-count">{reviewsData.count} {reviewWord(reviewsData.count)}</span>
                  </>
                ) : (
                  <span className="hero-rating-count">Нет отзывов</span>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="d-section">
          <div className="d-section-h">
            <div>
              <h2>Конфигуратор <span className="d-section-count">· шаг {currentStep} из 4</span></h2>
              <div className="d-section-sub">Соберите свою комплектацию — покажем подходящие авто в наличии</div>
            </div>
          </div>

          <div className="d-cfg">
            <div className={`d-step ${config.body ? "done" : "active"}`}>
              <div className="d-step-h">
                <span className="d-step-idx">1</span>
                <span className="d-step-title">Кузов</span>
                <span className="d-step-hint">
                  {config.body
                    ? <><span>выбрано:</span> <span className="d-step-pick">{BODY[config.body] ?? config.body}</span></>
                    : <span>выберите тип кузова</span>}
                </span>
              </div>
              <div className="d-body-grid">
                {availableBodies.map(({ style, count }) => (
                  <button key={style} className={`d-body-card ${config.body === style ? "active" : ""}`} onClick={() => pickBody(style)}>
                    <div className="d-body-svg"><BodySVG style={style} /></div>
                    <div className="d-body-label">{BODY[style] ?? style}</div>
                    <div className="d-body-stock">{count} авто</div>
                  </button>
                ))}
              </div>
            </div>

            {config.body && cfgOpts && (
              <div key={`eng-${config.body}`} className={`d-step d-step-appear ${config.hp !== null ? "done" : "active"}`}>
                <div className="d-step-h">
                  <span className="d-step-idx">2</span>
                  <span className="d-step-title">Двигатель</span>
                  <span className="d-step-hint">
                    {config.hp !== null
                      ? <><span>выбрано:</span> <span className="d-step-pick">{config.hp} л.с. · {FUEL[config.fuel ?? ""] ?? config.fuel}</span></>
                      : availableEngines.length === 1 ? <span className="d-step-auto">авто</span>
                      : <span>выберите мощность</span>}
                  </span>
                </div>
                <div className="d-cfg-chips">
                  {availableEngines.map(e => {
                    const isActive = config.hp === e.hp && config.fuel === e.fuel;
                    const isLocked = availableEngines.length === 1;
                    return (
                      <button key={`${e.hp}-${e.fuel}`}
                        className={`d-cfg-chip ${isLocked ? "locked" : isActive ? "active" : ""}`}
                        onClick={() => !isLocked && pickEngine(e.hp, e.fuel)}>
                        <span style={{ fontWeight: 700 }}>{e.hp} л.с.</span>
                        <span className="d-cfg-chip-dot">·</span>
                        <span>{FUEL[e.fuel] ?? e.fuel}</span>
                        {isLocked && <span className="d-cfg-chip-lock">единственный</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {config.hp !== null && cfgOpts && (
              <div key={`trans-${config.body}-${config.hp}-${config.fuel}`} className={`d-step d-step-appear ${config.trans ? "done" : "active"}`}>
                <div className="d-step-h">
                  <span className="d-step-idx">3</span>
                  <span className="d-step-title">Коробка передач</span>
                  <span className="d-step-hint">
                    {config.trans
                      ? <><span>выбрано:</span> <span className="d-step-pick">{GEAR[config.trans] ?? config.trans}</span></>
                      : availableTrans.length === 1 ? <span className="d-step-auto">авто</span>
                      : <span>выберите тип КПП</span>}
                  </span>
                </div>
                <div className="d-cfg-chips">
                  {availableTrans.map(({ trans }) => {
                    const isLocked = availableTrans.length === 1;
                    return (
                      <button key={trans}
                        className={`d-cfg-chip ${isLocked ? "locked" : config.trans === trans ? "active" : ""}`}
                        onClick={() => !isLocked && pickTrans(trans)}>
                        <span>{GEAR[trans] ?? trans}</span>
                        {isLocked && <span className="d-cfg-chip-lock">единственный</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {config.trans && cfgOpts && (
              <div key={`drive-${config.body}-${config.hp}-${config.trans}`} className={`d-step d-step-appear ${config.drive ? "done" : "active"}`}>
                <div className="d-step-h">
                  <span className="d-step-idx">4</span>
                  <span className="d-step-title">Привод</span>
                  <span className="d-step-hint">
                    {config.drive
                      ? <><span>выбрано:</span> <span className="d-step-pick">{DRIVE[config.drive] ?? config.drive}</span></>
                      : availableDrives.length === 1 ? <span className="d-step-auto">авто</span>
                      : <span>выберите привод</span>}
                  </span>
                </div>
                <div className="d-cfg-chips">
                  {availableDrives.map(({ drive }) => {
                    const isLocked = availableDrives.length === 1;
                    return (
                      <button key={drive}
                        className={`d-cfg-chip ${isLocked ? "locked" : config.drive === drive ? "active" : ""}`}
                        onClick={() => !isLocked && pickDrive(drive)}>
                        <span>{DRIVE_LABEL[drive] ?? drive}</span>
                        <span className="d-cfg-chip-dot">·</span>
                        <span className="d-cfg-chip-mono">{DRIVE_SHORT[drive] ?? drive}</span>
                        {isLocked && <span className="d-cfg-chip-lock">единственный</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {allConfigured && (
              <>
                <div className="d-cfg-summary">
                  <span className="d-cfg-summary-bullet" />
                  <div className="d-cfg-summary-text">
                    <div className="d-cfg-summary-title">
                      <b>{matchingCount}</b> {stockWord(matchingCount)} в наличии
                      {matchingPrice !== null && (
                        <> <span style={{ color: "var(--muted-2)", margin: "0 6px" }}>·</span>
                        от <span className="d-cfg-summary-price">{formatPrice(matchingPrice)}</span></>
                      )}
                    </div>
                    <div className="d-cfg-summary-sub">
                      {BODY[config.body!]} · {config.hp} л.с. · {GEAR[config.trans!] ?? config.trans} · {DRIVE_SHORT[config.drive!] ?? config.drive}
                    </div>
                  </div>
                  {stockData && stockData.colors.length > 0 && (
                    <button className="d-cfg-summary-cta" onClick={() => colorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                      Выбрать цвет
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                    </button>
                  )}
                </div>
                <div className="d-flow-arrow"><IDown /></div>
              </>
            )}
          </div>
        </section>

        {allConfigured && stockData && stockData.colors.length > 0 && (
          <section className="d-section" ref={colorRef}>
            <div className="d-section-h">
              <div>
                <h2>Цвет <span className="d-section-count">· {stockData.colors.length} варианта</span></h2>
                <div className="d-section-sub">Выберите цвет — список авто ниже обновится</div>
              </div>
            </div>
            <div className="d-color-row">
              {stockData.colors.map(c => (
                <button key={c.hex} className={`d-color-opt ${c.hex === colorHex ? "active" : ""}`} onClick={() => pickColor(c.hex, c.name)}>
                  <span className="d-color-swatch" style={{ background: c.hex }} />
                  <span className="d-color-name">{c.name}</span>
                  <span className={`d-color-count ${c.count === 0 ? "zero" : ""}`}>{c.count} авто</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {allConfigured && currentComboSpecs && (
          <section className="d-section">
            <div className="d-section-h">
              <div>
                <h2>Характеристики</h2>
                <div className="d-section-sub">{model.make} {model.model} · {BODY[config.body!]}</div>
              </div>
            </div>
            <div className="d-specs-grid">
              {[
                { l: "Год",             v: matchingYears.length > 1 ? `${matchingYears[0]}–${matchingYears[matchingYears.length-1]}` : String(matchingYears[0] ?? "—") },
                { l: "Кузов",           v: BODY[config.body!] ?? config.body },
                { l: "Топливо",         v: FUEL[config.fuel ?? ""] ?? config.fuel },
                { l: "Мощность",        v: config.hp ? `${config.hp} л.с.` : "—" },
                { l: "Коробка",         v: GEAR[config.trans ?? ""] ?? config.trans },
                { l: "Привод",          v: DRIVE[config.drive ?? ""] ?? config.drive },
                { l: "Дверей",          v: currentComboSpecs.doors },
                { l: "Расход (трасса)", v: `${currentComboSpecs.highway_mpg} mpg` },
                { l: "Расход (город)",  v: `${currentComboSpecs.city_mpg} mpg` },
              ].map((s, i) => (
                <div key={i} className="d-spec-tile">
                  <span className="d-spec-l">{s.l}</span>
                  <span className="d-spec-v">{s.v}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {allConfigured && stockData && totalStockInGroups > 0 && (
          <section className="d-section">
            <div className="d-section-h">
              <div>
                <h2>Город <span className="d-section-count">· {cityCounts.size} {cityWord(cityCounts.size)}</span></h2>
                <div className="d-section-sub">Выберите город, чтобы увидеть шоурумы и автомобили</div>
              </div>
            </div>
            <div className="d-city-pills">
              <button className={`d-city-pill ${isAll ? "active" : ""}`} onClick={() => setCityFilter("all")}>
                Все <span className="d-pill-sep" /><span className="d-pill-count">{totalStockInGroups} авто</span>
              </button>
              {[...cityCounts.entries()].map(([city, cnt]) => (
                <button key={city} className={`d-city-pill ${cityFilter === city ? "active" : ""}`} onClick={() => setCityFilter(city)}>
                  {city} <span className="d-pill-sep" /><span className="d-pill-count">{cnt}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {allConfigured && stockData && (
          <section className="d-section">
            <div className="d-section-h">
              <div>
                <h2>
                  Шоурумы
                  <span className="d-count-badge">{visibleGroups.length} {dealerWord(visibleGroups.length)}</span>
                </h2>
                <div className="d-section-sub">
                  {BODY[config.body!]} · {config.hp} л.с. · {colorName}{!isAll && ` · ${cityFilter}`}
                </div>
              </div>
            </div>

            {totalStockInGroups === 0 ? (
              <div className="d-stock-empty">
                <div className="d-empty-t">Нет авто в этом цвете</div>
                <div className="d-empty-s">Попробуйте выбрать другой цвет</div>
              </div>
            ) : (
              <div className="d-showroom-list">
                {visibleGroups.map(g => (
                  <div key={g.showroom} className="d-showroom-card">
                    <div className="d-showroom-left">
                      <div className="d-showroom-name">{g.showroom}</div>
                      <div className="d-showroom-addr"><IPin /> {g.city}{g.address && `, ${g.address}`}</div>
                    </div>
                    <div className="d-showroom-mid">
                      <div className="d-showroom-count">{g.cars.length} {stockWord(g.cars.length)}</div>
                      {g.price_from && <div className="d-showroom-price">от {formatPrice(g.price_from)}</div>}
                    </div>
                    <button
                      className="btn btn-dark"
                      style={{ height: 42, fontSize: 14, whiteSpace: "nowrap" }}
                      onClick={() => g.showroom_id && setModal(g)}
                    >
                      Записаться на тест-драйв
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {reviewsData && reviewsData.count > 0 && <ReviewsSection data={reviewsData} />}

        <RecommendationsCarousel modelId={car.id} favs={favs} onFav={onFav} onOpen={onOpen} />

      </div>

      {modal && model && (
        <TestDriveModal
          showroomId={modal.showroom_id!}
          showroomName={modal.showroom}
          showroomCity={modal.city}
          showroomAddress={modal.address}
          carModelId={model.id}
          carModelInfo={`${model.make} ${model.model} · ${BODY[config.body!] ?? config.body} · ${config.hp} л.с. · ${GEAR[config.trans!] ?? config.trans} · ${DRIVE_SHORT[config.drive!] ?? config.drive}`}
          colorName={colorName}
          colorHex={colorHex}
          bodyStyle={config.body ?? undefined}
          engineHp={config.hp}
          fuelType={config.fuel ?? undefined}
          transmissionType={config.trans ?? undefined}
          driveType={config.drive ?? undefined}
          onClose={() => setModal(null)}
          onSuccess={() => { setModal(null); onToast("Заявка принята!", "Менеджер свяжется в течение 15 минут"); }}
        />
      )}
    </>
  );
};

export default CarDetailPage;
