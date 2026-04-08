/**
 * apiService.ts — Entry point chung để gọi API.
 *
 * BASEURL: https://swiftera.azurewebsites.net/api/v1
 *
 * Tất cả module (users, roles, permissions, orders…) đều gọi qua file này.
 * KHÔNG sử dụng client.ts — file đó do người khác quản lý.
 *
 * Bao gồm:
 *  - Reusable Error Handler (AppError, mapApiError)
 *  - HTTP methods: get, post, put, patch, delete (hỗ trợ body + query params)
 *  - Tự động gắn Authorization header nếu có token
 */

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE_URL = 'https://swiftera.azurewebsites.net/api/v1';

export const API_BASE = API_BASE_URL;
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// ─────────────────────────────────────────────────────────────────────────────
// Reusable Error Handler
// ─────────────────────────────────────────────────────────────────────────────

/** Error codes tương ứng HTTP status hoặc custom */
export type AppErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN';

/** Cấu trúc lỗi chuẩn — backend trả về trong mảng errors */
export interface ApiErrorDetail {
  code: number;
  message: string;
}

/** Kiểu lỗi thống nhất dùng xuyên suốt app */
export class AppError extends Error {
  public readonly errorCode: AppErrorCode;
  public readonly status: number;
  public readonly details: ApiErrorDetail[];

  constructor(
    errorCode: AppErrorCode,
    message: string,
    status: number = 0,
    details: ApiErrorDetail[] = [],
  ) {
    super(message);
    this.name = 'AppError';
    this.errorCode = errorCode;
    this.status = status;
    this.details = details;
  }
}

/** Map HTTP status → AppErrorCode */
function statusToCode(status: number): AppErrorCode {
  switch (status) {
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 422:
      return 'VALIDATION_ERROR';
    default:
      if (status >= 500) return 'SERVER_ERROR';
      return 'UNKNOWN';
  }
}

/**
 * Map raw error (fetch Response hoặc Error) thành AppError.
 * Các module khác có thể import hàm này để dùng lại.
 */
export async function mapApiError(res: Response): Promise<AppError> {
  const code = statusToCode(res.status);

  try {
    const body = await res.json();

    // BE spec: { success: false, errors: [{ code, message }], meta }
    if (body?.errors && Array.isArray(body.errors)) {
      const firstMsg =
        body.errors[0]?.message ?? `HTTP ${res.status}: ${res.statusText}`;
      return new AppError(code, firstMsg, res.status, body.errors);
    }

    // Fallback nếu body có message
    const msg = body?.message ?? `HTTP ${res.status}: ${res.statusText}`;
    return new AppError(code, msg, res.status);
  } catch {
    return new AppError(
      code,
      `HTTP ${res.status}: ${res.statusText}`,
      res.status,
    );
  }
}

/**
 * Normalize bất kỳ error nào thành AppError.
 * Hữu ích trong catch block ở hooks/components.
 */
export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return new AppError(
      'NETWORK_ERROR',
      'Không thể kết nối đến server. Vui lòng kiểm tra mạng.',
    );
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return new AppError('TIMEOUT', 'Yêu cầu đã hết thời gian chờ.');
  }

  if (error instanceof Error) {
    return new AppError('UNKNOWN', error.message);
  }

  return new AppError('UNKNOWN', 'Đã xảy ra lỗi không xác định.');
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth Token Helper
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Token accessor registration
// ─────────────────────────────────────────────────────────────────────────────

let _getToken: (() => string | null) | null = null;
let _setToken: ((token: string, user: unknown) => void) | null = null;
let _clearAuth: (() => void) | null = null;

/**
 * Register Zustand store accessors so apiService can:
 *  - read the current in-memory token (getToken)
 *  - update the store after a silent refresh (setToken)
 *  - clear auth on unrecoverable 401 (clearAuth)
 *
 * Call this during app bootstrap (e.g. inside auth-store.ts initAuthStore).
 */
export function registerTokenAccessors(
  getToken: () => string | null,
  setToken?: (token: string, user: unknown) => void,
  clearAuth?: () => void,
): void {
  _getToken = getToken;
  _setToken = setToken ?? null;
  _clearAuth = clearAuth ?? null;
}

function getAccessToken(): string | null {
  // 1. Prefer in-memory Zustand token (most up-to-date, set after login / refresh)
  const storeToken = _getToken?.();
  if (storeToken) return storeToken;
  // 2. Fallback: localStorage token populated by the existing Axios/AuthContext auth system
  //    This covers the brief window before Zustand is hydrated on page load.
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
}

// ─── Silent token refresh ─────────────────────────────────────────────────────
// Singleton promise: if multiple concurrent requests get a 401 simultaneously,
// only one refresh call is made and all waiters share the result.

let _refreshPromise: Promise<{ token: string; user?: unknown } | null> | null =
  null;

/**
 * Silently refresh the access token via the httpOnly cookie.
 * Returns both the new token AND the updated user (if available).
 *
 * Multiple concurrent 401s will share a single refresh request (singleton pattern).
 * All waiters get the same result, then each retry their original request.
 */
async function silentRefresh(): Promise<{
  token: string;
  user?: unknown;
} | null> {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (!res.ok) {
        console.warn('[silentRefresh] refresh endpoint returned', res.status);
        return null;
      }

      const body: { data?: { accessToken?: string; userSecured?: unknown } } =
        await res.json();
      const newToken = body?.data?.accessToken ?? null;

      if (!newToken) {
        console.warn('[silentRefresh] no accessToken in response');
        return null;
      }

      // Always update localStorage immediately so concurrent requests can read new token
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', newToken);
        console.log(
          '[silentRefresh] token refreshed, length:',
          newToken.length,
        );
      }

      // Also sync to Zustand store if available
      const user = body.data?.userSecured;
      if (_setToken && user) {
        _setToken(newToken, user);
      }

      return { token: newToken, user };
    } catch (error) {
      console.error(
        '[silentRefresh] failed:',
        error instanceof Error ? error.message : error,
      );
      return null;
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core Request Function
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiRequestOptions {
  /** Query params — sẽ được serialize vào URL */
  params?: Record<string, string | number | boolean | undefined | null>;
  /** Request body (sẽ JSON.stringify) */
  body?: unknown;
  /** Extra headers */
  headers?: Record<string, string>;
  /** Override AbortSignal nếu cần timeout */
  signal?: AbortSignal;
  /** Bỏ qua auto-attach auth header */
  skipAuth?: boolean;
}

/** Response wrapper chuẩn từ BE */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    timestamp: string;
    instance: string;
  };
}

/** Pagination meta từ BE */
export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/** Paginated data wrapper từ BE */
export interface PaginatedData<T> {
  meta: PaginationMeta;
  content: T[];
}

/**
 * Serialize params object thành query string.
 * Bỏ qua undefined/null values.
 */
function buildQueryString(
  params?: Record<string, string | number | boolean | undefined | null>,
): string {
  if (!params) return '';
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null,
  );
  if (entries.length === 0) return '';
  const searchParams = new URLSearchParams();
  for (const [key, value] of entries) {
    searchParams.append(key, String(value));
  }
  return `?${searchParams.toString()}`;
}

/**
 * Core fetch wrapper — tất cả method đều đi qua đây.
 *
 * @returns Parsed JSON body (unwrapped `data` nếu BE trả wrapper chuẩn).
 *
 * 401 handling:
 *  1. If response is 401 and not a retry, attempt silent token refresh.
 *  2. If refresh succeeds, retry the original request exactly ONCE with new token.
 *  3. If refresh fails, clear auth and throw 401 error.
 *
 * Token sync: After refresh succeeds, we fetch the new token before retry
 * to ensure the in-memory token is synchronized with backend state.
 */
async function request<T>(
  method: string,
  endpoint: string,
  options: ApiRequestOptions = {},
  _isRetry = false,
): Promise<T> {
  const { params, body, headers: extraHeaders, signal, skipAuth } = options;

  const url = `${API_BASE_URL}${endpoint}${buildQueryString(params)}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  // Auto-attach Authorization header
  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let res: Response;

  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
      credentials: 'include', // Gửi cookie (refresh_token)
    });
  } catch (error) {
    throw normalizeError(error);
  }

  // Successful response
  if (res.ok) {
    // 204 No Content
    if (res.status === 204) return undefined as T;

    const json = await res.json();

    // BE luôn bọc trong { success, message, data, meta }
    // Trả thẳng `data` cho tiện sử dụng
    if (json && typeof json === 'object' && 'success' in json) {
      return json.data as T;
    }

    return json as T;
  }

  // ── 401 handling: attempt silent token refresh then retry once ──────────────
  if (res.status === 401 && !skipAuth && !_isRetry) {
    console.log('[request] got 401, attempting silent refresh...');

    // Attempt refresh: this is a singleton promise, so concurrent 401s
    // will all wait for the same refresh attempt
    const refreshResult = await silentRefresh();

    if (refreshResult?.token) {
      console.log('[request] refresh succeeded, retrying with new token');
      // CRITICAL: After refresh, retry the original request
      // The new token is now in localStorage and Zustand, so getAccessToken()
      // will return the fresh token in the next request() call
      return request<T>(method, endpoint, options, true);
    }

    // Refresh failed — clear auth and throw so UI redirects to login
    console.warn('[request] refresh failed, clearing auth');
    _clearAuth?.();
    throw await mapApiError(res);
  }

  // Error response — map thành AppError
  throw await mapApiError(res);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public HTTP Methods
// ─────────────────────────────────────────────────────────────────────────────

/** GET request */
export function apiGet<T>(
  endpoint: string,
  options?: ApiRequestOptions,
): Promise<T> {
  return request<T>('GET', endpoint, options);
}

/** POST request */
export function apiPost<T>(
  endpoint: string,
  body?: unknown,
  options?: ApiRequestOptions,
): Promise<T> {
  return request<T>('POST', endpoint, { ...options, body });
}

/** PUT request */
export function apiPut<T>(
  endpoint: string,
  body?: unknown,
  options?: ApiRequestOptions,
): Promise<T> {
  return request<T>('PUT', endpoint, { ...options, body });
}

/** PATCH request */
export function apiPatch<T>(
  endpoint: string,
  body?: unknown,
  options?: ApiRequestOptions,
): Promise<T> {
  return request<T>('PATCH', endpoint, { ...options, body });
}

/** DELETE request (hỗ trợ body nếu API cần, vd: xóa roles khỏi user) */
export function apiDelete<T>(
  endpoint: string,
  body?: unknown,
  options?: ApiRequestOptions,
): Promise<T> {
  return request<T>('DELETE', endpoint, { ...options, body });
}

// ─────────────────────────────────────────────────────────────────────────────
// File Upload
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Upload file(s) qua multipart/form-data.
 * Dùng cho module files (Azure Blob Storage).
 *
 * KHÔNG set Content-Type — để browser tự thêm boundary.
 */
export async function apiUpload<T>(
  endpoint: string,
  formData: FormData,
  options: Omit<ApiRequestOptions, 'body'> = {},
): Promise<T> {
  const { params, headers: extraHeaders, signal, skipAuth } = options;

  const url = `${API_BASE_URL}${endpoint}${buildQueryString(params)}`;

  const headers: Record<string, string> = {
    // KHÔNG có Content-Type — FormData tự xử lý
    ...extraHeaders,
  };

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      signal,
      credentials: 'include',
    });
  } catch (error) {
    throw normalizeError(error);
  }

  if (res.ok) {
    if (res.status === 204) return undefined as T;
    const json = await res.json();
    if (json && typeof json === 'object' && 'success' in json) {
      return json.data as T;
    }
    return json as T;
  }

  throw await mapApiError(res);
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Return mockData immediately when USE_MOCK=true,
 * otherwise perform a real GET request.
 */
export async function mockOr<T>(endpoint: string, mockData: T): Promise<T> {
  if (USE_MOCK) return Promise.resolve(mockData);
  return apiGet<T>(endpoint);
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy export — giữ tương thích với code cũ đang import fetchApi
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @deprecated Dùng apiGet / apiPost / ... thay thế.
 * Giữ lại để code cũ không bị break ngay.
 */
export async function fetchApi<T>(
  endpoint: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!res.ok) {
    throw await mapApiError(res);
  }

  return res.json();
}
