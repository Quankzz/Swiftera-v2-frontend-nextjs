'use client';

import { useState } from 'react';
import {
  X,
  Warehouse,
  MapPin,
  Phone,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  Hash,
  Navigation,
} from 'lucide-react';
import type { HubResponse } from '@/features/hubs/types';
import { useHubStaffQuery } from '@/features/hubs/hooks/use-hub-management';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDateTime(raw: string | null | undefined): string {
  if (!raw) return '—';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildAddress(hub: HubResponse): string {
  return (
    [hub.addressLine, hub.ward, hub.district, hub.city]
      .filter(Boolean)
      .join(', ') || '—'
  );
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className='flex items-start gap-3'>
      <div className='mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-gray-50 dark:bg-white/6'>
        <Icon size={14} className='text-text-sub' />
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-xs text-text-sub'>{label}</p>
        <p className='mt-0.5 text-sm font-medium text-text-main wrap-break-word'>
          {value}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface HubViewDialogProps {
  hub: HubResponse | null;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Dialog
// ─────────────────────────────────────────────────────────────────────────────

export function HubViewDialog({ hub, onClose }: HubViewDialogProps) {
  const [activeOnly, setActiveOnly] = useState(false);

  const staffQuery = useHubStaffQuery(hub?.hubId);

  const allStaff = staffQuery.data ?? [];
  const staff = activeOnly ? allStaff.filter((s) => s.isVerified) : allStaff;

  if (!hub) return null;

  const isActive = hub.isActive;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Panel */}
      <div className='relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white dark:bg-surface-card shadow-2xl max-h-[90vh]'>
        {/* ── Header ── */}
        <div className='flex items-center justify-between border-b border-gray-100 dark:border-white/8 px-6 py-4 shrink-0'>
          <div className='flex items-center gap-3'>
            <div className='flex size-9 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950/40'>
              <Warehouse size={18} className='text-blue-500' />
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <h2 className='text-base font-semibold text-text-main leading-none'>
                  {hub.name}
                </h2>
                <span className='inline-flex items-center rounded px-1.5 py-0.5 text-xs font-mono font-medium bg-gray-100 dark:bg-white/8 text-text-sub'>
                  {hub.code}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    isActive
                      ? 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-white/8 text-gray-500'
                  }`}
                >
                  {isActive ? (
                    <CheckCircle2 size={11} />
                  ) : (
                    <XCircle size={11} />
                  )}
                  {isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
                </span>
              </div>
              <p className='mt-0.5 text-xs text-text-sub'>Chi tiết hub</p>
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
          {/* Hub Details Section */}
          <div className='px-6 py-5 border-b border-gray-100 dark:border-white/8'>
            <h3 className='mb-4 text-xs font-semibold uppercase tracking-wider text-text-sub'>
              Thông tin hub
            </h3>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <DetailRow icon={Hash} label='Mã hub' value={hub.code} />
              <DetailRow
                icon={Phone}
                label='Số điện thoại'
                value={hub.phone ?? '—'}
              />
              <div className='sm:col-span-2'>
                <DetailRow
                  icon={MapPin}
                  label='Địa chỉ'
                  value={buildAddress(hub)}
                />
              </div>
              {(hub.latitude != null || hub.longitude != null) && (
                <div className='sm:col-span-2'>
                  <DetailRow
                    icon={Navigation}
                    label='Tọa độ'
                    value={
                      hub.latitude != null && hub.longitude != null
                        ? `${hub.latitude}, ${hub.longitude}`
                        : '—'
                    }
                  />
                </div>
              )}
              <DetailRow
                icon={Calendar}
                label='Ngày tạo'
                value={formatDateTime(hub.createdAt)}
              />
              <DetailRow
                icon={Calendar}
                label='Cập nhật lần cuối'
                value={formatDateTime(hub.updatedAt)}
              />
            </div>
          </div>

          {/* Staff Section */}
          <div className='px-6 py-5'>
            <div className='mb-4 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <h3 className='text-xs font-semibold uppercase tracking-wider text-text-sub'>
                  Nhân viên hub
                </h3>
                {staffQuery.isSuccess && (
                  <span className='inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400'>
                    {staff.length}
                  </span>
                )}
              </div>
              <label className='flex cursor-pointer items-center gap-2 select-none'>
                <span className='text-xs text-text-sub'>Chỉ đã xác thực</span>
                <div className='relative'>
                  <input
                    type='checkbox'
                    checked={activeOnly}
                    onChange={(e) => setActiveOnly(e.target.checked)}
                    className='sr-only peer'
                  />
                  <div className='h-5 w-9 rounded-full bg-gray-200 dark:bg-white/12 peer-checked:bg-blue-500 transition-colors' />
                  <div className='absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4' />
                </div>
              </label>
            </div>

            {/* Staff content */}
            {staffQuery.isLoading && (
              <div className='flex items-center justify-center py-10 gap-2 text-text-sub'>
                <Loader2 size={18} className='animate-spin' />
                <span className='text-sm'>Đang tải danh sách nhân viên…</span>
              </div>
            )}

            {staffQuery.isError && (
              <div className='flex items-center justify-center py-10 text-sm text-red-500'>
                Không thể tải danh sách nhân viên.
              </div>
            )}

            {staffQuery.isSuccess && staff.length === 0 && (
              <div className='flex flex-col items-center justify-center py-10 gap-2 text-text-sub'>
                <Users size={32} className='opacity-30' />
                <p className='text-sm'>
                  {activeOnly
                    ? 'Không có nhân viên đã xác thực nào.'
                    : 'Hub này chưa có nhân viên.'}
                </p>
              </div>
            )}

            {staffQuery.isSuccess && staff.length > 0 && (
              <div className='overflow-hidden rounded-lg border border-gray-100 dark:border-white/8'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='bg-gray-50 dark:bg-white/4 text-left'>
                      <th className='px-4 py-2.5 text-xs font-medium text-text-sub'>
                        Nhân viên
                      </th>
                      <th className='hidden sm:table-cell px-4 py-2.5 text-xs font-medium text-text-sub'>
                        Email
                      </th>
                      <th className='hidden md:table-cell px-4 py-2.5 text-xs font-medium text-text-sub'>
                        SĐT
                      </th>
                      <th className='px-4 py-2.5 text-xs font-medium text-text-sub text-right'>
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-50 dark:divide-white/5'>
                    {staff.map((member) => (
                      <tr
                        key={member.userId}
                        className='hover:bg-gray-50/60 dark:hover:bg-white/4 transition-colors'
                      >
                        {/* Avatar + Name */}
                        <td className='px-4 py-3'>
                          <div className='flex items-center gap-3'>
                            {member.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={member.avatarUrl}
                                alt={`${member.firstName} ${member.lastName}`}
                                className='size-8 rounded-full object-cover shrink-0'
                              />
                            ) : (
                              <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-400 to-indigo-500 text-xs font-semibold text-white'>
                                {getInitials(member.firstName, member.lastName)}
                              </div>
                            )}
                            <div className='min-w-0'>
                              <p className='font-medium text-text-main truncate'>
                                {member.firstName} {member.lastName}
                              </p>
                              {member.nickname && (
                                <p className='text-xs text-text-sub truncate'>
                                  @{member.nickname}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        {/* Email */}
                        <td className='hidden sm:table-cell px-4 py-3 text-text-sub truncate max-w-45'>
                          {member.email}
                        </td>
                        {/* Phone */}
                        <td className='hidden md:table-cell px-4 py-3 text-text-sub'>
                          {member.phoneNumber ?? '—'}
                        </td>
                        {/* Status */}
                        <td className='px-4 py-3 text-right'>
                          {member.isVerified ? (
                            <span className='inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-950/40 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400'>
                              <CheckCircle2 size={10} />
                              Đã xác thực
                            </span>
                          ) : (
                            <span className='inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-white/8 px-2 py-0.5 text-xs font-medium text-gray-500'>
                              <XCircle size={10} />
                              Chưa xác thực
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className='shrink-0 flex justify-end border-t border-gray-100 dark:border-white/8 px-6 py-4'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg border border-gray-200 dark:border-white/12 bg-white dark:bg-surface-card px-4 py-2 text-sm font-medium text-text-main hover:bg-gray-50 dark:hover:bg-white/6 transition'
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
