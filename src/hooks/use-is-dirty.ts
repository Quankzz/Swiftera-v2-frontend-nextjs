"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Simple hook to detect whether `current` differs from `initial`.
 * Uses JSON.stringify for deep-ish comparison — good for form state objects.
 */
export function useIsDirty(initial: unknown, current: unknown) {
  const initialJson = useRef<string>(JSON.stringify(initial ?? null));
  const [isDirty, setIsDirty] = useState(() =>
    JSON.stringify(current) !== initialJson.current,
  );

  useEffect(() => {
    // update baseline when initial changes (e.g. fresh data loaded)
    initialJson.current = JSON.stringify(initial ?? null);
    setIsDirty(JSON.stringify(current) !== initialJson.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  useEffect(() => {
    setIsDirty(JSON.stringify(current) !== initialJson.current);
  }, [current]);

  return isDirty;
}

export default useIsDirty;
