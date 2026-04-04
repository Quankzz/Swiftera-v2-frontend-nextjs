import type { AxiosResponse } from 'axios';
import type {
  AuthResponse,
  GetMeResponse,
  LoginCredentials,
  RegisterCredentials,
  User as AuthUser,
} from '@/types/auth';

import { storageService } from '../services/storage';

import { httpService } from './http';

export interface RefreshTokenData {
  accessToken: string;
}

export interface AuthEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    timestamp?: string;
    instance?: string;
  };
}

export type AuthNestedData = AuthResponse;
export type RefreshTokenEnvelope = AuthEnvelope<RefreshTokenData>;

export const authApi = {
  login(
    payload: LoginCredentials,
  ): Promise<AxiosResponse<AuthNestedData> | undefined> {
    return httpService
      .post<AuthNestedData>('/auth/login', payload, {
        withCredentials: true,
      })
      .then((response) => {
        const accessToken = response.data.data.accessToken;
        if (accessToken) {
          storageService.setAccessToken(accessToken);
          return response;
        }
      })
      .catch((error: unknown) => {
        console.error('Login error:', error);
        throw error;
      });
  },

  register(payload: RegisterCredentials) {
    return httpService.post('/auth/register', payload);
  },

  logout() {
    return httpService.post('/auth/logout', null, {
      requireToken: true,
    });
  },

  verifyEmail(payload: { email: string; code: string }) {
    return httpService.post('/auth/verify-active-account', payload);
  },

  resendEmail(payload: { email: string }) {
    return httpService.post('/auth/resend-verify', payload);
  },

  forgotPassword(payload: { email: string }) {
    return httpService.post('/auth/forgot-password', payload);
  },

  resetPassword(payload: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    return httpService.post('/auth/reset-password', payload);
  },

  getAccount() {
    return httpService.get<GetMeResponse>('/auth/account', {
      requireToken: true,
    });
  },

  refreshToken() {
    return httpService.get<RefreshTokenEnvelope>('/auth/refresh', {
      withCredentials: true,
    });
  },
};
