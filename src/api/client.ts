/**
 * Base API client.
 * Set NEXT_PUBLIC_USE_MOCK=false in .env to switch to real API.
 * Default: uses mock data so the UI works without a backend.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://api.swiftera.vn/v1';
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

export { USE_MOCK, API_BASE };

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown };

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, ...rest } = options;
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...rest.headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${msg}`);
  }

  return res.json() as Promise<T>;
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET' });
}

export async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'POST', body });
}

export async function apiPatch<T>(endpoint: string, body: unknown): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'PATCH', body });
}

export async function apiPut<T>(endpoint: string, body: unknown): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'PUT', body });
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
}

/**
 * Returns mock data immediately, or calls real API if USE_MOCK=false.
 * Usage: return mockOr('/orders', MOCK_ORDERS)
 */
export function mockOr<T>(endpoint: string, mockData: T): Promise<T> {
  if (USE_MOCK) return Promise.resolve(mockData);
  return apiGet<T>(endpoint);
}
