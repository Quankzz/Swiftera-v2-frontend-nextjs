/**
 * Hook cho staff request:
 *  - useStaffRequestMutation
 *
 * API-019: POST /users/staff-requests [AUTH]
 * Dùng TanStack Query + user.service.ts + user.keys.ts.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userKeys } from '../api/user.keys';
import { requestStaffUpgrade } from '../api/user.service';
import type { UserSecureResponse } from '../types';

/**
 * Yêu cầu nâng cấp lên STAFF
 * Sau khi thành công, invalidate profile vì roles đã thay đổi.
 */
export function useStaffRequestMutation() {
  const qc = useQueryClient();
  return useMutation<UserSecureResponse, Error, void>({
    mutationFn: requestStaffUpgrade,
    onSuccess: (data) => {
      // Profile đã có thêm STAFF_ROLE → cập nhật cache
      qc.setQueryData(userKeys.profile(), data);
      qc.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
}
