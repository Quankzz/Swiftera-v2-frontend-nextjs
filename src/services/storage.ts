/**
 * Storage Service - Quản lý lưu trữ token và dữ liệu người dùng
 */

import type { User } from '@/types/index';

const ACCESS_TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export const storageService = {
  setAccessToken(token: string | null | undefined): void {
    if (token && hasStorage()) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  },

  getAccessToken(): string | null {
    if (!hasStorage()) {
      return null;
    }
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  removeAccessToken(): void {
    if (hasStorage()) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  },

  setUser(user: User | null | undefined): void {
    if (user && hasStorage()) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  getUser(): User | null {
    if (!hasStorage()) {
      return null;
    }
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        return null;
      }
    }
    return null;
  },

  removeUser(): void {
    if (hasStorage()) {
      localStorage.removeItem(USER_KEY);
    }
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },

  clearAuth(): void {
    this.removeAccessToken();
    this.removeUser();
  },
};
