import { getApiErrorMessage as resolveApiErrorMessage } from "@/api/apiService";

/** `message` từ envelope JSON khi `success: true` (axios `response.data`). */
export function getApiSuccessMessage(
  envelope: { message?: string } | undefined,
  fallback: string,
): string {
  const m = envelope?.message?.trim();
  return m || fallback;
}

/** Lỗi từ axios interceptor (reject `response.data`) hoặc Error. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  return resolveApiErrorMessage(error, fallback);
}
