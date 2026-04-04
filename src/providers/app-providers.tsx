'use client';

import { QueryProvider } from './query-provider';
import { ThemeProvider } from '@/context/theme-context';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'sonner';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AppProvider>
        <AuthProvider>
          <ThemeProvider>
            {children}
            <Toaster richColors position='top-right' closeButton />
          </ThemeProvider>
        </AuthProvider>
      </AppProvider>
    </QueryProvider>
  );
}
