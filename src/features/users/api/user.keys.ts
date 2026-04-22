/**
 * User query keys - dùng cho TanStack Query.
 * Tập trung tại đây để dễ invalidate và tránh duplicate.
 */

export const userKeys = {
  /** Root key cho toàn bộ users module */
  all: ["users"] as const,

  /** Users list (admin) - bao gồm params filter */
  lists: () => [...userKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) =>
    [...userKeys.lists(), params] as const,

  /** User detail by ID */
  details: () => [...userKeys.all, "detail"] as const,
  detail: (userId: string) => [...userKeys.details(), userId] as const,

  /** Profile (self - /auth/account) */
  profile: () => [...userKeys.all, "profile"] as const,

  /** Staff request */
  staffRequest: () => [...userKeys.all, "staff-request"] as const,
};
