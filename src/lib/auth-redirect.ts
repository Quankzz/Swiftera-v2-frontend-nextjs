export const CUSTOMER_LOGIN_PATH = '/auth/login';

function safelyDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function normalizeRedirectPath(
  redirectPath?: string | null,
): string | null {
  if (!redirectPath) return null;

  const decoded = safelyDecode(redirectPath).trim();
  if (!decoded.startsWith('/') || decoded.startsWith('//')) {
    return null;
  }

  // Avoid redirect loops to the login page itself.
  if (decoded.startsWith(CUSTOMER_LOGIN_PATH)) {
    return '/';
  }

  return decoded;
}

export function getCurrentPathWithSearch(fallback = '/'): string {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const pathname = window.location.pathname || '';
  const search = window.location.search || '';
  const hash = window.location.hash || '';
  const full = `${pathname}${search}${hash}`;

  return normalizeRedirectPath(full) ?? fallback;
}

export function buildLoginHref(redirectPath?: string | null): string {
  const target = normalizeRedirectPath(redirectPath) ?? '/';
  return `${CUSTOMER_LOGIN_PATH}?redirect=${encodeURIComponent(target)}`;
}
