import apiClient from '../../../shared/api/apiClient';

export interface AuthUser {
  id: string;
  email: string;
  role: 'CLIENT' | 'EMPLOYEE' | 'ADMIN';
  first_name: string;
  last_name: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

export const login = (username: string, password: string) =>
  apiClient.post<LoginResponse>('/auth/login/', { email: username, password }).then(r => r.data);

export const logout = () =>
  apiClient.post('/auth/logout/').catch(() => {});
