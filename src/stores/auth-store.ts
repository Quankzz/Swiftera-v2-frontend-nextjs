import { create } from 'zustand';
import { storageService } from '@/services/storage';
import type { UserSecuredResponse } from '@/types/api.types';

// ─── State shape ─────────────────────────────────────────────────────────────

interface AuthState {
  user: UserSecuredResponse | null;
  isAuthenticated: boolean;

  /** Called after successful login / verify-email / session restore. */
  setAuth: (token: string, user: UserSecuredResponse) => void;
  /** Called on logout or refresh failure. */
  clearAuth: () => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setAuth: (token, user) => {
    set({ user, isAuthenticated: true });
  },

  clearAuth: () => {
    set({ user: null, isAuthenticated: false });
  },
}));

export async function restoreSession(): Promise<void> {
  try {
    const { refreshAuthToken } = await import('@/api/auth/index');
    const res = await refreshAuthToken();
    if (res?.accessToken && res.userSecured) {
      storageService.setAccessToken(res.accessToken);
      useAuthStore.getState().setAuth(res.accessToken, res.userSecured);
    }
  } catch {
    // Not logged in — that's fine, leave the store empty
  }
}

// ─── Convenience selector-style helpers ──────────────────────────────────────

export const selectUser = (s: AuthState) => s.user;
export const selectIsAuthenticated = (s: AuthState) => s.isAuthenticated;
export const selectUserRoles = (s: AuthState) =>
  s.user?.rolesSecured.map((r) => r.name) ?? [];

/**
 * Checks whether the current user has a given role name.
 * e.g. useHasRole('STAFF')
 */
export function useHasRole(roleName: string): boolean {
  return useAuthStore(
    (s) => s.user?.rolesSecured.some((r) => r.name === roleName) ?? false,
  );
}
