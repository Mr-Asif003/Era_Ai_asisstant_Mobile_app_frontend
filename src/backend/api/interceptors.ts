import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

import api  from "../api/client";

import { API_BASE_URL } from "@/lib/constants";
import { storage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/constants";

let _getAccessToken: (() => string | null) | null =
  null;

let _getRefreshToken: (() => string | null) | null =
  null;

let _onTokenRefreshed:
  | ((tokens: {
      accessToken: string;
      refreshToken: string;
    }) => void)
  | null = null;

let _onLogout: (() => void) | null = null;

/**
 * Called once during app startup
 */
export function configureApiInterceptors(
  config: {
    getAccessToken: () => string | null;
    getRefreshToken: () => string | null;

    onTokenRefreshed: (
      tokens: {
        accessToken: string;
        refreshToken: string;
      }
    ) => void;

    onLogout: () => void;
  }
) {
  _getAccessToken = config.getAccessToken;

  _getRefreshToken =
    config.getRefreshToken;

  _onTokenRefreshed =
    config.onTokenRefreshed;

  _onLogout = config.onLogout;
}

/* =====================================================
   REQUEST INTERCEPTOR
===================================================== */

api.interceptors.request.use(
  (
    config: InternalAxiosRequestConfig
  ) => {
    const token =
      _getAccessToken?.();

    if (
      token &&
      config.headers
    ) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) =>
    Promise.reject(error)
);

/* =====================================================
   REFRESH TOKEN QUEUE
===================================================== */

let isRefreshing = false;

let failedQueue: Array<{
  resolve: (
    token: string
  ) => void;

  reject: (
    error: unknown
  ) => void;
}> = [];

function processQueue(
  error: unknown,
  token: string | null
) {
  failedQueue.forEach(
    (promise) => {
      if (error) {
        promise.reject(error);
      } else if (token) {
        promise.resolve(token);
      }
    }
  );

  failedQueue = [];
}

/* =====================================================
   RESPONSE INTERCEPTOR
===================================================== */

api.interceptors.response.use(
  (response) => response,

  async (
    error: AxiosError
  ) => {
    const originalRequest =
      error.config as
        | (InternalAxiosRequestConfig & {
            _retry?: boolean;
          })
        | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    /*
     * Only refresh on 401
     */
    if (
      error.response?.status !==
      401
    ) {
      return Promise.reject(error);
    }

    /*
     * Prevent infinite loop
     */
    if (
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    /*
     * If refresh already running
     * queue requests
     */
    if (isRefreshing) {
      return new Promise<string>(
        (
          resolve,
          reject
        ) => {
          failedQueue.push({
            resolve,
            reject,
          });
        }
      ).then(
        (token) => {
          if (
            originalRequest.headers
          ) {
            originalRequest.headers.Authorization =
              `Bearer ${token}`;
          }

          return api(
            originalRequest
          );
        }
      );
    }

    originalRequest._retry =
      true;

    isRefreshing = true;

    const refreshToken =
      _getRefreshToken?.();

    if (!refreshToken) {
      _onLogout?.();

      return Promise.reject(
        error
      );
    }

    try {
      /*
       * Call refresh endpoint
       */

      const response =
        await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {
            refreshToken,
          }
        );

      const authData =
        response.data.data;

      const newAccessToken =
        authData.accessToken;

      const newRefreshToken =
        authData.refreshToken;

      /*
       * Update Zustand
       */
      _onTokenRefreshed?.({
        accessToken:
          newAccessToken,

        refreshToken:
          newRefreshToken,
      });

      /*
       * Persist Storage
       */
      await Promise.all([
        storage.set(
          STORAGE_KEYS.ACCESS_TOKEN,
          newAccessToken
        ),

        storage.set(
          STORAGE_KEYS.REFRESH_TOKEN,
          newRefreshToken
        ),
      ]);

      /*
       * Process waiting requests
       */
      processQueue(
        null,
        newAccessToken
      );

      /*
       * Retry original request
       */
      if (
        originalRequest.headers
      ) {
        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;
      }

      return api(
        originalRequest
      );
    } catch (
      refreshError
    ) {
      processQueue(
        refreshError,
        null
      );

      /*
       * Refresh failed
       * logout user
       */
      _onLogout?.();

      return Promise.reject(
        refreshError
      );
    } finally {
      isRefreshing = false;
    }
  }
);