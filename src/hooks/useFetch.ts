"use client";

import { useState, useCallback } from "react";

type UseFetchOptions<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
};

/**
 * Custom fetch hook
 */
export function useFetch<T>() {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (url: string, options?: RequestInit, fetchOptions?: UseFetchOptions<T>) => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(url, options);
        if (!res.ok) throw new Error(res.statusText);
        const result = (await res.json()) as T;
        setData(result);
        fetchOptions?.onSuccess?.(result);
        return result;
      } catch (err) {
        const e = err instanceof Error ? err : new Error("Fetch failed");
        setError(e);
        fetchOptions?.onError?.(e);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { data, error, isLoading, execute };
}
