'use client';

import { useEffect } from 'react';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from '@/context/theme-context';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { initAuthStore, restoreSession } from '@/stores/auth-store';

/**
 * Registers token accessors and silently restores the previous session from the
 * HttpOnly refresh_token cookie. This runs once on app mount so staff-dashboard
 * pages get a populated `user` before they make their first API call.
 *
 * initAuthStore() MUST be called synchronously first so that the apiService
 * refresh logic has access to the Zustand setters before any API call is made.
 */
function AuthStoreBootstrap() {
  useEffect(() => {
    // Sync: wire up Zustand store into apiService
    initAuthStore();
    // Async: restore session silently (uses HttpOnly refresh_token cookie)
    void restoreSession();
  }, []);
  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AppProvider>
        <AuthProvider>
          <ThemeProvider>
            <AuthStoreBootstrap />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </AppProvider>
    </QueryProvider>
  );
}
