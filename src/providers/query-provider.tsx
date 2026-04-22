"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 3 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <QueryClientScript queryClient={queryClient} />
      {children}
    </QueryClientProvider>
  );
}

function QueryClientScript({ queryClient }: { queryClient: QueryClient }) {
  if (typeof window !== "undefined") {
    (
      window as Window & { __swifteraQueryClient?: QueryClient }
    ).__swifteraQueryClient = queryClient;
  }
  return null;
}
