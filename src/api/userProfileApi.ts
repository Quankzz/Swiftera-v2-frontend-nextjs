import type { AxiosResponse } from "axios";

import { httpService } from "./http";

export interface RoleSecured {
  roleId: string;
  name: string;
  description: string;
  active: boolean;
}

export interface UserSecure {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  phoneNumber: string | null;
  biography: string | null;
  avatarUrl: string | null;
  city: string | null;
  nationality: string | null;
  rolesSecured: RoleSecured[];
  createdAt: string;
  updatedAt: string;
}

export interface UserSecureResponse {
  success: boolean;
  message: string;
  data: UserSecure;
  meta?: {
    timestamp: string;
    instance: string;
  };
}

export interface UpdateEmailResponse {
  success: boolean;
  message: string;
  data: null;
}

export interface UpdateProfileRequest {
  firstName?: string | null;
  lastName?: string | null;
  nickname?: string | null;
  avatarUrl?: string | null;
  biography?: string | null;
  city?: string | null;
  nationality?: string | null;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateEmailRequest {
  newEmail: string;
}

export interface VerifyChangeEmailRequest {
  token: string;
}

const authOpts = { requireToken: true as const };

export const userApi = {
  updateProfile(
    data: UpdateProfileRequest,
  ): Promise<AxiosResponse<UserSecureResponse>> {
    return httpService.patch<UserSecureResponse>(
      "/users/update-profile",
      data,
      authOpts,
    );
  },

  updatePassword(
    data: UpdatePasswordRequest,
  ): Promise<AxiosResponse<UserSecureResponse>> {
    return httpService.put<UserSecureResponse>(
      "/users/update-password",
      data,
      authOpts,
    );
  },

  updateEmail(
    data: UpdateEmailRequest,
  ): Promise<AxiosResponse<UpdateEmailResponse>> {
    return httpService.put<UpdateEmailResponse>(
      "/users/update-email",
      data,
      authOpts,
    );
  },

  verifyChangeEmail(
    data: VerifyChangeEmailRequest,
  ): Promise<AxiosResponse<UserSecureResponse>> {
    return httpService.post<UserSecureResponse>(
      "/users/verify-change-email",
      data,
      authOpts,
    );
  },

  getUserById(userId: string): Promise<AxiosResponse<UserSecureResponse>> {
    return httpService.get<UserSecureResponse>(`/users/${userId}`, authOpts);
  },
};

export const userProfileApi = userApi;
