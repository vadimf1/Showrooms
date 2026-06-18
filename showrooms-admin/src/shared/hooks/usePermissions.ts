import { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';

export interface Permissions {
  can_manage_employees: boolean;
  can_manage_showrooms: boolean;
  can_manage_dealers:   boolean;
  can_manage_cars:      boolean;
  can_manage_sales:     boolean;
}

const DEFAULT: Permissions = {
  can_manage_employees: false,
  can_manage_showrooms: false,
  can_manage_dealers:   false,
  can_manage_cars:      false,
  can_manage_sales:     false,
};

let _cache: Permissions | null = null;
const _listeners: Array<(p: Permissions) => void> = [];

export function invalidatePermissions() {
  _cache = null;
}

export function usePermissions(): { permissions: Permissions; loading: boolean } {
  const [permissions, setPermissions] = useState<Permissions>(_cache ?? DEFAULT);
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    if (_cache) {
      setPermissions(_cache);
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    apiClient.get<Permissions>('/auth/permissions/')
      .then(r => {
        _cache = r.data;
        setPermissions(r.data);
        _listeners.forEach(fn => fn(r.data));
      })
      .finally(() => setLoading(false));
  }, []);

  return { permissions, loading };
}
