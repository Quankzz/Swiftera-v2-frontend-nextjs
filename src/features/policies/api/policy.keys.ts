/**
 * Policy query key factory — TanStack Query
 * Module 17: POLICIES
 */

export const policyKeys = {
  all: ['policies'] as const,

  lists: () => [...policyKeys.all, 'list'] as const,
  list: (params?: Record<string, unknown>) =>
    [...policyKeys.lists(), params ?? {}] as const,

  details: () => [...policyKeys.all, 'detail'] as const,
  detail: (policyDocumentId: string) =>
    [...policyKeys.details(), policyDocumentId] as const,
} as const;
