import { ReactNode } from "react";
import AppHeader from "../ui/AppHeader";

type Props = { page: string; onNav: (p: string) => void; onLoginClick: () => void; onFavClick: () => void; children: ReactNode };

const AppLayout = ({ page, onNav, onLoginClick, onFavClick, children }: Props) => (
  <>
    <AppHeader page={page} onNav={onNav} onLoginClick={onLoginClick} onFavClick={onFavClick} />
    <main>{children}</main>
  </>
);

export default AppLayout;
