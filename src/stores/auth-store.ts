/**
 * In-memory auth store (Zustand).
 *
 * Design principles for easy merge by the auth owner:
 *  - access token lives ONLY here (never localStorage/sessionStorage)
 *  - refresh_token is HttpOnly cookie managed entirely by the browser/backend
 *  - `registerTokenAccessors` wires this store into the API client
 *  - Auth owner can replace `login/logout/refreshToken` implementations
 *    freely without touching any other file
 */

import { create } from 'zustand';
import { registerTokenAccessors } from '@/api/apiService';
import type {
  UserSecuredResponse,
  AuthenticationResponse,
} from '@/types/api.types';

// ─── State shape ─────────────────────────────────────────────────────────────

interface AuthState {
  accessToken: string | null;
  user: UserSecuredResponse | null;
  isAuthenticated: boolean;

  /** Called after successful login / verify-email / refresh. */
  setAuth: (token: string, user: UserSecuredResponse) => void;
  /** Called on logout or refresh failure. */
  clearAuth: () => void;

  /** Internal — used by API client to read the current token. */
  getAccessToken: () => string | null;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  setAuth: (token, user) => {
    set({ accessToken: token, user, isAuthenticated: true });
  },

  clearAuth: () => {
    set({ accessToken: null, user: null, isAuthenticated: false });
  },

  getAccessToken: () => get().accessToken,
}));

export function initAuthStore() {
  registerTokenAccessors(() => useAuthStore.getState().accessToken);
}

export async function restoreSession(): Promise<void> {
  try {
    const { refreshAuthToken } = await import('@/api/auth/index');
    const res = await refreshAuthToken();
    if (res?.accessToken && res.userSecured) {
      useAuthStore.getState().setAuth(res.accessToken, res.userSecured);
    }
  } catch {
    // Not logged in — that's fine, leave the store empty
  }
}

// ─── Convenience selector-style helpers (for auth owner to use in components)

export const selectUser = (s: AuthState) => s.user;
export const selectIsAuthenticated = (s: AuthState) => s.isAuthenticated;
export const selectUserRoles = (s: AuthState) =>
  s.user?.rolesSecured.map((r) => r.name) ?? [];

/**
 * Checks whether the current user has a given role name.
 * e.g. hasRole('STAFF_ROLE')
 */
export function useHasRole(roleName: string): boolean {
  return useAuthStore(
    (s) => s.user?.rolesSecured.some((r) => r.name === roleName) ?? false,
  );
}

// Keep AuthenticationResponse re-exported for auth consumers
export type { AuthenticationResponse };
