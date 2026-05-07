/**
 * Shared formatting utilities - used across dashboard pages and order components.
 * All functions are pure (no side-effects, no Date.now() internally in render).
 */

/** Format a number as Vietnamese Dong currency. */
export const fmt = (v: number): string =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    v,
  );

/** Format a date string as dd/mm/yyyy. Returns '-' for empty/invalid input. */
export const fmtDate = (s: string | null | undefined): string => {
  if (!s) return "-";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/** Format an ISO datetime string as dd/mm/yyyy hh:mm. Returns '-' for empty/invalid. */
export const fmtDatetime = (s: string | null | undefined): string => {
  if (!s) return "-";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Parse backend date strings that may contain an AM/PM suffix.
 * Backend trả format: "2026-04-07 20:22:35 PM" - JS không parse được do
 * vừa có 24h clock vừa có AM/PM. Strip suffix trước khi parse.
 *
 * Ví dụ: "2026-04-07 20:22:35 PM" → new Date("2026-04-07 20:22:35") → OK
 */
export const parseBackendDate = (s: string): Date =>
  new Date(s.replace(/\s*(AM|PM)$/i, ""));

/** Format backend date string (có thể có AM/PM) → dd/mm/yyyy. Returns '-' for empty/invalid. */
export const fmtBackendDate = (s: string | null | undefined): string => {
  if (!s) return "-";
  return parseBackendDate(s).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/** Format backend date string (có thể có AM/PM) → dd/mm/yyyy hh:mm. Returns '-' for empty/invalid. */
export const fmtBackendDatetime = (s: string | null | undefined): string => {
  if (!s) return "-";
  return parseBackendDate(s).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Format Vietnamese phone number for display.
 * Backend trả về: "+84 ..." hoặc "0..."
 * Hiển thị: "0..." (format thân thiện với người Việt).
 * Returns '-' for empty/null.
 */
export const fmtPhone = (phone: string | null | undefined): string => {
  if (!phone) return "-";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("84") && cleaned.length > 2) {
    return `0${cleaned.slice(2)}`;
  }
  return phone.startsWith("0") ? phone : cleaned;
};

export const fmtRelative = (iso: string, now: number): string => {
  const m = Math.floor((now - new Date(iso).getTime()) / 60_000);
  if (m < 60) return `${m}ph`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};
