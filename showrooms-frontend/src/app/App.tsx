import { useState, useEffect, useRef } from "react";
import AppLayout from "../shared/layouts/AppLayout";
import CarsPage from "../pages/CarsPage/CarsPage";
import CarDetailPage from "../pages/CarDetailPage/CarDetailPage";
import AuthPage from "../pages/AuthPage/AuthPage";
import AccountPage from "../pages/AccountPage/AccountPage";
import AboutPage from "../pages/AboutPage/AboutPage";
import ServicesPage from "../pages/ServicesPage/ServicesPage";
import ContactsPage from "../pages/ContactsPage/ContactsPage";
import Toast from "../shared/ui/Toast";
import { Car, CarInitialConfig } from "../features/cars/model/car.types";
import { AuthProvider, useAuth } from "../features/auth/context/AuthContext";
import { getFavorites, addFavorite, removeFavorite } from "../features/account/api/account.api";

type ToastMsg = { title: string; sub: string };
type View = "catalog" | "detail" | "auth" | "account" | "about" | "services" | "contacts";

const FAVS_KEY = "autohub_favs";
const HISTORY_KEY = "autohub_history";
const MAX_HISTORY = 5;

const addToHistory = (id: string) => {
  try {
    const prev: string[] = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
    const next = [id, ...prev.filter(x => x !== id)].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {}
};

const hashToCatalogView = (hash: string): "catalog" | "detail" =>
  hash.startsWith("#models/") ? "detail" : "catalog";

const modelIdFromHash = (hash: string) => hash.replace("#models/", "");

function AppInner() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<View>(() =>
    hashToCatalogView(window.location.hash)
  );
  const [selectedCar, setSelectedCar] = useState<Car | null>(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#models/")) return null;
    const id = modelIdFromHash(hash);
    return { id, car_id: "", make: "", model: "", price_from: "0", dealer: null, showroom: null, images: [] };
  });
  const carMapRef = useRef<Map<string, Car>>(new Map());

  const [accountInitialTab, setAccountInitialTab] = useState<"profile" | "favs">("profile");

  const [favs, setFavs] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(FAVS_KEY) ?? "[]")); }
    catch { return new Set(); }
  });
  const [toast, setToast] = useState<ToastMsg | null>(null);

  
  useEffect(() => {
    localStorage.setItem(FAVS_KEY, JSON.stringify([...favs]));
  }, [favs]);

  
  useEffect(() => {
    if (!user) return;
    getFavorites()
      .then(items => setFavs(new Set(items.map(f => f.car_model_id))))
      .catch(() => {});
  }, [user?.id]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onPop = () => {
      const next = hashToCatalogView(window.location.hash);
      setView(next);
      if (next === "detail") {
        const id = modelIdFromHash(window.location.hash);
        setSelectedCar(carMapRef.current.get(id) ?? null);
      } else {
        setSelectedCar(null);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const openCar = (car: Car) => {
    carMapRef.current.set(car.id, car);
    history.pushState(null, "", `#models/${car.id}`);
    setSelectedCar(car);
    setView("detail");
    window.scrollTo({ top: 0 });
    sessionStorage.setItem("autohub_last_model", car.id);
    addToHistory(car.id);
  };

  const backToCatalog = () => {
    if (view === "detail") {
      history.back();
    } else {
      setView("catalog");
    }
  };

  const toggleFav = (id: string) => {
    const adding = !favs.has(id);
    setFavs(prev => {
      const next = new Set(prev);
      adding ? next.add(id) : next.delete(id);
      return next;
    });
    setToast({ title: adding ? "Добавлено в избранное" : "Удалено из избранного", sub: "" });

    if (user) {
      const call = adding ? addFavorite(id) : removeFavorite(id);
      call.catch(() => {
        
        setFavs(prev => {
          const next = new Set(prev);
          adding ? next.delete(id) : next.add(id);
          return next;
        });
      });
    }
  };

  const onLoginClick = () => {
    if (user) {
      setAccountInitialTab("profile");
      setView("account");
    } else {
      setView("auth");
    }
  };

  const onFavClick = () => {
    if (user) {
      setAccountInitialTab("favs");
      setView("account");
    } else {
      setView("auth");
    }
  };

  if (loading) return null;

  if (view === "auth") {
    return (
      <AuthPage onSuccess={() => setView("account")} />
    );
  }

  const openCarById = (id: string, initialConfig?: CarInitialConfig) => {
    const base = carMapRef.current.get(id) ?? { id, car_id: id, make: '', model: '', price_from: '0', dealer: null, showroom: null, images: [] };
    openCar({ ...base, _initialConfig: initialConfig });
  };

  if (view === "about") {
    return (
      <AppLayout page={view} onNav={v => setView(v as View)} onLoginClick={onLoginClick} onFavClick={onFavClick}>
        <AboutPage />
      </AppLayout>
    );
  }

  if (view === "services") {
    return (
      <AppLayout page={view} onNav={v => setView(v as View)} onLoginClick={onLoginClick} onFavClick={onFavClick}>
        <ServicesPage />
      </AppLayout>
    );
  }

  if (view === "contacts") {
    return (
      <AppLayout page={view} onNav={v => setView(v as View)} onLoginClick={onLoginClick} onFavClick={onFavClick}>
        <ContactsPage />
      </AppLayout>
    );
  }

  if (view === "account") {
    return (
      <AccountPage onBackToCatalog={() => setView("catalog")} onOpenCar={openCarById} initialTab={accountInitialTab} />
    );
  }

  return (
    <AppLayout page={view} onNav={v => { const next = v as View; if (next === "about" || next === "services" || next === "contacts") { setView(next); } else if (view !== "catalog") { backToCatalog(); } else { setView("catalog"); } }} onLoginClick={onLoginClick} onFavClick={onFavClick}>
      {view === "catalog" && (
        <CarsPage favs={favs} onFav={toggleFav} onOpen={openCar} />
      )}
      {view === "detail" && selectedCar && (
        <CarDetailPage
          car={selectedCar}
          onBack={backToCatalog}
          onToast={(t, s) => setToast({ title: t, sub: s })}
          favs={favs}
          onFav={toggleFav}
          onOpen={openCar}
        />
      )}

      {toast && (
        <div className="toast-wrap">
          <Toast title={toast.title} sub={toast.sub} />
        </div>
      )}
    </AppLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default App;
