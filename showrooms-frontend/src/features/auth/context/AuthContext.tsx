import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserProfile, RegisterData } from '../model/auth.types';
import {
  getStoredAccess, clearTokens,
  authLogin, authRegister, authLogout, authMe,
} from '../api/auth.api';

interface AuthCtx {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (u: UserProfile) => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredAccess();
    if (!token) { setLoading(false); return; }
    authMe()
      .then(setUser)
      .catch(() => clearTokens())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    await authLogin(email, password);
    const profile = await authMe();
    setUser(profile);
  };

  const register = async (data: RegisterData) => {
    await authRegister(data);
    const profile = await authMe();
    setUser(profile);
  };

  const logout = async () => {
    await authLogout();
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
