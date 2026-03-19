import {
  CreatePermissionInput,
  PaginatedResponse,
  Permission,
  PermissionListParams,
  UpdatePermissionInput,
} from '@/types/dashboard';
import { fetchApi } from '../apiService';

type DataMode = 'mock' | 'api';
const DATA_MODE = (process.env.NEXT_PUBLIC_DATA_MODE as DataMode) || 'mock';
const USE_MOCK = DATA_MODE === 'mock';

let mockPermissions: Permission[] = [
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
    module: 'Reports',
  },
];

const mockModules: string[] = ['Users', 'Roles', 'Products', 'Reports'];

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export interface PermissionsRepository {
  list(params?: PermissionListParams): Promise<PaginatedResponse<Permission>>;
  get(permissionId: string): Promise<Permission>;
  create(payload: CreatePermissionInput): Promise<Permission>;
  update(
    permissionId: string,
    payload: UpdatePermissionInput,
  ): Promise<Permission>;
  remove(permissionId: string): Promise<{ success: boolean }>;
  updateModule(permissionId: string, module: string): Promise<boolean>;
  listModules(): Promise<string[]>;
  createModule(name: string): Promise<string>;
  renameModule(oldName: string, newName: string): Promise<string>;
  deleteModule(name: string): Promise<{ success: boolean }>;
}

const mockPermissionsRepository: PermissionsRepository = {
  async list(params = {}) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 1000;
    const search = params.search?.toLowerCase().trim();
    const moduleFilter = params.module?.toLowerCase().trim();
    const methodFilter = params.method?.toUpperCase().trim();

    let filtered = mockPermissions;
    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.apiPath.toLowerCase().includes(search) ||
          p.module.toLowerCase().includes(search),
      );
    }

    if (moduleFilter) {
      filtered = filtered.filter(
        (p) => p.module.toLowerCase() === moduleFilter,
      );
    }

    if (methodFilter) {
      filtered = filtered.filter(
        (p) => p.method.toUpperCase() === methodFilter,
      );
    }

    await delay();
    return {
      data: filtered.slice((page - 1) * limit, page * limit),
      total: filtered.length,
    };
  },

  async get(permissionId) {
    await delay();
    const found = mockPermissions.find((p) => p.permissionId === permissionId);
    if (!found) throw new Error('Không tìm thấy quyền');
    return found;
  },

  async create(payload) {
    await delay();
    const newPermission: Permission = {
      permissionId: crypto.randomUUID(),
      name: payload.name,
      apiPath: payload.apiPath,
      method: payload.method,
      module: payload.module,
    };
    mockPermissions = [newPermission, ...mockPermissions];
    if (!mockModules.includes(payload.module)) {
      mockModules.push(payload.module);
    }
    return newPermission;
  },

  async update(permissionId, payload) {
    await delay();
    const existing = mockPermissions.find(
      (p) => p.permissionId === permissionId,
    );
    if (!existing) throw new Error('Không tìm thấy quyền');

    const updated: Permission = {
      ...existing,
      ...payload,
      name: payload.name ?? existing.name,
      apiPath: payload.apiPath ?? existing.apiPath,
      method: payload.method ?? existing.method,
      module: payload.module ?? existing.module,
    };
    mockPermissions = mockPermissions.map((p) =>
      p.permissionId === permissionId ? updated : p,
    );
    if (payload.module && !mockModules.includes(payload.module)) {
      mockModules.push(payload.module);
    }
    return updated;
  },

  async remove(permissionId) {
    await delay();
    mockPermissions = mockPermissions.filter(
      (p) => p.permissionId !== permissionId,
    );
    return { success: true };
  },

  async updateModule(permissionId, module) {
    await delay(200);
    mockPermissions = mockPermissions.map((p) =>
      p.permissionId === permissionId ? { ...p, module } : p,
    );
    if (!mockModules.includes(module)) {
      mockModules.push(module);
    }
    return true;
  },

  async listModules() {
    await delay(150);
    const fromPermissions = Array.from(
      new Set(mockPermissions.map((p) => p.module).filter(Boolean)),
    );
    return Array.from(new Set([...mockModules, ...fromPermissions]));
  },

  async createModule(name: string) {
    await delay(150);
    if (!mockModules.includes(name)) {
      mockModules.push(name);
    }
    return name;
  },

  async renameModule(oldName: string, newName: string) {
    await delay(150);
    const idx = mockModules.indexOf(oldName);
    if (idx !== -1) mockModules[idx] = newName;
    else if (!mockModules.includes(newName)) mockModules.push(newName);
    // Update all permissions that belonged to oldName
    mockPermissions = mockPermissions.map((p) =>
      p.module === oldName ? { ...p, module: newName } : p,
    );
    return newName;
  },

  async deleteModule(name: string) {
    await delay(150);
    const idx = mockModules.indexOf(name);
    if (idx !== -1) mockModules.splice(idx, 1);
    // Move orphaned permissions to 'Chưa phân loại'
    mockPermissions = mockPermissions.map((p) =>
      p.module === name ? { ...p, module: 'Chưa phân loại' } : p,
    );
    return { success: true };
  },
};

const apiPermissionsRepository: PermissionsRepository = {
  async list(params = {}) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 100;
    const search = params.search
      ? `&search=${encodeURIComponent(params.search)}`
      : '';
    const moduleFilter = params.module
      ? `&module=${encodeURIComponent(params.module)}`
      : '';
    const methodFilter = params.method ? `&method=${params.method}` : '';

    return fetchApi<PaginatedResponse<Permission>>(
      `/permissions?page=${page}&limit=${limit}${search}${moduleFilter}${methodFilter}`,
    );
  },

  async get(permissionId) {
    return fetchApi<Permission>(`/permissions/${permissionId}`);
  },

  async create(payload) {
    return fetchApi<Permission>(`/permissions`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(permissionId, payload) {
    return fetchApi<Permission>(`/permissions/${permissionId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async remove(permissionId) {
    return fetchApi<{ success: boolean }>(`/permissions/${permissionId}`, {
      method: 'DELETE',
    });
  },

  async updateModule(permissionId, module) {
    return fetchApi<boolean>(`/permissions/${permissionId}/module`, {
      method: 'PATCH',
      body: JSON.stringify({ module }),
    });
  },

  async listModules() {
    return fetchApi<string[]>(`/permissions/modules`);
  },

  async createModule(name) {
    return fetchApi<string>(`/permissions/modules`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  async renameModule(oldName, newName) {
    return fetchApi<string>(
      `/permissions/modules/${encodeURIComponent(oldName)}`,
      {
        method: 'PUT',
        body: JSON.stringify({ name: newName }),
      },
    );
  },

  async deleteModule(name) {
    return fetchApi<{ success: boolean }>(
      `/permissions/modules/${encodeURIComponent(name)}`,
      { method: 'DELETE' },
    );
  },
};

export const permissionsRepository: PermissionsRepository = USE_MOCK
  ? mockPermissionsRepository
  : apiPermissionsRepository;

export const permissionsApi = {
  getPermissions: (params?: PermissionListParams) =>
    permissionsRepository.list(params),
  getPermissionById: (permissionId: string) =>
    permissionsRepository.get(permissionId),
  createPermission: (payload: CreatePermissionInput) =>
    permissionsRepository.create(payload),
  updatePermission: (permissionId: string, payload: UpdatePermissionInput) =>
    permissionsRepository.update(permissionId, payload),
  deletePermission: (permissionId: string) =>
    permissionsRepository.remove(permissionId),
  updatePermissionModule: (permissionId: string, module: string) =>
    permissionsRepository.updateModule(permissionId, module),
  getModules: () => permissionsRepository.listModules(),
  createModule: (name: string) => permissionsRepository.createModule(name),
  renameModule: (oldName: string, newName: string) =>
    permissionsRepository.renameModule(oldName, newName),
  deleteModule: (name: string) => permissionsRepository.deleteModule(name),
};
