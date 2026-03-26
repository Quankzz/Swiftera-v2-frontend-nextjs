import {
  CreateRoleInput,
  PaginatedResponse,
  Role,
  RoleListParams,
  UpdateRoleInput,
} from '@/types/dashboard';
import { fetchApi } from '../apiService';
type DataMode = 'mock' | 'api';
const DATA_MODE = (process.env.NEXT_PUBLIC_DATA_MODE as DataMode) || 'mock';
const USE_MOCK = DATA_MODE === 'mock';

let mockRoles: Role[] = [
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

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export interface RolesRepository {
  list(params?: RoleListParams): Promise<PaginatedResponse<Role>>;
  get(roleId: string): Promise<Role>;
  create(payload: CreateRoleInput): Promise<Role>;
  update(roleId: string, payload: UpdateRoleInput): Promise<Role>;
  remove(roleId: string): Promise<{ success: boolean }>;
}

const mockRolesRepository: RolesRepository = {
  async list(params = {}) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const search = params.search?.toLowerCase().trim();

    let filtered = mockRoles;
    if (search) {
      filtered = mockRoles.filter(
        (r) =>
          r.name.toLowerCase().includes(search) ||
          (r.description || '').toLowerCase().includes(search),
      );
    }

    await delay();
    return {
      data: filtered.slice((page - 1) * limit, page * limit),
      total: filtered.length,
    };
  },

  async get(roleId) {
    await delay();
    const found = mockRoles.find((r) => r.roleId === roleId);
    if (!found) throw new Error('Không tìm thấy vai trò');
    return found;
  },

  async create(payload) {
    await delay();
    const newRole: Role = {
      roleId: crypto.randomUUID(),
      name: payload.name,
      description: payload.description ?? null,
      isActive: payload.isActive,
    };
    mockRoles = [newRole, ...mockRoles];
    return newRole;
  },

  async update(roleId, payload) {
    await delay();
    const existing = mockRoles.find((r) => r.roleId === roleId);
    if (!existing) throw new Error('Không tìm thấy vai trò');

    const updated: Role = {
      ...existing,
      ...payload,
      description:
        payload.description !== undefined
          ? payload.description
          : existing.description,
      isActive: payload.isActive ?? existing.isActive,
    };
    mockRoles = mockRoles.map((r) => (r.roleId === roleId ? updated : r));
    return updated;
  },

  async remove(roleId) {
    await delay();
    mockRoles = mockRoles.filter((r) => r.roleId !== roleId);
    return { success: true };
  },
};

const apiRolesRepository: RolesRepository = {
  async list(params = {}) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const search = params.search
      ? `&search=${encodeURIComponent(params.search)}`
      : '';
    return fetchApi<PaginatedResponse<Role>>(
      `/roles?page=${page}&limit=${limit}${search}`,
    );
  },

  async get(roleId) {
    return fetchApi<Role>(`/roles/${roleId}`);
  },

  async create(payload) {
    return fetchApi<Role>(`/roles`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(roleId, payload) {
    return fetchApi<Role>(`/roles/${roleId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async remove(roleId) {
    return fetchApi<{ success: boolean }>(`/roles/${roleId}`, {
      method: 'DELETE',
    });
  },
};

export const rolesRepository: RolesRepository = USE_MOCK
  ? mockRolesRepository
  : apiRolesRepository;

export const rolesApi = {
  getRoles: (page = 1, limit = 10) => rolesRepository.list({ page, limit }),
  getRoleById: (roleId: string) => rolesRepository.get(roleId),
  createRole: (payload: CreateRoleInput) => rolesRepository.create(payload),
  updateRole: (roleId: string, payload: UpdateRoleInput) =>
    rolesRepository.update(roleId, payload),
  deleteRole: (roleId: string) => rolesRepository.remove(roleId),
};

// ─── Role ↔ Permissions assignment ───────────────────────────────────────────

/** In-memory map: roleId → Set of permissionIds */
const mockRolePermissions: Record<string, Set<string>> = {
  '1': new Set(['p1', 'p2', 'p3', 'p4', 'p5', 'p6']),
  '2': new Set(['p1', 'p4']),
  '3': new Set(['p1']),
  '4': new Set(),
};

export const rolePermissionsRepository = {
  async getPermissionIds(roleId: string): Promise<string[]> {
    await delay();
    return Array.from(mockRolePermissions[roleId] ?? new Set());
  },

  async assign(
    roleId: string,
    permissionIds: string[],
  ): Promise<{ success: boolean }> {
    await delay();
    mockRolePermissions[roleId] = new Set(permissionIds);
    return { success: true };
  },
};
