import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "./constants";
import { storage } from "./storage";
import { STORAGE_KEYS } from "./constants";

let _getAccessToken: (() => string | null) | null = null;
let _getRefreshToken: (() => string | null) | null = null;
let _onTokenRefreshed:
  | ((tokens: { accessToken: string; refreshToken: string }) => void)
  | null = null;
let _onLogout: (() => void) | null = null;

export function configureApiInterceptors(config: {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  onTokenRefreshed: (tokens: {
    accessToken: string;
    refreshToken: string;
  }) => void;
  onLogout: () => void;
}) {
  _getAccessToken = config.getAccessToken;
  _getRefreshToken = config.getRefreshToken;
  _onTokenRefreshed = config.onTokenRefreshed;
  _onLogout = config.onLogout;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ── Attach token to every request ────────────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = _getAccessToken?.();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Handle 401 + token refresh ───────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else if (token) p.resolve(token);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (original.headers) original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    const refreshToken = _getRefreshToken?.();
    if (!refreshToken) {
      _onLogout?.();
      return Promise.reject(error);
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
        refreshToken,
      });
      const { accessToken, refreshToken: newRefresh } = res.data.data;

      _onTokenRefreshed?.({ accessToken, refreshToken: newRefresh });
      await storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      await storage.set(STORAGE_KEYS.REFRESH_TOKEN, newRefresh);

      processQueue(null, accessToken);
      if (original.headers) original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch (err) {
      processQueue(err, null);
      _onLogout?.();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);