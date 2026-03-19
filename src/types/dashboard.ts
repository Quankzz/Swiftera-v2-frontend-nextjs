export interface User {
  userId: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
}

export interface Role {
  roleId: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface Permission {
  permissionId: string;
  name: string;
  apiPath: string;
  method: string;
  module: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}
