/**
 * Unified API client for https://swiftera.azurewebsites.net/api/v1
 *
 * Features:
 *  - Bearer token injected from in-memory auth store (zero-dependency import to avoid circular refs)
 *  - Transparent 401 → refresh → retry (one attempt)
 *  - credentials: 'include' so the browser sends/receives the HttpOnly refresh_token cookie
 *  - USE_MOCK flag for local development without a backend
 *
 * NOTE for auth team:
 *  Token storage is managed by `src/stores/auth-store.ts` (Zustand in-memory).
 *  The `getAccessToken` / `setAccessToken` hooks in that store are the ONLY
 *  place where the access token lives — do not duplicate it in localStorage.
 */

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  'https://swiftera.azurewebsites.net/api/v1';

export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// ─── Token accessor (lazy to avoid circular imports) ─────────────────────────
// The auth store sets this reference after initialisation.
let _getToken: (() => string | null) | null = null;
let _doRefresh: (() => Promise<string | null>) | null = null;

/** Called once by AuthProvider/auth-store to wire token access into the client. */
export function registerTokenAccessors(
  getToken: () => string | null,
  doRefresh: () => Promise<string | null>,
) {
  _getToken = getToken;
  _doRefresh = doRefresh;
}

// Deduplicates concurrent refresh attempts: all 401 requests wait on the same promise.
// refreshAuthToken() uses a raw fetch (not apiRequest) so there is no re-entrant loop.
let _pendingRefresh: Promise<string | null> | null = null;

// ─── Core request ─────────────────────────────────────────────────────────────

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown };

async function _fetch<T>(
  endpoint: string,
  options: RequestOptions,
  token: string | null,
): Promise<T> {
  const { body, headers: extraHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extraHeaders as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...rest,
    headers,
    credentials: 'include', // sends HttpOnly refresh_token cookie
    body: body !== undefined ? JSON.stringify(body) : undefined,
    // Always fresh for auth-sensitive data; callers can override via next
    cache: 'no-store',
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    const err = new Error(`API ${res.status}: ${msg}`);
    (err as Error & { status: number }).status = res.status;
    throw err;
  }

  // 204 No Content
  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = _getToken ? _getToken() : null;

  try {
    return await _fetch<T>(endpoint, options, token);
  } catch (err) {
    const status = (err as Error & { status?: number }).status;
    // On 401, attempt a single token refresh then retry.
    // _pendingRefresh deduplicates concurrent 401s so only one refresh call is
    // made even when multiple requests fail simultaneously.
    // NOTE: refreshAuthToken() must use a raw fetch (not apiRequest) to avoid
    //       re-entrant calls that would create an infinite refresh loop.
    if (status === 401 && _doRefresh) {
      if (!_pendingRefresh) {
        _pendingRefresh = _doRefresh().finally(() => {
          _pendingRefresh = null;
        });
      }
      const newToken = await _pendingRefresh;
      if (newToken) {
        return _fetch<T>(endpoint, options, newToken);
      }
    }
    throw err;
  }
}

// ─── Convenience helpers ──────────────────────────────────────────────────────

export function apiGet<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET' });
}

export function apiPost<T>(endpoint: string, body?: unknown): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'POST', body });
}

export function apiPatch<T>(endpoint: string, body: unknown): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'PATCH', body });
}

export function apiPut<T>(endpoint: string, body: unknown): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'PUT', body });
}

export function apiDelete<T>(endpoint: string, body?: unknown): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE', body });
}

/**
 * Returns mock data if USE_MOCK=true, otherwise calls the real API.
 * Usage: return mockOr('/some-endpoint', MOCK_DATA)
 */
export function mockOr<T>(endpoint: string, mockData: T): Promise<T> {
  if (USE_MOCK) return Promise.resolve(mockData);
  return apiGet<T>(endpoint);
}
