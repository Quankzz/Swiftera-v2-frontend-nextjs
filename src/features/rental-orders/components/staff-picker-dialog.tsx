'use client';

/**
 * StaffPickerDialog
 * ─────────────────────────────────────────────────────────────────────────────
 * Dialog chọn nhân viên — dùng trong RentalOrderAssignDialog.
 * Không tự gọi mutation — chỉ trả về StaffOption đã chọn qua onSelected.
 *
 * Props:
 *  role      — 'delivery' | 'pickup'  (ảnh hưởng màu sắc + tiêu đề)
 *  isOpen    — hiển thị/ẩn
 *  onClose   — đóng picker mà không chọn
 *  onSelected(staff) — gọi khi user bấm "Chọn"
 */

import { useState, useMemo } from 'react';
import {
  X,
  Search,
  Users,
  Loader2,
  CheckCircle2,
  Package,
  UserCheck,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHubStaffForAssignQuery } from '@/features/rental-orders/hooks/use-rental-order-assignment';
import type { HubStaffResponse } from '@/features/hubs/types';

// ─────────────────────────────────────────────────────────────────────────────

interface StaffPickerDialogProps {
  role: 'delivery' | 'pickup';
  hubId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelected: (staff: HubStaffResponse) => void;
}

// ─────────────────────────────────────────────────────────────────────────────

function getInitials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

// ─────────────────────────────────────────────────────────────────────────────

export function StaffPickerDialog({
  role,
  hubId,
  isOpen,
  onClose,
  onSelected,
}: StaffPickerDialogProps) {
  const [search, setSearch] = useState('');
  const [highlighted, setHighlighted] = useState<HubStaffResponse | null>(null);

  const isDelivery = role === 'delivery';
  const title = isDelivery
    ? 'Chọn nhân viên giao hàng'
    : 'Chọn nhân viên thu hồi';
  const RoleIcon = isDelivery ? Package : UserCheck;
  const headerGradient = isDelivery
    ? 'bg-linear-to-r from-indigo-600 to-blue-600'
    : 'bg-linear-to-r from-emerald-600 to-teal-600';
  const ringColor = isDelivery
    ? 'focus:ring-indigo-500/30 focus:border-indigo-500'
    : 'focus:ring-emerald-500/30 focus:border-emerald-500';
  const selectedBorder = isDelivery
    ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-400/30'
    : 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 ring-2 ring-emerald-400/30';
  const selectedIcon = isDelivery ? 'bg-indigo-500' : 'bg-emerald-500';
  const confirmBtn = isDelivery
    ? 'bg-indigo-600 hover:bg-indigo-700'
    : 'bg-emerald-600 hover:bg-emerald-700';
  const loaderColor = isDelivery ? 'text-indigo-500' : 'text-emerald-500';

  const { data: staffData, isLoading } = useHubStaffForAssignQuery(hubId);

  const allStaff = useMemo<HubStaffResponse[]>(
    () => staffData ?? [],
    [staffData],
  );

  const filteredStaff = useMemo(() => {
    if (!search.trim()) return allStaff;
    const q = search.toLowerCase();
    return allStaff.filter(
      (s) =>
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phoneNumber?.includes(q),
    );
  }, [allStaff, search]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-60 flex items-center justify-center'>
      {/* Backdrop — higher z than the parent dialog */}
      <div
        className='absolute inset-0 bg-black/40 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Panel */}
      <div className='relative z-10 w-full max-w-lg mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col max-h-[82vh] overflow-hidden'>
        {/* Header */}
        <div
          className={cn(
            'flex items-center justify-between px-5 py-3.5 shrink-0',
            headerGradient,
          )}
        >
          <div className='flex items-center gap-2.5'>
            <button
              type='button'
              onClick={onClose}
              className='w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors'
            >
              <ArrowLeft className='w-3.5 h-3.5 text-white' />
            </button>
            <div className='w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center'>
              <RoleIcon className='w-4 h-4 text-white' />
            </div>
            <h3 className='text-sm font-semibold text-white'>{title}</h3>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors'
          >
            <X className='w-3.5 h-3.5 text-white' />
          </button>
        </div>

        {/* Search */}
        <div className='px-4 py-2.5 border-b border-gray-100 dark:border-white/10 shrink-0'>
          <div className='relative'>
            <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400' />
            <input
              type='text'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Tìm theo tên, email, số điện thoại...'
              className={cn(
                'h-8 w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 pl-8 pr-3 text-sm text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 transition',
                ringColor,
              )}
            />
          </div>
        </div>

        {/* Staff list */}
        <div className='flex-1 overflow-y-auto px-4 py-3 space-y-2'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center py-10 gap-2'>
              <Loader2 className={cn('w-5 h-5 animate-spin', loaderColor)} />
              <p className='text-sm text-text-sub'>Đang tải danh sách...</p>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-10 gap-2'>
              <Users className='w-7 h-7 text-gray-300 dark:text-gray-600' />
              <p className='text-sm text-text-sub'>Không tìm thấy nhân viên</p>
            </div>
          ) : (
            filteredStaff.map((staff) => {
              const isSelected = highlighted?.userId === staff.userId;
              const fullName = `${staff.firstName} ${staff.lastName}`;
              return (
                <button
                  key={staff.userId}
                  type='button'
                  onClick={() => setHighlighted(isSelected ? null : staff)}
                  className={cn(
                    'w-full text-left flex items-center gap-3 rounded-xl border p-3 transition-all',
                    isSelected
                      ? selectedBorder
                      : 'border-gray-200 dark:border-white/8 bg-white dark:bg-white/4 hover:border-gray-300 dark:hover:border-white/15',
                  )}
                >
                  {/* Avatar */}
                  {staff.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={staff.avatarUrl}
                      alt={fullName}
                      className='w-9 h-9 rounded-full object-cover shrink-0'
                    />
                  ) : (
                    <div
                      className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
                        isSelected
                          ? `${selectedIcon} text-white`
                          : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400',
                      )}
                    >
                      <span className='text-xs font-bold'>
                        {getInitials(staff.firstName, staff.lastName)}
                      </span>
                    </div>
                  )}

                  {/* Info */}
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-semibold text-text-main truncate'>
                      {fullName}
                    </p>
                    <div className='flex items-center gap-2 mt-0.5 flex-wrap'>
                      <span className='text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-text-sub'>
                        Nhân viên
                      </span>
                      {staff.isVerified && (
                        <span className='text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'>
                          Đã xác thực
                        </span>
                      )}
                      <span className='text-[10px] text-text-sub truncate'>
                        {staff.email}
                      </span>
                    </div>
                  </div>

                  {/* Check */}
                  {isSelected ? (
                    <CheckCircle2
                      className={cn(
                        'w-5 h-5 shrink-0',
                        isDelivery ? 'text-indigo-500' : 'text-emerald-500',
                      )}
                    />
                  ) : (
                    <div className='w-5 h-5 rounded-full border-2 border-gray-300 dark:border-white/20 shrink-0' />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className='px-4 py-3 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/4 flex items-center justify-between gap-3 shrink-0'>
          <p className='text-xs text-text-sub'>
            {highlighted ? (
              <span>
                Đã chọn:{' '}
                <span className='font-medium text-text-main'>
                  {highlighted.firstName} {highlighted.lastName}
                </span>
              </span>
            ) : (
              `${filteredStaff.length} nhân viên`
            )}
          </p>
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={onClose}
              className='px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors'
            >
              Hủy
            </button>
            <button
              type='button'
              disabled={!highlighted}
              onClick={() => highlighted && onSelected(highlighted)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                confirmBtn,
              )}
            >
              Chọn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
