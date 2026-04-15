'use client';

import { useEffect } from 'react';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from '@/context/theme-context';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { restoreSession } from '@/stores/auth-store';

/**
 * On app mount, attempt a silent session restore from the HttpOnly
 * refresh_token cookie. This covers cold starts where localStorage has no
 * access token but the user still has a valid session cookie.
 *
 * Normal session bootstrap (when localStorage already has a token) is
 * handled inside AuthContext.
 */
function AuthStoreBootstrap() {
  useEffect(() => {
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
