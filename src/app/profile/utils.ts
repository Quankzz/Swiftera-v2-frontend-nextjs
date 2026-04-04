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
  if (error && typeof error === 'object') {
    const e = error as {
      message?: string;
      errors?: Array<{ message?: string }>;
    };
    const first = e.errors?.[0]?.message;
    if (first) return first;
    if (typeof e.message === 'string' && e.message.trim()) return e.message;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}
