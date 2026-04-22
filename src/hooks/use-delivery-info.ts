import { useState, useEffect, useCallback } from "react";

const SESSION_KEY = "swiftera_delivery_info";

interface DeliveryInfo {
  recipientName: string;
  phone: string;
  addressLine: string;
  ward: string;
  district: string;
  city: string;
}

const EMPTY: DeliveryInfo = {
  recipientName: "",
  phone: "",
  addressLine: "",
  ward: "",
  district: "",
  city: "",
};

function readFromSession(): DeliveryInfo {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<DeliveryInfo>;
    return { ...EMPTY, ...parsed };
  } catch {
    return EMPTY;
  }
}

function writeToSession(info: DeliveryInfo) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(info));
  } catch {
    // sessionStorage unavailable (private mode, storage full, etc.)
  }
}

/**
 * Persists delivery info in sessionStorage.
 * Values survive page refresh within the same tab but are cleared when the tab closes.
 */
export function useDeliveryInfo() {
  const [info, setInfo] = useState<DeliveryInfo>(EMPTY);

  // Hydrate from sessionStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setInfo(readFromSession());
  }, []);

  const update = useCallback((patch: Partial<DeliveryInfo>) => {
    setInfo((prev) => {
      const next = { ...prev, ...patch };
      writeToSession(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setInfo(EMPTY);
  }, []);

  return {
    ...info,
    setRecipientName: (v: string) => update({ recipientName: v }),
    setPhone: (v: string) => update({ phone: v }),
    setAddressLine: (v: string) => update({ addressLine: v }),
    setWard: (v: string) => update({ ward: v }),
    setDistrict: (v: string) => update({ district: v }),
    setCity: (v: string) => update({ city: v }),
    clearDeliveryInfo: clear,
  };
}
