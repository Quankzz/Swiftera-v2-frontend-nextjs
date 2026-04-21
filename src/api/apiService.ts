import { httpService } from './http';
import {
  AppError,
  getApiErrorMessage as getApiErrorMessageInternal,
  parseErrorForForm,
  parseResponseError,
  toAppError,
  type ApiErrorDetail,
  type AppErrorCode,
} from '@/lib/error-handler';

const API_BASE_URL = 'https://swiftera.azurewebsites.net/api/v1';

export const API_BASE = API_BASE_URL;

export { AppError, parseErrorForForm };
export type { ApiErrorDetail, AppErrorCode };

/**
 * Map raw error (fetch Response hoặc Error) thành AppError.
 * Các module khác có thể import hàm này để dùng lại.
 */
export async function mapApiError(res: Response): Promise<AppError> {
  try {
    const body = await res.json();
    return parseResponseError(res.status, res.statusText, body);
  } catch {
    return parseResponseError(res.status, res.statusText, null);
  }
}

/**
 * Normalize bất kỳ error nào thành AppError.
 * Hữu ích trong catch block ở hooks/components.
 */
export function normalizeError(
  error: unknown,
  fallbackMessage?: string,
): AppError {
  return toAppError(error, fallbackMessage);
}

/** Resolve a user-facing error message from unknown thrown values. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  return getApiErrorMessageInternal(error, fallback);
}

export interface ApiRequestOptions {
  /** Query params - sẽ được serialize vào URL */
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
  return `?${searchParams.toString().replace(/\+/g, '%20')}`;
}

function mapAxiosError(error: unknown): AppError {
  return toAppError(error, 'Request failed');
}

async function request<T>(
  method: string,
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { params, body, headers: extraHeaders, signal, skipAuth } = options;

  const url = `${API_BASE_URL}${endpoint}${buildQueryString(params)}`;

  try {
    const response = await httpService.request<
      { success?: boolean; data?: T } | T
    >({
      method,
      url,
      data: body !== undefined ? body : undefined,
      headers: extraHeaders,
      signal,
      requireToken: !skipAuth,
    });

    // 204 No Content
    if (response.status === 204) return undefined as T;

    const json = response.data;

    // BE luôn bọc trong { success, message, data, meta }
    // Trả thẳng `data` cho tiện sử dụng
    if (json && typeof json === 'object' && 'success' in json) {
      return (json as { success: boolean; data: T }).data;
    }

    return json as T;
  } catch (error) {
    throw mapAxiosError(error);
  }
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
 * KHÔNG set Content-Type - để browser/Axios tự thêm boundary.
 */
export async function apiUpload<T>(
  endpoint: string,
  formData: FormData,
  options: Omit<ApiRequestOptions, 'body'> = {},
): Promise<T> {
  const { params, headers: extraHeaders, signal, skipAuth } = options;

  const url = `${API_BASE_URL}${endpoint}${buildQueryString(params)}`;

  try {
    const response = await httpService.request<
      { success?: boolean; data?: T } | T
    >({
      method: 'POST',
      url,
      data: formData,
      headers: extraHeaders, // Không override Content-Type - Axios/browser tự xử lý boundary
      signal,
      requireToken: !skipAuth,
    });

    if (response.status === 204) return undefined as T;

    const json = response.data;
    if (json && typeof json === 'object' && 'success' in json) {
      return (json as { success: boolean; data: T }).data;
    }
    return json as T;
  } catch (error) {
    throw mapAxiosError(error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy export - giữ tương thích với code cũ đang import fetchApi
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
