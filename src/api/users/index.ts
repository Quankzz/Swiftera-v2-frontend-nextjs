import { User, PaginatedResponse } from '@/types/dashboard';
import { fetchApi } from '../apiService'; // Tận dụng apiService có sẵn của Swiftera

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false'; // Default to true if not explicitly false

const MOCK_USERS: User[] = [
  {
    userId: 'u1',
    email: 'admin@swiftera.com',
    fullName: 'Quản trị viên',
    phoneNumber: '0123456789',
    avatarUrl: null,
    isVerified: true,
  },
  {
    userId: 'u2',
    email: 'test@swiftera.com',
    fullName: 'Người dùng Test',
    phoneNumber: null,
    avatarUrl: null,
    isVerified: false,
  },
];

export const usersApi = {
  getUsers: async (page = 1, limit = 10): Promise<PaginatedResponse<User>> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        data: MOCK_USERS.slice((page - 1) * limit, page * limit),
        total: MOCK_USERS.length,
      };
    }
    const res = await fetchApi<PaginatedResponse<User>>(
      `/users?page=${page}&limit=${limit}`,
    );
    return res;
  },
};
