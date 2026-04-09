import type { AdminDashboardParams } from '../types';

export const dashboardKeys = {
  all: ['dashboards'] as const,
  admin: () => [...dashboardKeys.all, 'admin'] as const,
  adminOverview: (params?: AdminDashboardParams) =>
    [...dashboardKeys.admin(), params] as const,
};
