'use client';

/**
 * AssignStaffToHubDialog
 * ─────────────────────────────────────────────────────────────────────────────
 * Dialog cho phép admin gán nhân viên (STAFF) vào một hub cụ thể.
 *
 * Features:
 *  - Hiển thị danh sách nhân viên hiện tại của hub (GET /hubs/{hubId}/staff)
 *  - Tìm kiếm user có role STAFF theo tên, email, SĐT (GET /users?filter=...)
 *  - Multi-select staff → gọi API-120: PATCH /hubs/{hubId}/assign-staff
 */

import { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  Users,
  UserPlus,
  Loader2,
  CheckCircle2,
  XCircle,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useHubStaffQuery } from '@/features/hubs/hooks/use-hub-management';
import { useUsersQuery } from '@/features/users/hooks/use-user-management';
import { useAssignStaffToHubMutation } from '@/features/rental-orders/hooks/use-rental-order-assignment';
import type { HubResponse } from '@/features/hubs/types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getFullName(user: { firstName: string; lastName: string }): string {
  return `${user.firstName} ${user.lastName}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface AssignStaffToHubDialogProps {
  hub: HubResponse;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Dialog
// ─────────────────────────────────────────────────────────────────────────────

export function AssignStaffToHubDialog({
  hub,
  onClose,
}: AssignStaffToHubDialogProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStaffIds, setSelectedStaffIds] = useState<Set<string>>(
    new Set(),
  );
  const [staffPage, setStaffPage] = useState(1); // 1-based for BE

  // Debounce 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setStaffPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // ── Fetch current hub staff ──
  const hubStaffQuery = useHubStaffQuery(hub.hubId);
  const currentStaff = useMemo(
    () => hubStaffQuery.data ?? [],
    [hubStaffQuery.data],
  );
  const currentStaffIds = useMemo(
    () => new Set(currentStaff.map((s) => s.userId)),
    [currentStaff],
  );

  // ── Fetch STAFF users with search ──
  const staffFilter = useMemo(() => {
    const parts: string[] = [];
    // Luôn filter role STAFF
    parts.push(`roles.name:'STAFF'`);
    if (debouncedSearch.trim()) {
      const term = debouncedSearch.trim();
      parts.push(
        `(firstName~~'*${term}*' or lastName~~'*${term}*' or email~~'*${term}*' or phoneNumber~~'*${term}*')`,
      );
    }
    return parts.join(' and ');
  }, [debouncedSearch]);

  const usersQuery = useUsersQuery({
    page: staffPage,
    size: 20,
    filter: staffFilter,
    sort: 'firstName,asc',
  });

  const staffUsers = usersQuery.data?.content ?? [];
  const staffTotalPages = usersQuery.data?.meta?.totalPages ?? 1;

  // ── Assign mutation ──
  const assignMutation = useAssignStaffToHubMutation();

  // ── Handlers ──
  const toggleStaff = (userId: string) => {
    setSelectedStaffIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleAssign = () => {
    if (selectedStaffIds.size === 0) return;
    assignMutation.mutate(
      {
        hubId: hub.hubId,
        payload: { staffIds: Array.from(selectedStaffIds) },
      },
      {
        onSuccess: () => {
          setSelectedStaffIds(new Set());
          onClose();
        },
      },
    );
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Panel */}
      <div className='relative z-10 flex w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white dark:bg-surface-card shadow-2xl max-h-[90vh]'>
        {/* ── Header ── */}
        <div className='flex items-center justify-between border-b border-gray-100 dark:border-white/8 px-6 py-4 shrink-0'>
          <div className='flex items-center gap-3'>
            <div className='flex size-9 items-center justify-center rounded-md bg-indigo-50 dark:bg-indigo-950/40'>
              <UserPlus size={18} className='text-indigo-500' />
            </div>
            <div>
              <h2 className='text-base font-semibold text-text-main leading-none'>
                Gán nhân viên cho hub
              </h2>
              <p className='mt-0.5 text-xs text-text-sub'>
                <span className='font-mono font-medium text-indigo-600 dark:text-indigo-400'>
                  [{hub.code}]
                </span>{' '}
                {hub.name}
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='flex size-8 items-center justify-center rounded-lg text-text-sub hover:bg-gray-100 dark:hover:bg-white/8 transition'
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className='flex-1 overflow-y-auto'>
          {/* Current Staff Section */}
          <div className='px-6 py-4 border-b border-gray-100 dark:border-white/8'>
            <div className='flex items-center gap-2 mb-3'>
              <h3 className='text-xs font-semibold uppercase tracking-wider text-text-sub'>
                Nhân viên hiện tại
              </h3>
              {hubStaffQuery.isSuccess && (
                <span className='inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400'>
                  {currentStaff.length}
                </span>
              )}
            </div>

            {hubStaffQuery.isLoading && (
              <div className='flex items-center justify-center py-6 gap-2 text-text-sub'>
                <Loader2 size={16} className='animate-spin' />
                <span className='text-sm'>Đang tải...</span>
              </div>
            )}

            {hubStaffQuery.isSuccess && currentStaff.length === 0 && (
              <div className='flex items-center justify-center py-6 gap-2 text-text-sub'>
                <Users size={20} className='opacity-30' />
                <span className='text-sm'>Hub chưa có nhân viên.</span>
              </div>
            )}

            {hubStaffQuery.isSuccess && currentStaff.length > 0 && (
              <div className='flex flex-wrap gap-2'>
                {currentStaff.map((member) => (
                  <div
                    key={member.userId}
                    className='inline-flex items-center gap-2 rounded-lg border border-gray-100 dark:border-white/8 bg-gray-50 dark:bg-white/4 px-3 py-1.5'
                  >
                    {member.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.avatarUrl}
                        alt=''
                        className='size-6 rounded-full object-cover'
                      />
                    ) : (
                      <div className='flex size-6 items-center justify-center rounded-full bg-linear-to-br from-blue-400 to-indigo-500 text-[10px] font-bold text-white'>
                        {getInitials(member.firstName, member.lastName)}
                      </div>
                    )}
                    <span className='text-xs font-medium text-text-main'>
                      {getFullName(member)}
                    </span>
                    {member.isVerified ? (
                      <CheckCircle2 size={12} className='text-green-500' />
                    ) : (
                      <XCircle size={12} className='text-gray-400' />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search & Select Staff */}
          <div className='px-6 py-4'>
            <h3 className='text-xs font-semibold uppercase tracking-wider text-text-sub mb-3'>
              Tìm và chọn nhân viên để gán
            </h3>

            {/* Search Input */}
            <div className='relative mb-4'>
              <Search
                size={14}
                className='absolute left-3 top-1/2 -translate-y-1/2 text-text-sub pointer-events-none'
              />
              <input
                type='text'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Tìm theo tên, email, số điện thoại...'
                className='w-full h-10 rounded-lg border border-gray-200 dark:border-white/12 bg-white dark:bg-surface-card pl-9 pr-3 text-sm text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition'
              />
            </div>

            {/* Selection summary */}
            {selectedStaffIds.size > 0 && (
              <div className='mb-3 flex items-center gap-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/30 px-3 py-2'>
                <CheckCircle2
                  size={14}
                  className='text-indigo-600 dark:text-indigo-400'
                />
                <span className='text-xs font-medium text-indigo-700 dark:text-indigo-300'>
                  Đã chọn {selectedStaffIds.size} nhân viên
                </span>
                <button
                  type='button'
                  onClick={() => setSelectedStaffIds(new Set())}
                  className='ml-auto text-xs text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition'
                >
                  Bỏ chọn tất cả
                </button>
              </div>
            )}

            {/* Staff list */}
            {usersQuery.isLoading && (
              <div className='flex items-center justify-center py-10 gap-2 text-text-sub'>
                <Loader2 size={16} className='animate-spin' />
                <span className='text-sm'>Đang tải danh sách nhân viên...</span>
              </div>
            )}

            {usersQuery.isError && (
              <div className='flex items-center justify-center py-10 text-sm text-red-500'>
                Không thể tải danh sách nhân viên.
              </div>
            )}

            {usersQuery.isSuccess && staffUsers.length === 0 && (
              <div className='flex flex-col items-center justify-center py-10 gap-2 text-text-sub'>
                <Users size={28} className='opacity-30' />
                <p className='text-sm'>
                  {debouncedSearch.trim()
                    ? 'Không tìm thấy nhân viên phù hợp.'
                    : 'Không có nhân viên nào với role STAFF.'}
                </p>
              </div>
            )}

            {usersQuery.isSuccess && staffUsers.length > 0 && (
              <div className='overflow-hidden rounded-lg border border-gray-100 dark:border-white/8'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='bg-gray-50 dark:bg-white/4 text-left'>
                      <th className='w-10 px-3 py-2.5' />
                      <th className='px-3 py-2.5 text-xs font-medium text-text-sub'>
                        Nhân viên
                      </th>
                      <th className='hidden sm:table-cell px-3 py-2.5 text-xs font-medium text-text-sub'>
                        Email
                      </th>
                      <th className='hidden md:table-cell px-3 py-2.5 text-xs font-medium text-text-sub'>
                        SĐT
                      </th>
                      <th className='px-3 py-2.5 text-xs font-medium text-text-sub text-right'>
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-50 dark:divide-white/5'>
                    {staffUsers.map((user) => {
                      const isCurrentlyInHub = currentStaffIds.has(user.userId);
                      const isSelected = selectedStaffIds.has(user.userId);

                      return (
                        <tr
                          key={user.userId}
                          className={cn(
                            'transition-colors cursor-pointer',
                            isCurrentlyInHub
                              ? 'bg-green-50/40 dark:bg-green-950/10 opacity-60 cursor-not-allowed'
                              : isSelected
                                ? 'bg-indigo-50/60 dark:bg-indigo-950/20'
                                : 'hover:bg-gray-50/60 dark:hover:bg-white/4',
                          )}
                          onClick={() => {
                            if (!isCurrentlyInHub) toggleStaff(user.userId);
                          }}
                        >
                          {/* Checkbox */}
                          <td className='px-3 py-3'>
                            <div
                              className={cn(
                                'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                                isCurrentlyInHub
                                  ? 'border-green-400 bg-green-100 dark:bg-green-900/30'
                                  : isSelected
                                    ? 'border-indigo-500 bg-indigo-500'
                                    : 'border-gray-300 dark:border-white/20',
                              )}
                            >
                              {(isCurrentlyInHub || isSelected) && (
                                <Check
                                  size={12}
                                  className={
                                    isCurrentlyInHub
                                      ? 'text-green-600 dark:text-green-400'
                                      : 'text-white'
                                  }
                                />
                              )}
                            </div>
                          </td>
                          {/* Name + Avatar */}
                          <td className='px-3 py-3'>
                            <div className='flex items-center gap-2.5'>
                              {user.avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={user.avatarUrl}
                                  alt=''
                                  className='size-7 rounded-full object-cover shrink-0'
                                />
                              ) : (
                                <div className='flex size-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-400 to-indigo-500 text-[10px] font-semibold text-white'>
                                  {getInitials(user.firstName, user.lastName)}
                                </div>
                              )}
                              <div className='min-w-0'>
                                <p className='font-medium text-text-main truncate text-sm'>
                                  {getFullName(user)}
                                </p>
                                {user.nickname && (
                                  <p className='text-[10px] text-text-sub truncate'>
                                    @{user.nickname}
                                  </p>
                                )}
                              </div>
                              {isCurrentlyInHub && (
                                <span className='ml-1 text-[10px] px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 whitespace-nowrap'>
                                  Đã trong hub
                                </span>
                              )}
                            </div>
                          </td>
                          {/* Email */}
                          <td className='hidden sm:table-cell px-3 py-3 text-text-sub text-xs truncate max-w-40'>
                            {user.email}
                          </td>
                          {/* Phone */}
                          <td className='hidden md:table-cell px-3 py-3 text-text-sub text-xs'>
                            {user.phoneNumber ?? '—'}
                          </td>
                          {/* Verified */}
                          <td className='px-3 py-3 text-right'>
                            {user.isVerified ? (
                              <span className='inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-950/40 px-2 py-0.5 text-[10px] font-medium text-green-600 dark:text-green-400'>
                                <CheckCircle2 size={10} />
                                Đã xác thực
                              </span>
                            ) : (
                              <span className='inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-white/8 px-2 py-0.5 text-[10px] font-medium text-gray-500'>
                                <XCircle size={10} />
                                Chưa xác thực
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Pagination */}
                {staffTotalPages > 1 && (
                  <div className='flex items-center justify-between px-4 py-2.5 border-t border-gray-100 dark:border-white/8 bg-gray-50 dark:bg-white/4'>
                    <span className='text-xs text-text-sub'>
                      Trang {staffPage} / {staffTotalPages}
                    </span>
                    <div className='flex gap-1.5'>
                      <Button
                        size='sm'
                        variant='outline'
                        disabled={staffPage <= 1}
                        onClick={() => setStaffPage((p) => Math.max(1, p - 1))}
                        className='h-7 text-xs px-2.5'
                      >
                        Trước
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        disabled={staffPage >= staffTotalPages}
                        onClick={() =>
                          setStaffPage((p) => Math.min(staffTotalPages, p + 1))
                        }
                        className='h-7 text-xs px-2.5'
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className='shrink-0 flex items-center justify-between border-t border-gray-100 dark:border-white/8 px-6 py-4 bg-gray-50 dark:bg-white/4'>
          <span className='text-xs text-text-sub'>
            {selectedStaffIds.size > 0
              ? `${selectedStaffIds.size} nhân viên đã chọn`
              : 'Chọn nhân viên để gán vào hub'}
          </span>
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={onClose}
              className='rounded-lg border border-gray-200 dark:border-white/12 bg-white dark:bg-surface-card px-4 py-2 text-sm font-medium text-text-main hover:bg-gray-50 dark:hover:bg-white/6 transition'
            >
              Hủy
            </button>
            <button
              type='button'
              onClick={handleAssign}
              disabled={assignMutation.isPending || selectedStaffIds.size === 0}
              className='rounded-lg bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2'
            >
              {assignMutation.isPending && (
                <Loader2 size={14} className='animate-spin' />
              )}
              Gán nhân viên
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
