import { Permission, PaginatedResponse } from '@/types/dashboard';
import { fetchApi } from '../apiService';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false'; // Default to true if not explicitly false

let MOCK_PERMISSIONS: Permission[] = [
  {
    permissionId: 'p1',
    name: 'Xem người dùng',
    apiPath: '/api/v1/users',
    method: 'GET',
    module: 'Users',
  },
  {
    permissionId: 'p2',
    name: 'Tạo người dùng',
    apiPath: '/api/v1/users',
    method: 'POST',
    module: 'Users',
  },
  {
    permissionId: 'p3',
    name: 'Sửa người dùng',
    apiPath: '/api/v1/users/:id',
    method: 'PATCH',
    module: 'Users',
  },
  {
    permissionId: 'p4',
    name: 'Xem vai trò',
    apiPath: '/api/v1/roles',
    method: 'GET',
    module: 'Roles',
  },
  {
    permissionId: 'p5',
    name: 'Phân quyền',
    apiPath: '/api/v1/roles/assign',
    method: 'POST',
    module: 'Roles',
  },
  {
    permissionId: 'p6',
    name: 'Xuất báo cáo',
    apiPath: '/api/v1/reports',
    method: 'GET',
    module: 'Khác',
  },
];

export const permissionsApi = {
  getPermissions: async (): Promise<PaginatedResponse<Permission>> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return { data: [...MOCK_PERMISSIONS], total: MOCK_PERMISSIONS.length };
    }
    return await fetchApi<PaginatedResponse<Permission>>(
      '/permissions?limit=1000',
    );
  },
  updatePermissionModule: async (
    permissionId: string,
    moduleName: string,
  ): Promise<boolean> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      MOCK_PERMISSIONS = MOCK_PERMISSIONS.map((p) =>
        p.permissionId === permissionId ? { ...p, module: moduleName } : p,
      );
      return true;
    }
    return true;
  },
};
