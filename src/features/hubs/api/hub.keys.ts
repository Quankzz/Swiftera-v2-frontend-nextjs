/**
 * Hub query key factory — TanStack Query
 * Module 6: HUBS (API-040 → API-044)
 */

export const hubKeys = {
  /** Root key cho toàn bộ hub queries */
  all: ['hubs'] as const,

  /** Key cho danh sách (có thể kèm params) */
  lists: () => [...hubKeys.all, 'list'] as const,
  list: (params?: Record<string, unknown>) =>
    [...hubKeys.lists(), params ?? {}] as const,

  /** Key cho chi tiết 1 hub */
  details: () => [...hubKeys.all, 'detail'] as const,
  detail: (hubId: string) => [...hubKeys.details(), hubId] as const,
} as const;
