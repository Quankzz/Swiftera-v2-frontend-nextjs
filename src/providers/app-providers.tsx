"use client";

import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "@/context/theme-context";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AppProvider>
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </AppProvider>
    </QueryProvider>
  );
}
