/**
 * Shared formatting utilities — used across dashboard pages and order components.
 * All functions are pure (no side-effects, no Date.now() internally in render).
 */

/** Format a number as Vietnamese Dong currency. */
export const fmt = (v: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    v,
  );

/** Format a date string as dd/mm/yyyy. */
export const fmtDate = (s: string): string =>
  new Date(s).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

/** Format a date string as dd/mm (no year) — for compact displays. */
export const fmtDateShort = (s: string): string =>
  new Date(s).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  });

/** Format an ISO datetime string as dd/mm/yyyy hh:mm. */
export const fmtDatetime = (s: string): string =>
  new Date(s).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

/**
 * Format an ISO timestamp as human-relative string (e.g. "3ph", "2h", "5d").
 * Requires `now` (from `Date.now()`) to be passed from the calling component so
 * this function stays pure and React-Compiler-safe.
 */
export const fmtRelative = (iso: string, now: number): string => {
  const m = Math.floor((now - new Date(iso).getTime()) / 60_000);
  if (m < 60) return `${m}ph`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};
