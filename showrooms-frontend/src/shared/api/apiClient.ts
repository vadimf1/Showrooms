import axios from "axios";
import { getStoredAccess, getStoredRefresh, storeAccess, clearTokens } from "../../features/auth/api/auth.api";

const apiClient = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(config => {
    const token = getStoredAccess();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
    failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token!));
    failedQueue = [];
}

apiClient.interceptors.response.use(
    r => r,
    async err => {
        const original = err.config;
        if (err.response?.status === 401 && !original._retry) {
            const refresh = getStoredRefresh();
            if (!refresh) {
                clearTokens();
                return Promise.reject(err);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    original.headers.Authorization = `Bearer ${token}`;
                    return apiClient(original);
                });
            }

            original._retry = true;
            isRefreshing = true;

            try {
                const res = await axios.post("http://localhost:8000/api/auth/token/refresh/", { refresh });
                const newAccess: string = res.data.access;
                storeAccess(newAccess);
                processQueue(null, newAccess);
                original.headers.Authorization = `Bearer ${newAccess}`;
                return apiClient(original);
            } catch (refreshErr) {
                processQueue(refreshErr, null);
                clearTokens();
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(err);
    },
);

export default apiClient;
