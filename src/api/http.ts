import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import axios from 'axios';

import { authApi } from './authApi';
import { storageService } from '../services/storage';

declare module 'axios' {
  export interface AxiosRequestConfig {
    requireToken?: boolean;
    _retry?: boolean;
  }
}

export const API_URL = 'https://swiftera.azurewebsites.net/api/v1';

export const TOKEN_REFRESHED_EVENT = 'swiftera:auth:token-refreshed';

/** Khớp envelope refresh token (tránh import vòng authApi ↔ http) */
type RefreshTokenResponse = AxiosResponse<{
  data: { accessToken: string };
}>;

type BackendErrorEnvelope = {
  message?: unknown;
  errors?: Array<{ message?: unknown }>;
};

export const http = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true,
});

let refreshTokenPromise: Promise<string> | null = null;

let logoutCallback: (() => void) | undefined;
export const setLogoutCallback = (callback: (() => void) | undefined): void => {
  logoutCallback = callback;
};

/**
 * Dispatch custom event khi token được refresh thành công
 * WebSocket client sẽ listen event này để reconnect với token mới
 */
const dispatchTokenRefreshedEvent = (accessToken: string): void => {
  if (typeof window === 'undefined') return;

  console.log('🔔 Dispatching token refreshed event...');

  const event = new CustomEvent(TOKEN_REFRESHED_EVENT, {
    detail: { accessToken },
  });

  window.dispatchEvent(event);
};

const extractErrorMessage = (error: unknown): string | null => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  if (!error || typeof error !== 'object') {
    return null;
  }

  const payload = error as BackendErrorEnvelope;
  if (typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message;
  }

  if (Array.isArray(payload.errors)) {
    for (const item of payload.errors) {
      if (item && typeof item.message === 'string' && item.message.trim()) {
        return item.message;
      }
    }
  }

  return null;
};

const normalizeRejectedError = (
  error: unknown,
  fallbackMessage: string,
): Error => {
  if (error instanceof Error) {
    return error;
  }

  const normalizedError = new Error(
    extractErrorMessage(error) ?? fallbackMessage,
  ) as Error & Record<string, unknown>;

  if (error && typeof error === 'object') {
    for (const [key, value] of Object.entries(error as Record<string, unknown>)) {
      if (key === 'message' || key === 'name' || key === 'stack') {
        continue;
      }
      normalizedError[key] = value;
    }

    normalizedError.originalError = error;
  }

  return normalizedError;
};

class Http {
  private readonly _instance: typeof http;

  constructor() {
    this._instance = http;
    this.setupInterceptors();
  }

  setupInterceptors(): void {
    this._instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (config.requireToken) {
          const token = storageService.getAccessToken();
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        return config;
      },
      (error: AxiosError) => Promise.reject(error),
    );

    this._instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as
          | (InternalAxiosRequestConfig & { _retry?: boolean })
          | undefined;

        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          const errorData = error.response.data as {
            errors?: Array<{ code?: number }>;
            code?: number;
          };
          let shouldRefresh = false;

          if (errorData?.errors && Array.isArray(errorData.errors)) {
            shouldRefresh = errorData.errors.some((err) => err.code === 1005);
          } else if (errorData?.code === 1005) {
            shouldRefresh = true;
          }

          if (shouldRefresh) {
            if (!refreshTokenPromise) {
              refreshTokenPromise = authApi
                .refreshToken()
                .then((response: RefreshTokenResponse) => {
                  const newAccessToken = response?.data?.data?.accessToken;
                  if (newAccessToken) {
                    console.log('✅ Token refresh successful');
                    storageService.setAccessToken(newAccessToken);
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('accessToken', newAccessToken);
                    }
                    dispatchTokenRefreshedEvent(newAccessToken);
                    return newAccessToken;
                  }
                  return Promise.reject(
                    new Error('Cannot get access token from refresh API'),
                  );
                })
                .catch((refreshError: unknown) => {
                  const normalizedRefreshError = normalizeRejectedError(
                    refreshError,
                    'Token refresh failed',
                  );
                  console.error(
                    '❌ Token refresh failed:',
                    normalizedRefreshError.message,
                  );
                  storageService.removeAccessToken();
                  if (logoutCallback) {
                    logoutCallback();
                  }
                  return Promise.reject(normalizedRefreshError);
                });

              // After the promise settles, clear the shared slot so subsequent
              // 401 responses can start a fresh refresh cycle.
              refreshTokenPromise.finally(() => {
                refreshTokenPromise = null;
              });
            }

            const tokenRefresh = refreshTokenPromise;
            if (!tokenRefresh) {
              return Promise.reject(
                normalizeRejectedError(
                  error.response?.data ?? error,
                  'Request failed',
                ),
              );
            }

            return tokenRefresh.then((accessToken) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              }
              return this._instance(originalRequest);
            });
          }
        }

        return Promise.reject(
          normalizeRejectedError(error.response?.data ?? error, 'Request failed'),
        );
      },
    );
  }

  get instance(): typeof http {
    return this._instance;
  }
}

export const httpService = new Http().instance;
