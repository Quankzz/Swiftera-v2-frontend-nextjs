/**
 * File query keys - dùng cho TanStack Query.
 *
 * Files module chủ yếu là mutations (upload/delete/move),
 * nhưng key vẫn cần để invalidate nếu sau này có list files.
 */

export const fileKeys = {
  all: ["files"] as const,
};
