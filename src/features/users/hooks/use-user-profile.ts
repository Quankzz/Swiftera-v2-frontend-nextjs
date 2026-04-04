/**
 * Hooks cho profile / self-service:
 *  - useMyProfileQuery
 *  - useUpdateProfileMutation
 *  - useUpdatePasswordMutation
 *  - useRequestChangeEmailMutation
 *  - useVerifyChangeEmailMutation
 *
 * Dùng TanStack Query + user.service.ts + user.keys.ts.
 * Error từ apiService/AppError đi xuyên suốt.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userKeys } from '../api/user.keys';
import {
  getMyProfile,
  updateProfile,
  updatePassword,
  requestChangeEmail,
  verifyChangeEmail,
} from '../api/user.service';
import type {
  UserSecureResponse,
  UpdateProfileInput,
  UpdatePasswordInput,
  RequestChangeEmailInput,
  VerifyChangeEmailInput,
} from '../types';

/**
 * Lấy thông tin profile hiện tại (API-006: GET /auth/account)
 */
export function useMyProfileQuery() {
  return useQuery<UserSecureResponse>({
    queryKey: userKeys.profile(),
    queryFn: getMyProfile,
    staleTime: 5 * 60 * 1000, // 5 phút
  });
}

/**
 * Cập nhật hồ sơ cá nhân (API-010: PATCH /users/update-profile)
 */
export function useUpdateProfileMutation() {
  const qc = useQueryClient();
  return useMutation<UserSecureResponse, Error, UpdateProfileInput>({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // Cập nhật cache profile ngay lập tức
      qc.setQueryData(userKeys.profile(), data);
      qc.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
}

/**
 * Đổi mật khẩu (API-011: PUT /users/update-password)
 */
export function useUpdatePasswordMutation() {
  const qc = useQueryClient();
  return useMutation<UserSecureResponse, Error, UpdatePasswordInput>({
    mutationFn: updatePassword,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
}

/**
 * Yêu cầu đổi email (API-012: PUT /users/update-email)
 */
export function useRequestChangeEmailMutation() {
  return useMutation<null, Error, RequestChangeEmailInput>({
    mutationFn: requestChangeEmail,
  });
}

/**
 * Xác thực token đổi email (API-013: POST /users/verify-change-email)
 */
export function useVerifyChangeEmailMutation() {
  const qc = useQueryClient();
  return useMutation<UserSecureResponse, Error, VerifyChangeEmailInput>({
    mutationFn: verifyChangeEmail,
    onSuccess: (data) => {
      qc.setQueryData(userKeys.profile(), data);
      qc.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
}
