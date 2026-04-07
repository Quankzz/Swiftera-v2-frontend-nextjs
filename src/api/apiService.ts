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

/**
 * Lấy access token từ localStorage.
 * Module auth sẽ lưu token vào đây khi login/refresh thành công.
 */
function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
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
 */
async function request<T>(
  method: string,
  endpoint: string,
  options: ApiRequestOptions = {},
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
