"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Dữ liệu được coi là fresh trong 3 phút — tránh refetch khi navigate qua lại
            staleTime: 3 * 60 * 1000,
            // Giữ cache trong 10 phút sau khi không còn observer
            gcTime: 10 * 60 * 1000,
            // Không refetch khi user focus window (tránh flicker)
            refetchOnWindowFocus: false,
            // Retry 1 lần sau khi thất bại (thay vì 3 lần default)
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

