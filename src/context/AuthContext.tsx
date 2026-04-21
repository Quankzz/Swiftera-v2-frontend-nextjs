'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  AuthResponse,
  GetMeResponse,
  LoginCredentials,
  RegisterCredentials,
  User as AuthUser,
} from '@/types/auth';
import type { UserSecuredResponse } from '@/types/api.types';
import { authApi } from '@/api/authApi';
import { normalizeError } from '@/api/apiService';
import { setLogoutCallback } from '@/api/http';
import { storageService } from '@/services/storage';
import { useAuthStore } from '@/stores/auth-store';

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  forgotPassword: (email: string) => Promise<AuthResponse>;
  resetPassword: (payload: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<AuthResponse>;
  verifyEmail: (payload: {
    email: string;
    code: string;
  }) => Promise<AuthResponse>;
  resendVerificationEmail: (email: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeUserPayload(payload: unknown): AuthUser | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const raw = payload as Record<string, unknown>;
  const id = raw.id ?? raw.userId;

  if (
    typeof id === 'string' &&
    typeof raw.email === 'string' &&
    typeof raw.firstName === 'string' &&
    typeof raw.lastName === 'string'
  ) {
    return {
      id,
      email: raw.email,
      firstName: raw.firstName,
      lastName: raw.lastName,
      createdAt:
        typeof raw.createdAt === 'string'
          ? raw.createdAt
          : new Date().toISOString(),
      updatedAt:
        typeof raw.updatedAt === 'string'
          ? raw.updatedAt
          : new Date().toISOString(),
      createdBy: typeof raw.createdBy === 'string' ? raw.createdBy : 'system',
      updatedBy: typeof raw.updatedBy === 'string' ? raw.updatedBy : undefined,
      rolesSecured: Array.isArray(raw.rolesSecured)
        ? (raw.rolesSecured as AuthUser['rolesSecured'])
        : [],
      avatar: typeof raw.avatar === 'string' ? raw.avatar : undefined,
    };
  }

  return null;
}

function toStoredUser(user: AuthUser) {
  return {
    user_id: user.id,
    email: user.email,
    full_name: `${user.firstName} ${user.lastName}`.trim(),
    is_verified: true,
    created_at: user.createdAt ?? new Date().toISOString(),
    updated_at: user.updatedAt,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    storageService.clearAuth();
    setUser(null);
    // Sync Zustand store so staff dashboard pages also un-authenticate
    useAuthStore.getState().clearAuth();
  }, []);

  useEffect(() => {
    setLogoutCallback(clearSession);
    return () => setLogoutCallback(undefined);
  }, [clearSession]);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      setIsLoading(true);
      const token = storageService.getAccessToken();
      if (!token) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await authApi.getAccount();
        const result = response.data as GetMeResponse;
        const currentUser = normalizeUserPayload(result?.data);

        if (!isMounted) {
          return;
        }

        if (currentUser) {
          storageService.setUser(toStoredUser(currentUser));
          setUser(currentUser);
          // Sync Zustand store so staff dashboard pages get the user immediately
          useAuthStore
            .getState()
            .setAuth(token, result?.data as unknown as UserSecuredResponse);
        } else {
          clearSession();
        }
      } catch (error) {
        if (isMounted) {
          const normalizedError = normalizeError(
            error,
            'Không thể tải thông tin người dùng',
          );

          if (
            normalizedError.errorCode !== 'NETWORK_ERROR' &&
            normalizedError.errorCode !== 'TIMEOUT'
          ) {
            clearSession();
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [clearSession]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      const result = response?.data;

      if (!result?.success) {
        throw new Error(result?.message || 'Đăng nhập thất bại');
      }

      const accessToken = result.data?.accessToken;
      const currentUser = normalizeUserPayload(result.data?.userSecured);

      if (!accessToken || !currentUser) {
        throw new Error('Không nhận được thông tin người dùng');
      }

      storageService.setAccessToken(accessToken);
      storageService.setUser(toStoredUser(currentUser));
      setUser(currentUser);
      // Sync Zustand store so staff dashboard pages get the user + token immediately
      useAuthStore
        .getState()
        .setAuth(
          accessToken,
          result.data?.userSecured as unknown as UserSecuredResponse,
        );

      return result;
    } catch (error) {
      throw normalizeError(error, 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(credentials);
      const result = response.data as AuthResponse;

      if (!result?.success) {
        throw new Error(result?.message || 'Đăng ký thất bại');
      }

      return result;
    } catch (error) {
      throw normalizeError(error, 'Đăng ký thất bại');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.forgotPassword({ email });
      const result = response.data as AuthResponse;

      if (!result?.success) {
        throw new Error(
          result?.message || 'Không thể gửi yêu cầu đặt lại mật khẩu',
        );
      }

      return result;
    } catch (error) {
      throw normalizeError(error, 'Không thể gửi yêu cầu đặt lại mật khẩu');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(
    async (payload: {
      token: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
      setIsLoading(true);
      try {
        const response = await authApi.resetPassword(payload);
        const result = response.data as AuthResponse;

        if (!result?.success) {
          throw new Error(result?.message || 'Không thể đặt lại mật khẩu');
        }

        return result;
      } catch (error) {
        throw normalizeError(error, 'Không thể đặt lại mật khẩu');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const verifyEmail = useCallback(
    async (payload: { email: string; code: string }) => {
      setIsLoading(true);
      try {
        const response = await authApi.verifyEmail(payload);
        const result = response.data as AuthResponse;

        if (!result?.success) {
          throw new Error(result?.message || 'Không thể xác thực email');
        }

        return result;
      } catch (error) {
        throw normalizeError(error, 'Không thể xác thực email');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const resendVerificationEmail = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.resendEmail({ email });
      const result = response.data as AuthResponse;

      if (!result?.success) {
        throw new Error(result?.message || 'Gửi lại email thất bại');
      }

      return result;
    } catch (error) {
      throw normalizeError(error, 'Gửi lại email thất bại');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Clear local session even if backend logout fails.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        forgotPassword,
        resetPassword,
        verifyEmail,
        resendVerificationEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
