export interface User {
  userId: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateUserInput {
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  isVerified: boolean;
}

export interface UpdateUserInput {
  fullName?: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  isVerified?: boolean;
}

export interface Role {
  roleId: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface RoleListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateRoleInput {
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface UpdateRoleInput {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface Permission {
  permissionId: string;
  name: string;
  apiPath: string;
  method: string;
  module: string;
}

export interface PermissionListParams {
  page?: number;
  limit?: number;
  search?: string;
  module?: string;
  method?: string;
}

export interface CreatePermissionInput {
  name: string;
  apiPath: string;
  method: string;
  module: string;
}

export interface UpdatePermissionInput {
  name?: string;
  apiPath?: string;
  method?: string;
  module?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}
