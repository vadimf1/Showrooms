import apiClient from '../../../shared/api/apiClient';
import type { UserProfile, RegisterData } from '../model/auth.types';

const ACCESS_KEY  = 'autohub_access';
const REFRESH_KEY = 'autohub_refresh';

export const getStoredAccess  = () => localStorage.getItem(ACCESS_KEY);
export const getStoredRefresh = () => localStorage.getItem(REFRESH_KEY);
export const storeAccess      = (t: string) => localStorage.setItem(ACCESS_KEY, t);
export const storeTokens      = (access: string, refresh: string) => {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
};
export const clearTokens = () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
};

export const authLogin = async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login/', { email, password });
    const data = res.data as { access: string; refresh: string; user: UserProfile };
    storeTokens(data.access, data.refresh);
    return data;
};

export const authRegister = async (data: RegisterData) => {
    const res = await apiClient.post('/auth/register/', data);
    const body = res.data as { access: string; refresh: string; user: UserProfile };
    storeTokens(body.access, body.refresh);
    return body;
};

export const authLogout = async () => {
    await apiClient.post('/auth/logout/').catch(() => {});
    clearTokens();
};

export const authMe = async () => {
    const res = await apiClient.get('/auth/me/');
    return res.data as UserProfile;
};

export const authPatchMe = async (data: Partial<UserProfile>) => {
    const res = await apiClient.patch('/auth/me/', data);
    return res.data as UserProfile;
};
