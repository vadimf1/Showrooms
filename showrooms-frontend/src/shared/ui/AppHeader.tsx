import { useAuth } from '../../features/auth/context/AuthContext';
import { userInitials } from '../../shared/utils/format';

type Props = { page: string; onNav: (p: string) => void; onLoginClick: () => void; onFavClick: () => void };

const AppHeader = ({ page, onNav, onLoginClick, onFavClick }: Props) => {
  const { user } = useAuth();

  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo" onClick={() => onNav("catalog")}>
          <div className="logo-mark">A</div>
          AutoHub
        </div>
        <nav className="nav">
          <a className={page === "catalog" ? "active" : ""} onClick={() => onNav("catalog")}>Каталог</a>
          <a className={page === "about" ? "active" : ""} onClick={() => onNav("about")}>О нас</a>
          <a className={page === "services" ? "active" : ""} onClick={() => onNav("services")}>Услуги</a>
          <a className={page === "contacts" ? "active" : ""} onClick={() => onNav("contacts")}>Контакты</a>
        </nav>
        <div className="header-spacer" />
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={onFavClick}>Избранное</button>
          {user ? (
            <button className="btn btn-outline header-user-btn" onClick={onLoginClick}>
              <span className="header-avatar">{userInitials(user)}</span>
              <span className="header-user-name">{user.first_name || user.email}</span>
            </button>
          ) : (
            <button className="btn btn-outline" onClick={onLoginClick}>Войти</button>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
