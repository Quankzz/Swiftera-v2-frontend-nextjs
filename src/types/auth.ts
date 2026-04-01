export interface Role {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    id: string;
    name: string;
    description: string;
    active: boolean;
  }
  
  export interface User {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy?: string;
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    rolesSecured: Role[];
    avatar?: string;
  }
  
  export interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
  }
  
  export interface LoginCredentials {
    email?: string;
    phoneNumber?: string;
    password: string;
  }
  
  export interface RegisterCredentials {
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
  }
  
  export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
      accessToken: string;
      userSecured: User;
    };
    meta: {
      timestamp: string;
      instance: string;
    };
  }
  
  export interface LoginRequest {
    username: string;
    password: string;
  }
  
  export interface RegisterRequest {
    username: string;
    password: string;
    email: string;
    fullName: string;
  }
  
  export interface RegisterError {
    code: number;
    message: string;
    field: string;
    resource: string;
  }
  
  export interface RegisterErrorResponse {
    success: boolean;
    errors: RegisterError[];
    meta: {
      timestamp: string;
      instance: string;
    };
  }
  
  export interface GetMeResponse {
    success: boolean;
    message: string;
    data: User;
    meta: {
      timestamp: string;
      instance: string;
    };
  }
  