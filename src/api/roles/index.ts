import { Role, PaginatedResponse } from '@/types/dashboard';
import { fetchApi } from '../apiService';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false'; // Default to true if not explicitly false

const MOCK_ROLES: Role[] = [
  {
    roleId: '1',
    name: 'Admin',
    description: 'Quản trị viên toàn hệ thống, toàn quyền',
    isActive: true,
  },
  {
    roleId: '2',
    name: 'Manager',
    description: 'Quản lý cửa hàng, duyệt đơn hàng',
    isActive: true,
  },
  {
    roleId: '3',
    name: 'User',
    description: 'Người dùng mặc định',
    isActive: true,
  },
  {
    roleId: '4',
    name: 'Guest',
    description: 'Tài khoản khách, bị khóa mặc định',
    isActive: false,
  },
];

export const rolesApi = {
  getRoles: async (page = 1, limit = 10): Promise<PaginatedResponse<Role>> => {
    if (USE_MOCK) {
      // Giả lập độ trễ mạng
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        data: MOCK_ROLES.slice((page - 1) * limit, page * limit),
        total: MOCK_ROLES.length,
      };
    }
    return await fetchApi<PaginatedResponse<Role>>(
      `/roles?page=${page}&limit=${limit}`,
    );
  },
};
