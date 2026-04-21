'use client';

/**
 * RentalOrderDetailView
 * ─────────────────────────────────────────────────────────────────────────────
 * Trang chi tiết đơn thuê - hiển thị mọi thông tin đơn hàng trên một trang
 * riêng biệt, trực quan, dễ đọc hơn so với dialog.
 *
 * Route: /dashboard/rental-orders/[rentalOrderId]
 */

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowLeft,
  Package,
  Building2,
  User2,
  Loader2,
  Banknote,
  CircleDot,
  AlertTriangle,
  FileText,
  ExternalLink,
  Hash,
  ChevronRight,
  BadgeCheck,
  Truck,
  ArrowRightCircle,
  XCircle,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  useRentalOrderQuery,
  useRentalOrderContractQuery,
  useUpdateOrderStatusMutation,
} from '../hooks/use-rental-order-management';
import { useAssignStaffMutation } from '../hooks/use-rental-order-assignment';
import { StaffPickerDialog } from './staff-picker-dialog';
import { PolicyPdfPreview } from '@/features/policies/components/policy-pdf-preview';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  STATUS_LABELS,
  STATUS_STYLES,
  type RentalOrderStatus,
  type RentalOrderResponse,
} from '../types';
import type { HubStaffResponse } from '@/features/hubs/types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatCurrency(v: number | null | undefined) {
  if (v == null) return '-';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(v);
}

/**
 * Parse ngày giờ linh hoạt - hỗ trợ:
 *  - ISO 8601: "2026-03-24T10:30:00Z"
 *  - BE custom: "2026-03-24 10:30:00 AM"
 *  - Date-only: "2026-03-24"
 */
function parseDate(raw: string | null | undefined): Date | null {
  if (!raw) return null;

  // Thử ISO trước
  let d = new Date(raw);
  if (!isNaN(d.getTime())) return d;

  // BE custom format: "2026-03-24 10:30:00 AM" → chuyển thành parsable
  const match = raw.match(
    /^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}:\d{2}:\d{2})\s*(AM|PM)?$/i,
  );
  if (match) {
    const [, datePart, timePart, ampm] = match;
    if (ampm) {
      // 12-hour format → convert to 24h
      // BE đôi khi gửi 24h kèm AM/PM (ví dụ "22:46:02 PM") → bỏ qua AM/PM
      const [hh, mm, ss] = timePart.split(':').map(Number);
      let hour24 = hh;
      if (hh <= 12) {
        if (ampm.toUpperCase() === 'PM' && hh !== 12) hour24 += 12;
        if (ampm.toUpperCase() === 'AM' && hh === 12) hour24 = 0;
      }
      d = new Date(
        `${datePart}T${String(hour24).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`,
      );
    } else {
      d = new Date(`${datePart}T${timePart}`);
    }
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

function formatDate(raw: string | null | undefined): string {
  const d = parseDate(raw);
  if (!d) return '-';
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateTime(raw: string | null | undefined): string {
  const d = parseDate(raw);
  if (!d) return '-';
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-100 dark:border-white/8 bg-white dark:bg-surface-card overflow-hidden',
        className,
      )}
    >
      <div className='flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/2'>
        <Icon className='w-4 h-4 text-text-sub' />
        <h3 className='text-sm font-semibold text-text-main'>{title}</h3>
      </div>
      <div className='px-5 py-4'>{children}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className='flex items-start gap-3 py-1.5'>
      <span className='text-xs text-text-sub w-36 shrink-0'>{label}</span>
      <span
        className={cn(
          'text-sm font-medium text-text-main flex-1',
          mono && 'font-mono',
        )}
      >
        {value || '-'}
      </span>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className='rounded-xl border border-gray-100 dark:border-white/8 bg-gray-50 dark:bg-white/3 px-4 py-3'>
      <p className='text-[11px] text-text-sub mb-0.5'>{label}</p>
      <p
        className={cn(
          'text-base font-bold',
          accent ? 'text-theme-primary-start' : 'text-text-main',
        )}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: RentalOrderStatus }) {
  const s = STATUS_STYLES[status] ?? {
    dot: 'bg-gray-400',
    cls: 'text-gray-600 bg-gray-100 border-gray-200',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold',
        s.cls,
      )}
    >
      <span className={cn('w-2 h-2 rounded-full', s.dot)} />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Staff Assignment Section (interactive - inline on detail page)
// ─────────────────────────────────────────────────────────────────────────────

const PICKUP_ONLY_STATUSES = new Set([
  'PREPARING',
  'DELIVERING',
  'DELIVERED',
  'IN_USE',
] as const);

function StaffSlotButton({
  role,
  staff,
  onClick,
}: {
  role: 'delivery' | 'pickup';
  staff: HubStaffResponse | null;
  onClick: () => void;
}) {
  const isDelivery = role === 'delivery';
  const label = isDelivery ? 'Nhân viên giao hàng' : 'Nhân viên thu hồi';
  const accent = isDelivery
    ? 'text-theme-primary-start'
    : 'text-emerald-600 dark:text-emerald-400';
  const accentBg = isDelivery
    ? 'bg-theme-primary-start/5 dark:bg-theme-primary-start/10 border-theme-primary-start/20 dark:border-theme-primary-end/40'
    : 'bg-emerald-50 dark:bg-emerald-900/15 border-emerald-200 dark:border-emerald-700/50';
  const emptyBg =
    'bg-gray-50 dark:bg-white/4 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20';

  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-all text-left',
        staff ? accentBg : emptyBg,
      )}
    >
      <div className='flex items-center gap-3 min-w-0'>
        <div
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
            staff
              ? isDelivery
                ? 'bg-theme-primary-start text-white'
                : 'bg-emerald-500 text-white'
              : 'bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400',
          )}
        >
          {staff?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={staff.avatarUrl}
              alt=''
              className='w-full h-full rounded-xl object-cover'
            />
          ) : (
            <User2 className='w-4 h-4' />
          )}
        </div>
        <div className='min-w-0'>
          <p className='text-[11px] text-text-sub'>{label}</p>
          {staff ? (
            <p className={cn('text-sm font-semibold truncate', accent)}>
              {staff.firstName} {staff.lastName}
            </p>
          ) : (
            <p className='text-sm text-text-sub italic'>
              Chưa chọn - bấm để chọn
            </p>
          )}
        </div>
      </div>
      <ChevronRight className='w-4 h-4 text-text-sub shrink-0' />
    </button>
  );
}

function StaffAssignmentSection({ order }: { order: RentalOrderResponse }) {
  const [deliveryStaff, setDeliveryStaff] = useState<HubStaffResponse | null>(
    order.deliveryStaff ?? null,
  );
  const [pickupStaff, setPickupStaff] = useState<HubStaffResponse | null>(
    order.pickupStaff ?? null,
  );
  const [pickerOpen, setPickerOpen] = useState<'delivery' | 'pickup' | null>(
    null,
  );

  const assignMutation = useAssignStaffMutation();

  const canAssignDelivery = order.status === 'PAID';
  const canAssignPickup =
    order.status === 'PAID' || PICKUP_ONLY_STATUSES.has(order.status as never);
  const canAssign = canAssignDelivery || canAssignPickup;

  const canSubmit =
    (canAssignDelivery && !!deliveryStaff) ||
    (canAssignPickup && !!pickupStaff);

  const handleConfirm = async () => {
    if (!canSubmit) {
      toast.warning('Vui lòng chọn ít nhất một nhân viên.');
      return;
    }
    try {
      await assignMutation.mutateAsync({
        rentalOrderId: order.rentalOrderId,
        payload: {
          deliveryStaffId: canAssignDelivery
            ? (deliveryStaff?.userId ?? undefined)
            : undefined,
          pickupStaffId: canAssignPickup
            ? (pickupStaff?.userId ?? undefined)
            : undefined,
        },
      });
      toast.success('Gán nhân viên thành công!');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Gán nhân viên thất bại.',
      );
    }
  };

  return (
    <>
      <SectionCard title='Phân công nhân viên' icon={Truck}>
        {!canAssign ? (
          <div className='flex items-center gap-2.5 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-900/15 px-4 py-3'>
            <CircleDot className='w-4 h-4 text-amber-500 shrink-0' />
            <p className='text-sm text-amber-700 dark:text-amber-400'>
              Đơn ở trạng thái{' '}
              <span className='font-semibold'>
                {STATUS_LABELS[order.status]}
              </span>{' '}
              - không thể phân công nhân viên.
            </p>
          </div>
        ) : (
          <div className='space-y-3'>
            {canAssignDelivery && (
              <StaffSlotButton
                role='delivery'
                staff={deliveryStaff}
                onClick={() => setPickerOpen('delivery')}
              />
            )}
            {canAssignPickup && (
              <StaffSlotButton
                role='pickup'
                staff={pickupStaff}
                onClick={() => setPickerOpen('pickup')}
              />
            )}

            {/* Summary + confirm */}
            <div className='flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/8'>
              <div className='flex items-center gap-2 text-xs text-text-sub flex-wrap'>
                {canAssignDelivery && deliveryStaff && (
                  <span className='flex items-center gap-1 text-theme-primary-start'>
                    <BadgeCheck className='w-3.5 h-3.5' />
                    Giao: {deliveryStaff.firstName} {deliveryStaff.lastName}
                  </span>
                )}
                {canAssignPickup && pickupStaff && (
                  <span className='flex items-center gap-1 text-emerald-600 dark:text-emerald-400'>
                    <BadgeCheck className='w-3.5 h-3.5' />
                    Thu hồi: {pickupStaff.firstName} {pickupStaff.lastName}
                  </span>
                )}
              </div>
              <button
                type='button'
                onClick={handleConfirm}
                disabled={assignMutation.isPending || !canSubmit}
                className='flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-theme-primary-start hover:brightness-110 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
              >
                {assignMutation.isPending ? (
                  <Loader2 className='w-3.5 h-3.5 animate-spin' />
                ) : (
                  <Truck className='w-3.5 h-3.5' />
                )}
                Xác nhận gán
              </button>
            </div>
          </div>
        )}
      </SectionCard>

      {/* Staff picker dialog */}
      {pickerOpen && canAssign && (
        <StaffPickerDialog
          role={pickerOpen}
          hubId={order.hubId ?? ''}
          isOpen={!!pickerOpen}
          onClose={() => setPickerOpen(null)}
          onSelected={(staff) => {
            if (pickerOpen === 'delivery') setDeliveryStaff(staff);
            else setPickupStaff(staff);
            setPickerOpen(null);
          }}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Update Status Section (ADMIN action)
// ─────────────────────────────────────────────────────────────────────────────

interface StatusTransitionOption {
  to: RentalOrderStatus;
  label: string;
  description?: string;
  requiresIssueNote?: boolean;
  isCancellation?: boolean;
  apiNote?: string;
}

const ADMIN_TRANSITIONS: Partial<
  Record<RentalOrderStatus, StatusTransitionOption[]>
> = {
  PENDING_PAYMENT: [
    {
      to: 'PAID',
      label: 'Xác nhận đã thanh toán',
      description: 'Hợp lệ khi tổng giao dịch SUCCESS đủ tổng thanh toán',
    },
    {
      to: 'CANCELLED',
      label: 'Hủy đơn',
      isCancellation: true,
      description: 'Hoàn kho hàng đã giữ (RESERVED → AVAILABLE)',
    },
  ],
  PAID: [
    {
      to: 'PREPARING',
      label: 'Bắt đầu chuẩn bị',
      description: 'Yêu cầu đơn phải có hợp đồng thuê',
    },
  ],
  PREPARING: [
    {
      to: 'DELIVERING',
      label: 'Bắt đầu giao hàng',
      description: 'Yêu cầu có hợp đồng và nhân viên giao hàng đã được gán',
    },
    {
      to: 'CANCELLED',
      label: 'Hủy đơn',
      isCancellation: true,
      description: 'Hoàn kho hàng đã giữ',
    },
  ],
  DELIVERING: [
    {
      to: 'DELIVERED',
      label: 'Xác nhận đã giao hàng',
      apiNote: 'Nên dùng API record-delivery để ghi nhận thời gian & tọa độ',
    },
  ],
  DELIVERED: [
    {
      to: 'IN_USE',
      label: 'Xác nhận đang sử dụng',
      description: 'Đơn phải có dữ liệu giao hàng thực tế',
    },
    {
      to: 'PENDING_PICKUP',
      label: 'Thu hồi sớm do sự cố',
      requiresIssueNote: true,
      description:
        'Chỉ ADMIN — bắt buộc nhập ghi chú sự cố. Backend tự lưu issueReportedAt + issueReportNote.',
    },
  ],
  IN_USE: [
    {
      to: 'PENDING_PICKUP',
      label: 'Yêu cầu thu hồi',
      description:
        'Phải gán nhân viên thu hồi trước khi chuyển sang PICKING_UP',
    },
  ],
  PENDING_PICKUP: [
    {
      to: 'PICKING_UP',
      label: 'Bắt đầu thu hồi',
      description: 'Phải có nhân viên thu hồi được gán',
    },
  ],
  PICKING_UP: [
    {
      to: 'PICKED_UP',
      label: 'Xác nhận đã thu hồi',
      apiNote: 'Nên dùng API record-pickup để ghi nhận thời gian & tọa độ',
    },
  ],
  PICKED_UP: [
    {
      to: 'COMPLETED',
      label: 'Hoàn tất đơn thuê',
      description:
        'Nếu depositRefundAmount > 0, bắt buộc phải có giao dịch DEPOSIT_REFUND SUCCESS qua ngân hàng trước',
    },
  ],
};

function UpdateStatusSection({ order }: { order: RentalOrderResponse }) {
  const transitions = ADMIN_TRANSITIONS[order.status] ?? [];
  const updateMutation = useUpdateOrderStatusMutation();

  const [selected, setSelected] = useState<StatusTransitionOption | null>(null);
  const [issueNote, setIssueNote] = useState('');
  const [confirming, setConfirming] = useState(false);

  const handleSelect = (opt: StatusTransitionOption) => {
    setSelected(opt);
    setIssueNote('');
    setConfirming(true);
  };

  const handleConfirm = async () => {
    if (!selected) return;
    if (selected.requiresIssueNote && !issueNote.trim()) {
      toast.warning('Vui lòng nhập ghi chú sự cố.');
      return;
    }
    try {
      await updateMutation.mutateAsync({
        rentalOrderId: order.rentalOrderId,
        payload: {
          status: selected.to,
          ...(selected.requiresIssueNote && issueNote.trim()
            ? { issueNote: issueNote.trim() }
            : {}),
        },
      });
      setConfirming(false);
      setSelected(null);
      setIssueNote('');
    } catch {
      // error handled in mutation onError
    }
  };

  const handleCancel = () => {
    setConfirming(false);
    setSelected(null);
    setIssueNote('');
  };

  if (
    order.status === 'COMPLETED' ||
    order.status === 'CANCELLED' ||
    transitions.length === 0
  ) {
    return (
      <SectionCard title='Cập nhật trạng thái' icon={ArrowRightCircle}>
        <div className='flex items-center gap-2.5 rounded-xl border border-gray-100 dark:border-white/8 bg-gray-50 dark:bg-white/4 px-4 py-3'>
          <Info className='w-4 h-4 text-text-sub shrink-0' />
          <p className='text-sm text-text-sub'>
            {order.status === 'COMPLETED' || order.status === 'CANCELLED'
              ? 'Đơn hàng đã kết thúc, không thể cập nhật trạng thái.'
              : 'Không có bước chuyển trạng thái khả dụng.'}
          </p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title='Cập nhật trạng thái' icon={ArrowRightCircle}>
      {!confirming ? (
        <div className='space-y-2'>
          <p className='text-xs text-text-sub mb-3'>
            Trạng thái hiện tại:{' '}
            <span className='font-semibold text-text-main'>
              {STATUS_LABELS[order.status]}
            </span>
          </p>
          {transitions.map((opt) => (
            <button
              key={opt.to}
              type='button'
              onClick={() => handleSelect(opt)}
              className={cn(
                'w-full flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all hover:shadow-sm',
                opt.isCancellation
                  ? 'border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20'
                  : opt.requiresIssueNote
                    ? 'border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20'
                    : 'border-gray-100 dark:border-white/8 bg-gray-50 dark:bg-white/3 hover:bg-gray-100 dark:hover:bg-white/5',
              )}
            >
              <div className='mt-0.5 shrink-0'>
                {opt.isCancellation ? (
                  <XCircle className='w-4 h-4 text-red-500' />
                ) : (
                  <ArrowRightCircle
                    className={cn(
                      'w-4 h-4',
                      opt.requiresIssueNote
                        ? 'text-amber-500'
                        : 'text-theme-primary-start',
                    )}
                  />
                )}
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 flex-wrap'>
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      opt.isCancellation
                        ? 'text-red-700 dark:text-red-400'
                        : opt.requiresIssueNote
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-text-main',
                    )}
                  >
                    {opt.label}
                  </span>
                  <span className='text-[11px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-text-sub'>
                    → {opt.to}
                  </span>
                </div>
                {opt.description && (
                  <p className='text-xs text-text-sub mt-0.5'>
                    {opt.description}
                  </p>
                )}
                {opt.apiNote && (
                  <p className='text-xs text-blue-500 dark:text-blue-400 mt-0.5 flex items-center gap-1'>
                    <Info className='w-3 h-3 shrink-0' />
                    {opt.apiNote}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className='space-y-3'>
          {/* Confirm header */}
          <div
            className={cn(
              'rounded-xl border px-4 py-3',
              selected?.isCancellation
                ? 'border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-900/10'
                : selected?.requiresIssueNote
                  ? 'border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-900/10'
                  : 'border-blue-100 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-900/10',
            )}
          >
            <p className='text-sm font-semibold text-text-main'>
              Xác nhận:{' '}
              <span className='font-mono text-xs'>
                {order.status} → {selected?.to}
              </span>
            </p>
            {selected?.description && (
              <p className='text-xs text-text-sub mt-1'>
                {selected.description}
              </p>
            )}
          </div>

          {/* issueNote input (DELIVERED → PENDING_PICKUP) */}
          {selected?.requiresIssueNote && (
            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-text-main'>
                Ghi chú sự cố <span className='text-red-500'>*</span>
              </label>
              <textarea
                rows={3}
                value={issueNote}
                onChange={(e) => setIssueNote(e.target.value)}
                placeholder='Mô tả sự cố xảy ra sau khi giao hàng...'
                className='w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-card px-3 py-2 text-sm text-text-main placeholder:text-text-sub resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400'
              />
            </div>
          )}

          {/* Actions */}
          <div className='flex items-center gap-2 pt-1'>
            <button
              type='button'
              onClick={handleConfirm}
              disabled={
                updateMutation.isPending ||
                (selected?.requiresIssueNote ? !issueNote.trim() : false)
              }
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                selected?.isCancellation
                  ? 'bg-red-500 hover:bg-red-600'
                  : selected?.requiresIssueNote
                    ? 'bg-amber-500 hover:bg-amber-600'
                    : 'bg-theme-primary-start hover:brightness-110',
              )}
            >
              {updateMutation.isPending ? (
                <Loader2 className='w-3.5 h-3.5 animate-spin' />
              ) : selected?.isCancellation ? (
                <XCircle className='w-3.5 h-3.5' />
              ) : (
                <ArrowRightCircle className='w-3.5 h-3.5' />
              )}
              Xác nhận
            </button>
            <button
              type='button'
              onClick={handleCancel}
              disabled={updateMutation.isPending}
              className='px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-white/10 text-text-sub hover:bg-gray-100 dark:hover:bg-white/10 transition-colors disabled:opacity-40'
            >
              Huỷ
            </button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

interface RentalOrderDetailViewProps {
  rentalOrderId: string;
  /** Khi render trong dialog: ẩn back-button header, bỏ padding ngoài */
  isDialog?: boolean;
}

export function RentalOrderDetailView({
  rentalOrderId,
  isDialog = false,
}: RentalOrderDetailViewProps) {
  const {
    data: order,
    isLoading,
    isError,
  } = useRentalOrderQuery(rentalOrderId);

  const { data: contract, isLoading: contractLoading } =
    useRentalOrderContractQuery(rentalOrderId);

  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center py-32 gap-3'>
        <Loader2 className='w-8 h-8 animate-spin text-theme-primary-start' />
        <p className='text-sm text-text-sub'>Đang tải chi tiết đơn thuê...</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className='flex flex-col items-center justify-center py-32 gap-4'>
        <AlertTriangle className='w-10 h-10 text-red-400' />
        <p className='text-sm text-text-sub'>
          Không thể tải thông tin đơn thuê.
        </p>
        <Link
          href='/dashboard/rental-orders'
          className='text-sm text-theme-primary-start hover:underline'
        >
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  const addr = order.userAddress;

  return (
    <div
      className={cn(
        'flex flex-col gap-6 w-full lg:max-w-6xl mx-auto',
        isDialog ? 'p-1' : 'p-6',
      )}
    >
      {/* ── Header ── */}
      {!isDialog && (
        <div className='flex items-start justify-between gap-4'>
          <div className='flex items-start gap-4'>
            <Link
              href='/dashboard/rental-orders'
              className='mt-1 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors'
              title='Quay lại'
            >
              <ArrowLeft className='w-5 h-5 text-text-sub' />
            </Link>
            <div>
              <div className='flex items-center gap-3 mb-1'>
                <h1 className='text-2xl font-bold tracking-tight text-text-main'>
                  Chi tiết đơn thuê
                </h1>
                <StatusBadge status={order.status} />
              </div>
              <p className='text-sm text-text-sub'>
                <span className='font-mono font-semibold text-theme-primary-start'>
                  #{order.rentalOrderId.slice(0, 8).toUpperCase()}
                </span>
                {' - '}
                {addr?.recipientName ?? 'N/A'} · Đặt ngày{' '}
                {formatDate(order.placedAt)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Body grid ── */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-5'>
        {/* ─── Left column (2/3) ─── */}
        <div className='lg:col-span-2 space-y-5'>
          {/* Order info */}
          <SectionCard title='Thông tin đơn hàng' icon={Package}>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0'>
              <InfoRow label='Người nhận' value={addr?.recipientName ?? '-'} />
              <InfoRow label='SĐT' value={addr?.phoneNumber ?? '-'} />
              <InfoRow
                label='Địa chỉ giao'
                value={
                  [addr?.addressLine, addr?.ward, addr?.district, addr?.city]
                    .filter(Boolean)
                    .join(', ') || '-'
                }
              />
              <InfoRow
                label='Ngày giao dự kiến'
                value={formatDate(order.expectedDeliveryDate)}
              />
              <InfoRow
                label='Ngày kết thúc dự kiến'
                value={formatDate(order.expectedRentalEndDate)}
              />
              {order.actualDeliveryAt && (
                <InfoRow
                  label='Giao thực tế'
                  value={formatDateTime(order.actualDeliveryAt)}
                />
              )}
              {order.actualRentalEndAt && (
                <InfoRow
                  label='Kết thúc thực tế'
                  value={formatDateTime(order.actualRentalEndAt)}
                />
              )}
              {order.pickedUpAt && (
                <InfoRow
                  label='Ngày thu hồi'
                  value={formatDateTime(order.pickedUpAt)}
                />
              )}
              <InfoRow
                label='Ngày đặt hàng'
                value={formatDateTime(order.placedAt)}
              />
            </div>
          </SectionCard>

          {/* Order lines */}
          {order.rentalOrderLines.length > 0 && (
            <SectionCard
              title={`Sản phẩm thuê (${order.rentalOrderLines.length})`}
              icon={CircleDot}
            >
              <div className='space-y-3'>
                {order.rentalOrderLines.map((line) => (
                  <div
                    key={line.rentalOrderLineId}
                    className='flex items-center gap-4 rounded-xl border border-gray-100 dark:border-white/8 bg-gray-50 dark:bg-white/3 px-4 py-3.5'
                  >
                    <div className='w-10 h-10 rounded-lg bg-theme-primary-start/5 dark:bg-theme-primary-start/10 flex items-center justify-center shrink-0'>
                      {line.colorCodeSnapshot ? (
                        <div
                          className='w-6 h-6 rounded-full border-2 border-white dark:border-gray-700 shadow-sm'
                          style={{
                            backgroundColor: line.colorCodeSnapshot,
                          }}
                          title={line.colorNameSnapshot ?? ''}
                        />
                      ) : (
                        <CircleDot className='w-5 h-5 text-theme-primary-start' />
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-semibold text-text-main truncate'>
                        {line.productNameSnapshot}
                      </p>
                      <div className='flex items-center gap-2 mt-1 flex-wrap'>
                        {line.inventorySerialNumber && (
                          <span className='text-[11px] font-mono px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-text-sub'>
                            S/N: {line.inventorySerialNumber}
                          </span>
                        )}
                        {line.colorNameSnapshot && (
                          <span className='text-[11px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-text-sub flex items-center gap-1'>
                            {line.colorCodeSnapshot && (
                              <span
                                className='inline-block w-2.5 h-2.5 rounded-full border border-gray-200 dark:border-white/20'
                                style={{
                                  backgroundColor: line.colorCodeSnapshot,
                                }}
                              />
                            )}
                            {line.colorNameSnapshot}
                          </span>
                        )}
                        <span className='text-[11px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/15 text-blue-600 dark:text-blue-400'>
                          {line.rentalDurationDays} ngày
                        </span>
                        {line.voucherCodeSnapshot && (
                          <span className='text-[11px] px-2 py-0.5 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'>
                            🎟 {line.voucherCodeSnapshot}
                            {line.voucherDiscountAmount > 0 &&
                              ` (-${formatCurrency(line.voucherDiscountAmount)})`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className='text-right shrink-0'>
                      <p className='text-sm font-bold text-text-main'>
                        {formatCurrency(line.dailyPriceSnapshot)}
                        <span className='font-normal text-text-sub text-xs'>
                          /ngày
                        </span>
                      </p>
                      <p className='text-xs text-text-sub mt-0.5'>
                        Cọc: {formatCurrency(line.depositAmountSnapshot)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Financials */}
          <SectionCard title='Tài chính' icon={Banknote}>
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
              <StatCard
                label='Tiền thuê'
                value={formatCurrency(order.rentalSubtotalAmount) ?? '-'}
              />
              <StatCard
                label='Phí dịch vụ'
                value={formatCurrency(order.rentalFeeAmount) ?? '-'}
              />
              <StatCard
                label='Giảm giá'
                value={
                  order.voucherDiscountAmount
                    ? `- ${formatCurrency(order.voucherDiscountAmount)}`
                    : '-'
                }
              />
              <StatCard
                label='Tiền đặt cọc'
                value={formatCurrency(order.depositHoldAmount) ?? '-'}
              />
              <StatCard
                label='Đã thanh toán'
                value={formatCurrency(order.totalPaidAmount) ?? '-'}
              />
              <StatCard
                label='Tổng thanh toán'
                value={formatCurrency(order.totalPayableAmount) ?? '-'}
                accent
              />
              {order.damagePenaltyAmount != null && (
                <StatCard
                  label='Phí hư hại'
                  value={formatCurrency(order.damagePenaltyAmount) ?? '-'}
                />
              )}
              {order.overduePenaltyAmount != null && (
                <StatCard
                  label='Phí trễ hạn'
                  value={formatCurrency(order.overduePenaltyAmount) ?? '-'}
                />
              )}
              {order.provisionalOverduePenaltyAmount != null && (
                <StatCard
                  label='Phí trễ hạn (tạm)'
                  value={
                    formatCurrency(order.provisionalOverduePenaltyAmount) ?? '-'
                  }
                />
              )}
              {order.penaltyChargeAmount != null && (
                <StatCard
                  label='Tổng phí phạt'
                  value={formatCurrency(order.penaltyChargeAmount) ?? '-'}
                />
              )}
              {order.depositRefundAmount != null && (
                <StatCard
                  label='Hoàn cọc'
                  value={formatCurrency(order.depositRefundAmount) ?? '-'}
                />
              )}
            </div>
          </SectionCard>
        </div>

        {/* ─── Right column (1/3) ─── */}
        <div className='space-y-5'>
          {/* Hub info */}
          <SectionCard title='Hub xử lý' icon={Building2}>
            {order.hubName ? (
              <div className='space-y-1'>
                <InfoRow
                  label='Hub'
                  value={
                    <span className='text-theme-primary-start font-semibold'>
                      {order.hubCode ? `[${order.hubCode}] ` : ''}
                      {order.hubName}
                    </span>
                  }
                />
                {order.hubAddressLine && (
                  <InfoRow
                    label='Địa chỉ'
                    value={
                      [
                        order.hubAddressLine,
                        order.hubWard,
                        order.hubDistrict,
                        order.hubCity,
                      ]
                        .filter(Boolean)
                        .join(', ') || '-'
                    }
                  />
                )}
                {order.hubPhone && (
                  <InfoRow label='SĐT' value={order.hubPhone} />
                )}
              </div>
            ) : (
              <p className='text-sm text-red-500 italic'>Chưa gán hub</p>
            )}
          </SectionCard>

          {/* Staff assignment (interactive) */}
          <StaffAssignmentSection order={order} />

          {/* Status update actions (ADMIN) */}
          <UpdateStatusSection order={order} />

          {/* Issue tracking */}
          {order.issueReportNote && (
            <SectionCard title='Sự cố' icon={AlertTriangle}>
              <div className='rounded-xl bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-500/30 px-4 py-3 space-y-1'>
                <p className='text-sm text-amber-700 dark:text-amber-400'>
                  {order.issueReportNote}
                </p>
                {order.issueReportedAt && (
                  <p className='text-xs text-amber-600/70 dark:text-amber-500/70'>
                    Báo cáo lúc: {formatDateTime(order.issueReportedAt)}
                  </p>
                )}
              </div>
            </SectionCard>
          )}

          {/* QR Code */}
          {order.qrCode && (
            <SectionCard title='Mã QR' icon={Hash}>
              <div className='flex flex-col items-center gap-3'>
                {/* Render QR as image from base64 */}
                {order.qrCode.startsWith('data:') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={order.qrCode}
                    alt='QR Code'
                    className='w-48 h-48 rounded-xl border border-gray-100 dark:border-white/10 bg-white p-2'
                  />
                ) : order.qrCode.length > 100 ? (
                  // Likely raw base64 without data URI prefix
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`data:image/png;base64,${order.qrCode}`}
                    alt='QR Code'
                    className='w-48 h-48 rounded-xl border border-gray-100 dark:border-white/10 bg-white p-2'
                  />
                ) : (
                  // Short text - probably just a code string
                  <div className='px-4 py-3 rounded-xl border border-gray-100 dark:border-white/8 bg-gray-50 dark:bg-white/4 w-full'>
                    <p className='text-xs font-mono text-text-sub break-all text-center'>
                      {order.qrCode}
                    </p>
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {/* Contract */}
          <SectionCard title='Hợp đồng thuê' icon={FileText}>
            {contractLoading ? (
              <div className='flex items-center gap-2'>
                <Loader2 className='w-4 h-4 animate-spin text-text-sub' />
                <span className='text-xs text-text-sub'>
                  Đang tải hợp đồng…
                </span>
              </div>
            ) : contract ? (
              <div className='space-y-1'>
                <InfoRow
                  label='Số hợp đồng'
                  value={
                    <span className='font-mono font-semibold text-theme-primary-start'>
                      {contract.contractNumber}
                    </span>
                  }
                />
                <InfoRow
                  label='Phiên bản'
                  value={`v${contract.contractVersion}`}
                />
                <InfoRow
                  label='Phương thức chấp nhận'
                  value={
                    contract.acceptMethod === 'SIGNATURE'
                      ? 'Ký tay'
                      : 'Click đồng ý'
                  }
                />
                <InfoRow
                  label='Đồng ý lúc'
                  value={formatDateTime(contract.acceptedAt)}
                />
                <InfoRow
                  label='Tạo lúc'
                  value={formatDateTime(contract.createdAt)}
                />
                {contract.contractPdfUrl && (
                  <div className='pt-3 flex flex-wrap items-center gap-2'>
                    <button
                      type='button'
                      onClick={() => setPdfPreviewUrl(contract.contractPdfUrl)}
                      className='inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-theme-primary-start/5 dark:bg-theme-primary-start/10 border border-theme-primary-start/20 dark:border-theme-primary-start/30 text-theme-primary-start hover:bg-theme-primary-start/10 dark:hover:bg-theme-primary-start/15 transition-colors'
                    >
                      <FileText className='w-3.5 h-3.5' />
                      Xem hợp đồng
                    </button>
                    <a
                      href={contract.contractPdfUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-text-sub hover:bg-gray-100 dark:hover:bg-white/10 transition-colors'
                    >
                      <ExternalLink className='w-3.5 h-3.5' />
                      Mở tab mới
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className='flex items-center gap-2'>
                <FileText className='w-4 h-4 text-text-sub' />
                <span className='text-sm text-text-sub italic'>
                  Chưa có hợp đồng.
                </span>
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* ── PDF Preview Dialog ── */}
      <Dialog
        open={!!pdfPreviewUrl}
        onOpenChange={(val) => !val && setPdfPreviewUrl(null)}
      >
        <DialogContent className='max-w-4xl w-full max-h-[92vh] flex flex-col gap-4'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-text-main'>
              <FileText className='w-4.5 h-4.5 text-theme-primary-start' />
              Xem hợp đồng thuê
            </DialogTitle>
          </DialogHeader>
          <div className='flex-1 overflow-y-auto min-h-0'>
            {pdfPreviewUrl && <PolicyPdfPreview pdfUrl={pdfPreviewUrl} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
