import {
  CreateUserInput,
  PaginatedResponse,
  UpdateUserInput,
  User,
  UserListParams,
} from '@/types/dashboard';
import { fetchApi } from '../apiService';

type DataMode = 'mock' | 'api';
const DATA_MODE = (process.env.NEXT_PUBLIC_DATA_MODE as DataMode) || 'mock';
const USE_MOCK = DATA_MODE === 'mock';

// Role lookup (mirrors mockRoles in roles/index.ts - kept in sync by roleId)
const MOCK_ROLE_MAP: Record<string, { roleId: string; name: string }> = {
  '1': { roleId: '1', name: 'Admin' },
  '2': { roleId: '2', name: 'Manager' },
  '3': { roleId: '3', name: 'User' },
  '4': { roleId: '4', name: 'Guest' },
};

// In-memory mock store
let mockUsers: User[] = [
  {
    userId: 'u1',
    email: 'admin@swiftera.com',
    fullName: 'Quản trị viên',
    phoneNumber: '0123456789',
    avatarUrl: null,
    isVerified: true,
    lastLoginAt: '2026-03-25T08:12:00.000Z',
    roles: [MOCK_ROLE_MAP['1'], MOCK_ROLE_MAP['2'], MOCK_ROLE_MAP['3']],
  },
  {
    userId: 'u2',
    email: 'test@swiftera.com',
    fullName: 'Người dùng Test',
    phoneNumber: null,
    avatarUrl: null,
    isVerified: false,
    lastLoginAt: null,
    roles: [MOCK_ROLE_MAP['3']],
  },
  {
    userId: 'u3',
    email: 'nam.nguyen@example.com',
    fullName: 'Nguyễn Văn Nam',
    phoneNumber: '0901234567',
    avatarUrl: null,
    isVerified: true,
    lastLoginAt: '2026-03-24T14:30:00.000Z',
    roles: [MOCK_ROLE_MAP['3']],
  },
  {
    userId: 'u4',
    email: 'lan.tran@example.com',
    fullName: 'Trần Thị Lan',
    phoneNumber: '0912345678',
    avatarUrl: null,
    isVerified: true,
    lastLoginAt: '2026-03-23T09:45:00.000Z',
    roles: [MOCK_ROLE_MAP['2'], MOCK_ROLE_MAP['3']],
  },
  {
    userId: 'u5',
    email: 'minh.le@example.com',
    fullName: 'Lê Văn Minh',
    phoneNumber: null,
    avatarUrl: null,
    isVerified: false,
    lastLoginAt: '2026-03-20T16:00:00.000Z',
    roles: [],
  },
  {
    userId: 'u6',
    email: 'huong.pham@example.com',
    fullName: 'Phạm Thị Hương',
    phoneNumber: '0923456789',
    avatarUrl: null,
    isVerified: true,
    lastLoginAt: '2026-03-22T11:20:00.000Z',
    roles: [MOCK_ROLE_MAP['3']],
  },
  {
    userId: 'u7',
    email: 'duc.hoang@example.com',
    fullName: 'Hoàng Văn Đức',
    phoneNumber: '0934567890',
    avatarUrl: null,
    isVerified: false,
    lastLoginAt: null,
    roles: [MOCK_ROLE_MAP['4']],
  },
  {
    userId: 'u8',
    email: 'linh.vu@example.com',
    fullName: 'Vũ Thị Linh',
    phoneNumber: null,
    avatarUrl: null,
    isVerified: true,
    lastLoginAt: '2026-03-21T07:55:00.000Z',
    roles: [MOCK_ROLE_MAP['3']],
  },
  {
    userId: 'u9',
    email: 'thanh.do@example.com',
    fullName: 'Đỗ Thanh Tùng',
    phoneNumber: '0945678901',
    avatarUrl: null,
    isVerified: false,
    lastLoginAt: null,
    roles: [],
  },
  {
    userId: 'u10',
    email: 'mai.bui@example.com',
    fullName: 'Bùi Thị Mai',
    phoneNumber: '0956789012',
    avatarUrl: null,
    isVerified: true,
    lastLoginAt: '2026-03-19T13:10:00.000Z',
    roles: [MOCK_ROLE_MAP['3']],
  },
  {
    userId: 'u11',
    email: 'khoa.ngo@example.com',
    fullName: 'Ngô Minh Khoa',
    phoneNumber: '0967890123',
    avatarUrl: null,
    isVerified: true,
    lastLoginAt: '2026-03-18T10:00:00.000Z',
    roles: [MOCK_ROLE_MAP['2']],
  },
  {
    userId: 'u12',
    email: 'thuy.dang@example.com',
    fullName: 'Đặng Thị Thùy',
    phoneNumber: null,
    avatarUrl: null,
    isVerified: false,
    lastLoginAt: null,
    roles: [],
  },
  {
    userId: 'u13',
    email: 'long.cao@example.com',
    fullName: 'Cao Đình Long',
    phoneNumber: '0978901234',
    avatarUrl: null,
    isVerified: true,
    lastLoginAt: '2026-03-17T15:30:00.000Z',
    roles: [MOCK_ROLE_MAP['3']],
  },
  {
    userId: 'u14',
    email: 'hoa.dinh@example.com',
    fullName: 'Đinh Thị Hoa',
    phoneNumber: '0989012345',
    avatarUrl: null,
    isVerified: false,
    lastLoginAt: null,
    roles: [MOCK_ROLE_MAP['4']],
  },
  {
    userId: 'u15',
    email: 'son.truong@example.com',
    fullName: 'Trương Văn Sơn',
    phoneNumber: null,
    avatarUrl: null,
    isVerified: true,
    lastLoginAt: '2026-03-16T08:45:00.000Z',
    roles: [MOCK_ROLE_MAP['3']],
  },
  {
    userId: 'u16',
    email: 'yen.ly@example.com',
    fullName: 'Lý Thị Yến',
    phoneNumber: '0990123456',
    avatarUrl: null,
    isVerified: false,
    lastLoginAt: null,
    roles: [],
  },
  {
    userId: 'u17',
    email: 'tuan.ha@example.com',
    fullName: 'Hà Anh Tuấn',
    phoneNumber: '0901357924',
    avatarUrl: null,
    isVerified: true,
    lastLoginAt: '2026-03-15T12:00:00.000Z',
    roles: [MOCK_ROLE_MAP['2'], MOCK_ROLE_MAP['3']],
  },
  {
    userId: 'u18',
    email: 'nga.luong@example.com',
    fullName: 'Lương Thị Nga',
    phoneNumber: null,
    avatarUrl: null,
    isVerified: true,
    lastLoginAt: '2026-03-14T09:20:00.000Z',
    roles: [MOCK_ROLE_MAP['3']],
  },
  {
    userId: 'u19',
    email: 'phuc.to@example.com',
    fullName: 'Tô Văn Phúc',
    phoneNumber: '0912468135',
    avatarUrl: null,
    isVerified: false,
    lastLoginAt: null,
    roles: [],
  },
  {
    userId: 'u20',
    email: 'tam.duong@example.com',
    fullName: 'Dương Thị Tâm',
    phoneNumber: '0923579246',
    avatarUrl: null,
    isVerified: true,
    lastLoginAt: '2026-03-13T17:40:00.000Z',
    roles: [MOCK_ROLE_MAP['3']],
  },
  {
    userId: 'u21',
    email: 'cuong.phan@example.com',
    fullName: 'Phan Văn Cường',
    phoneNumber: null,
    avatarUrl: null,
    isVerified: true,
    lastLoginAt: '2026-03-12T11:05:00.000Z',
    roles: [MOCK_ROLE_MAP['3']],
  },
  {
    userId: 'u22',
    email: 'nhung.vo@example.com',
    fullName: 'Võ Thị Nhung',
    phoneNumber: '0934681357',
    avatarUrl: null,
    isVerified: false,
    lastLoginAt: null,
    roles: [MOCK_ROLE_MAP['4']],
  },
  {
    userId: 'u23',
    email: 'bien.mac@example.com',
    fullName: 'Mạc Đình Biên',
    phoneNumber: '0945792468',
    avatarUrl: null,
    isVerified: true,
    lastLoginAt: '2026-03-11T14:15:00.000Z',
    roles: [MOCK_ROLE_MAP['3']],
  },
  {
    userId: 'u24',
    email: 'thu.trinh@example.com',
    fullName: 'Trịnh Thị Thu',
    phoneNumber: null,
    avatarUrl: null,
    isVerified: false,
    lastLoginAt: null,
    roles: [],
  },
  {
    userId: 'u25',
    email: 'hung.dam@example.com',
    fullName: 'Đàm Văn Hùng',
    phoneNumber: '0956803579',
    avatarUrl: null,
    isVerified: true,
    lastLoginAt: '2026-03-10T08:30:00.000Z',
    roles: [MOCK_ROLE_MAP['2']],
  },
  {
    userId: 'u26',
    email: 'mai.lam@example.com',
    fullName: 'Lâm Thị Mai Anh',
    phoneNumber: '0967914680',
    avatarUrl: null,
    isVerified: false,
    lastLoginAt: null,
    roles: [],
  },
  {
    userId: 'u27',
    email: 'kien.tong@example.com',
    fullName: 'Tống Thành Kiên',
    phoneNumber: null,
    avatarUrl: null,
    isVerified: true,
    lastLoginAt: '2026-03-09T16:50:00.000Z',
    roles: [MOCK_ROLE_MAP['3']],
  },
];

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export interface UsersRepository {
  list(params?: UserListParams): Promise<PaginatedResponse<User>>;
  get(userId: string): Promise<User>;
  create(payload: CreateUserInput): Promise<User>;
  update(userId: string, payload: UpdateUserInput): Promise<User>;
  remove(userId: string): Promise<{ success: boolean }>;
  assignRoles(userId: string, roleIds: string[]): Promise<User>;
}

const mockUsersRepository: UsersRepository = {
  async list(params = {}) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const search = params.search?.toLowerCase().trim();

    let filtered = mockUsers;
    if (search) {
      filtered = mockUsers.filter(
        (u) =>
          u.fullName.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          (u.phoneNumber || '').toLowerCase().includes(search),
      );
    }

    await delay();
    return {
      data: filtered.slice((page - 1) * limit, page * limit),
      total: filtered.length,
    };
  },

  async get(userId) {
    await delay();
    const found = mockUsers.find((u) => u.userId === userId);
    if (!found) {
      throw new Error('Không tìm thấy người dùng');
    }
    return found;
  },

  async create(payload) {
    await delay();
    const roleObjs = (payload.roleIds ?? [])
      .map((id) => MOCK_ROLE_MAP[id])
      .filter(Boolean);
    const newUser: User = {
      userId: crypto.randomUUID(),
      email: payload.email,
      fullName: payload.fullName,
      phoneNumber: payload.phoneNumber ?? null,
      avatarUrl: payload.avatarUrl ?? null,
      isVerified: payload.isVerified,
      lastLoginAt: null,
      roles: roleObjs,
    };
    mockUsers = [newUser, ...mockUsers];
    return newUser;
  },

  async update(userId, payload) {
    await delay();
    const existing = mockUsers.find((u) => u.userId === userId);
    if (!existing) throw new Error('Không tìm thấy người dùng');

    const roleObjs =
      payload.roleIds !== undefined
        ? payload.roleIds.map((id: string) => MOCK_ROLE_MAP[id]).filter(Boolean)
        : existing.roles;

    const updated: User = {
      ...existing,
      ...payload,
      phoneNumber: payload.phoneNumber ?? existing.phoneNumber,
      avatarUrl: payload.avatarUrl ?? existing.avatarUrl,
      isVerified: payload.isVerified ?? existing.isVerified,
      roles: roleObjs,
    };
    mockUsers = mockUsers.map((u) => (u.userId === userId ? updated : u));
    return updated;
  },

  async remove(userId) {
    await delay();
    mockUsers = mockUsers.filter((u) => u.userId !== userId);
    return { success: true };
  },

  async assignRoles(userId, roleIds) {
    await delay();
    const existing = mockUsers.find((u) => u.userId === userId);
    if (!existing) throw new Error('Không tìm thấy người dùng');
    const roles = roleIds.map((id) => MOCK_ROLE_MAP[id]).filter(Boolean);
    const updated: User = { ...existing, roles };
    mockUsers = mockUsers.map((u) => (u.userId === userId ? updated : u));
    return updated;
  },
};

const apiUsersRepository: UsersRepository = {
  async list(params = {}) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const search = params.search
      ? `&search=${encodeURIComponent(params.search)}`
      : '';
    return fetchApi<PaginatedResponse<User>>(
      `/users?page=${page}&limit=${limit}${search}`,
    );
  },

  async get(userId) {
    return fetchApi<User>(`/users/${userId}`);
  },

  async create(payload) {
    return fetchApi<User>(`/users`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(userId, payload) {
    return fetchApi<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async remove(userId) {
    return fetchApi<{ success: boolean }>(`/users/${userId}`, {
      method: 'DELETE',
    });
  },

  async assignRoles(userId, roleIds) {
    return fetchApi<User>(`/users/${userId}/roles`, {
      method: 'PUT',
      body: JSON.stringify({ roleIds }),
    });
  },
};

export const usersRepository: UsersRepository = USE_MOCK
  ? mockUsersRepository
  : apiUsersRepository;

// Backward compatible API surface
export const usersApi = {
  getUsers: (page = 1, limit = 10) => usersRepository.list({ page, limit }),
  getUserById: (userId: string) => usersRepository.get(userId),
  createUser: (payload: CreateUserInput) => usersRepository.create(payload),
  updateUser: (userId: string, payload: UpdateUserInput) =>
    usersRepository.update(userId, payload),
  deleteUser: (userId: string) => usersRepository.remove(userId),
};
