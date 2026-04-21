'use client';

/**
 * RentalOrderAssignDialog
 * ─────────────────────────────────────────────────────────────────────────────
 * Dialog hiển thị chi tiết đơn thuê + chọn nhân viên giao / thu hồi.
 *
 * Flow:
 *  1. Mở dialog này khi bấm "Gán đơn" ở bảng.
 *  2. Hiển thị thông tin đơn hàng (hub, địa chỉ, ngày, tài chính, sản phẩm).
 *  3. Phân công nhân viên tuỳ theo trạng thái đơn:
 *     - PAID     → chỉ hiện ô "Nhân viên giao hàng"  (deliveryStaff)
 *     - IN_USE   → chỉ hiện ô "Nhân viên thu hồi"    (pickupStaff)
 *     - Khác     → không thể gán (section ẩn)
 *  4. Bấm "Xác nhận" → gọi API-081 PATCH /assign-staff.
 */

import { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Package,
  Building2,
  User2,
  Phone,
  ChevronRight,
  Loader2,
  BadgeCheck,
  Banknote,
  CircleDot,
  AlertTriangle,
  QrCode,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  useAssignStaffMutation,
  useConfirmCancellationRefund,
  useAdminCancelFromPaid,
  useAdminEarlyPickup,
} from '@/features/rental-orders/hooks/use-rental-order-assignment';
import { useRentalOrderContractQuery } from '@/features/rental-orders/hooks/use-rental-order-management';
import { StaffPickerDialog } from '@/features/rental-orders/components/staff-picker-dialog';
import {
  STATUS_LABELS,
  STATUS_STYLES,
  type RentalOrderResponse,
} from '@/features/rental-orders/types';
import type { HubStaffResponse } from '@/features/hubs/types';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

// ─────────────────────────────────────────────────────────────────────────────

interface RentalOrderAssignDialogProps {
  order: RentalOrderResponse;
  isOpen: boolean;
  onClose: () => void;
}

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

  // BE custom format: "2026-03-24 10:30:00 AM"
  const match = raw.match(
    /^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}:\d{2}:\d{2})\s*(AM|PM)?$/i,
  );
  if (match) {
    const [, datePart, timePart, ampm] = match;
    if (ampm) {
      const [hh, mm, ss] = timePart.split(':').map(Number);
      let hour24 = hh;
      if (ampm.toUpperCase() === 'PM' && hh !== 12) hour24 += 12;
      if (ampm.toUpperCase() === 'AM' && hh === 12) hour24 = 0;
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

function formatDate(raw: string | null | undefined) {
  const d = parseDate(raw);
  if (!d) return '-';
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateTime(raw: string | null | undefined) {
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

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className='text-[11px] font-semibold uppercase tracking-wider text-text-sub mb-2'>
      {children}
    </p>
  );
}

// ─── Info row ────────────────────────────────────────────────────────────────
function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className='flex items-start gap-2 py-1'>
      <Icon className='w-3.5 h-3.5 text-text-sub mt-0.5 shrink-0' />
      <span className='text-xs text-text-sub w-28 shrink-0'>{label}</span>
      <span className='text-xs font-medium text-text-main flex-1'>
        {value || '-'}
      </span>
    </div>
  );
}

// ─── Staff selector button ────────────────────────────────────────────────────
function StaffSlot({
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
    ? 'text-indigo-600 dark:text-indigo-400'
    : 'text-emerald-600 dark:text-emerald-400';
  const accentBg = isDelivery
    ? 'bg-indigo-50 dark:bg-indigo-900/15 border-indigo-200 dark:border-indigo-700/50'
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
        {/* Icon slot */}
        <div
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
            staff
              ? isDelivery
                ? 'bg-indigo-500 text-white'
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

        {/* Text */}
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

// ─────────────────────────────────────────────────────────────────────────────
// Admin support actions section
// ─────────────────────────────────────────────────────────────────────────────

function formatDateTimeAdmin(raw: string | null | undefined) {
  if (!raw) return '-';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function AdminSupportSection({ order }: { order: RentalOrderResponse }) {
  const [cancelReason, setCancelReason] = useState('');
  const [refundConfirmed, setRefundConfirmed] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);

  const confirmMutation = useConfirmCancellationRefund();
  const adminCancelMutation = useAdminCancelFromPaid();
  const earlyPickupMutation = useAdminEarlyPickup();

  const hasCancellationRequest = order.cancellationRequested === true;

  return (
    <div>
      <SectionLabel>Hỗ trợ & Hủy đơn</SectionLabel>
      <div className='space-y-3'>
        {/* Cancellation request info */}
        {hasCancellationRequest && (
          <div className='rounded-xl border border-cyan-200 dark:border-cyan-700/50 bg-cyan-50/60 dark:bg-cyan-950/20 px-4 py-3 space-y-2'>
            <div className='flex items-start gap-2'>
              <AlertTriangle className='w-4 h-4 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0' />
              <div className='flex-1'>
                <p className='text-sm font-semibold text-cyan-700 dark:text-cyan-400'>
                  Yêu cầu hủy đơn từ khách hàng
                </p>
                {order.cancellationReason && (
                  <p className='text-xs text-cyan-600/80 dark:text-cyan-400/70 mt-0.5'>
                    Lý do: {order.cancellationReason}
                  </p>
                )}
                {order.cancellationRequestedAt && (
                  <p className='text-xs text-cyan-500/70 dark:text-cyan-500/50 mt-0.5'>
                    Lúc: {formatDateTimeAdmin(order.cancellationRequestedAt)}
                  </p>
                )}
                {order.depositHoldAmount != null && order.depositHoldAmount > 0 && (
                  <p className='text-xs font-semibold text-cyan-700 dark:text-cyan-400 mt-1'>
                    Số tiền cọc cần hoàn: {formatCurrency(order.depositHoldAmount)}
                  </p>
                )}
              </div>
            </div>

            {/* Confirm refund form */}
            <div className='space-y-2 pt-2 border-t border-cyan-200/60 dark:border-cyan-700/30'>
              <label className='flex items-start gap-2.5 cursor-pointer select-none'>
                <Switch
                  id='refund-confirmed'
                  checked={refundConfirmed}
                  onCheckedChange={(v) => setRefundConfirmed(v)}
                  className='mt-0.5'
                />
                <span className='text-xs text-cyan-700/80 dark:text-cyan-400/80 leading-relaxed'>
                  Tôi xác nhận đã chuyển khoản hoàn tiền cho khách hàng
                </span>
              </label>
              {order.depositHoldAmount != null && order.depositHoldAmount > 0 && (
                <p className='text-xs text-amber-600 dark:text-amber-400 px-1'>
                  Tiền hoàn: {formatCurrency(order.depositHoldAmount)}
                </p>
              )}
              <Button
                size='sm'
                disabled={
                  !refundConfirmed ||
                  confirmMutation.isPending
                }
                onClick={() => {
                  confirmMutation.mutate({
                    rentalOrderId: order.rentalOrderId,
                    input: { reason: order.cancellationReason ?? undefined },
                  });
                }}
                className='w-full bg-cyan-600 hover:bg-cyan-700 text-white'
              >
                {confirmMutation.isPending ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <>Xác nhận hủy đơn & hoàn tiền</>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Direct cancel + early pickup - shown only when no cancellation request is pending */}
        {!hasCancellationRequest && (
          <div className='space-y-2'>
            {/* Early pickup for IN_USE */}
            {order.status === 'IN_USE' && (
              <Button
                size='sm'
                variant='outline'
                disabled={earlyPickupMutation.isPending}
                onClick={() => earlyPickupMutation.mutate(order.rentalOrderId)}
                className='w-full border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20'
              >
                {earlyPickupMutation.isPending ? (
                  <Loader2 className='w-4 h-4 animate-spin mr-2' />
                ) : (
                  <AlertTriangle className='w-4 h-4 mr-2' />
                )}
                Thu hồi sớm đơn hàng
              </Button>
            )}

            {/* Direct cancel for PAID */}
            {order.status === 'PAID' && (
              <>
                {!showCancelForm ? (
                  <Button
                    size='sm'
                    variant='outline'
                    disabled={adminCancelMutation.isPending}
                    onClick={() => setShowCancelForm(true)}
                    className='w-full border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20'
                  >
                    {adminCancelMutation.isPending ? (
                      <Loader2 className='w-4 h-4 animate-spin mr-2' />
                    ) : (
                      <AlertTriangle className='w-4 h-4 mr-2' />
                    )}
                    Hủy đơn hàng (Admin)
                  </Button>
                ) : (
                  <div className='rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50/60 dark:bg-red-950/20 px-4 py-3 space-y-2'>
                    <p className='text-xs font-semibold text-red-700 dark:text-red-400'>
                      Lý do hủy đơn:
                    </p>
                    <Input
                      placeholder='Nhập lý do hủy đơn...'
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className='text-sm'
                    />
                    {order.depositHoldAmount != null && order.depositHoldAmount > 0 && (
                      <p className='text-xs text-red-600/80 dark:text-red-400/70'>
                        Tiền cọc {formatCurrency(order.depositHoldAmount)} sẽ được hoàn cho khách.
                      </p>
                    )}
                    <div className='flex gap-2'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => {
                          setShowCancelForm(false);
                          setCancelReason('');
                        }}
                        className='flex-1'
                      >
                        Hủy bỏ
                      </Button>
                      <Button
                        size='sm'
                        disabled={!cancelReason.trim() || adminCancelMutation.isPending}
                        onClick={() => {
                          adminCancelMutation.mutate({
                            rentalOrderId: order.rentalOrderId,
                            input: { reason: cancelReason.trim() },
                          });
                        }}
                        className='flex-1 bg-red-600 hover:bg-red-700 text-white'
                      >
                        {adminCancelMutation.isPending ? (
                          <Loader2 className='w-4 h-4 animate-spin' />
                        ) : null}
                        Xác nhận hủy đơn
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main dialog
// ─────────────────────────────────────────────────────────────────────────────

export function RentalOrderAssignDialog({
  order,
  isOpen,
  onClose,
}: RentalOrderAssignDialogProps) {
  const [deliveryStaff, setDeliveryStaff] = useState<HubStaffResponse | null>(
    order.deliveryStaff ?? null,
  );
  const [pickupStaff, setPickupStaff] = useState<HubStaffResponse | null>(
    order.pickupStaff ?? null,
  );
  // Which slot's picker is open: null | 'delivery' | 'pickup'
  const [pickerOpen, setPickerOpen] = useState<'delivery' | 'pickup' | null>(
    null,
  );

  const assignMutation = useAssignStaffMutation();

  // ── Contract query (API-094) ───────────────────────────────────────────────
  const { data: contract, isLoading: contractLoading } =
    useRentalOrderContractQuery(order.rentalOrderId);

  const statusStyle = STATUS_STYLES[order.status] ?? {
    dot: 'bg-gray-400',
    cls: 'text-gray-600 bg-gray-100 border-gray-200',
  };

  /**
   * Xác định các slot được phép phân công theo trạng thái đơn:
   *  - PAID                                          → delivery + pickup
   *  - PREPARING | DELIVERING | DELIVERED | IN_USE   → chỉ pickup
   *  - Khác                                          → không thể gán (mảng rỗng)
   */
  const PICKUP_ONLY_STATUSES = new Set([
    'PREPARING',
    'DELIVERING',
    'DELIVERED',
    'IN_USE',
    'PENDING_PICKUP',
  ] as const);

  const canAssignDelivery = order.status === 'PAID';
  const canAssignPickup =
    order.status === 'PAID' || PICKUP_ONLY_STATUSES.has(order.status as never);

  const canSubmit =
    (canAssignDelivery && !!deliveryStaff) ||
    (canAssignPickup && !!pickupStaff);

  const handleConfirm = async () => {
    if (!canSubmit) {
      toast.warning('Vui lòng chọn ít nhất một nhân viên trước khi xác nhận.');
      return;
    }
    try {
      await assignMutation.mutateAsync({
        rentalOrderId: order.rentalOrderId,
        payload: {
          // Chỉ gửi field khi slot đó được phép và đã chọn nhân viên
          deliveryStaffId: canAssignDelivery
            ? (deliveryStaff?.userId ?? undefined)
            : undefined,
          pickupStaffId: canAssignPickup
            ? (pickupStaff?.userId ?? undefined)
            : undefined,
        },
      });
      toast.success('Gán nhân viên thành công!');
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Gán nhân viên thất bại.',
      );
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* ── Main assign dialog ─────────────────────────────────────────── */}
      <div className='fixed inset-0 z-50 flex items-center justify-center'>
        {/* Backdrop */}
        <div
          className='absolute inset-0 bg-black/50 backdrop-blur-sm'
          onClick={onClose}
        />

        {/* Panel */}
        <div className='relative z-10 w-full max-w-2xl mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden'>
          {/* ── Header ── */}
          <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10 shrink-0'>
            <div className='flex items-center gap-3'>
              <div className='w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center'>
                <Package className='w-5 h-5 text-indigo-500' />
              </div>
              <div>
                <h2 className='text-base font-semibold text-text-main leading-tight'>
                  Gán đơn thuê
                </h2>
                <p className='text-xs text-text-sub'>
                  #{order.rentalOrderId.slice(0, 8).toUpperCase()} -{' '}
                  {order.userAddress?.recipientName ?? '-'}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              {/* Status badge */}
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium',
                  statusStyle.cls,
                )}
              >
                <span
                  className={cn('w-1.5 h-1.5 rounded-full', statusStyle.dot)}
                />
                {STATUS_LABELS[order.status]}
              </span>
              <button
                onClick={onClose}
                className='w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center transition-colors'
              >
                <X className='w-4 h-4 text-text-sub' />
              </button>
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div className='flex-1 overflow-y-auto px-6 py-5 space-y-6'>
            {/* ── Order info ── */}
            <div>
              <SectionLabel>Thông tin đơn hàng</SectionLabel>
              <div className='rounded-xl border border-gray-100 dark:border-white/8 bg-gray-50 dark:bg-white/4 px-4 py-3 space-y-0.5'>
                <InfoRow
                  icon={Building2}
                  label='Hub xử lý'
                  value={
                    order.hubName ? (
                      <span className='text-indigo-600 dark:text-indigo-400 font-semibold'>
                        {order.hubCode ? `[${order.hubCode}] ` : ''}
                        {order.hubName}
                      </span>
                    ) : (
                      <span className='text-red-500 italic'>Chưa có hub</span>
                    )
                  }
                />
                {order.hubAddressLine && (
                  <InfoRow
                    icon={MapPin}
                    label='Địa chỉ hub'
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
                  <InfoRow
                    icon={Phone}
                    label='SĐT hub'
                    value={order.hubPhone}
                  />
                )}
                <InfoRow
                  icon={Phone}
                  label='Người nhận'
                  value={`${order.userAddress?.recipientName ?? '-'} · ${order.userAddress?.phoneNumber ?? '-'}`}
                />
                <InfoRow
                  icon={MapPin}
                  label='Địa chỉ giao'
                  value={
                    [
                      order.userAddress?.addressLine,
                      order.userAddress?.ward,
                      order.userAddress?.district,
                      order.userAddress?.city,
                    ]
                      .filter(Boolean)
                      .join(', ') || '-'
                  }
                />
                <InfoRow
                  icon={Calendar}
                  label='Ngày giao dự kiến'
                  value={formatDate(order.expectedDeliveryDate)}
                />
                <InfoRow
                  icon={Calendar}
                  label='Ngày kết thúc'
                  value={formatDate(order.expectedRentalEndDate)}
                />
                {order.actualDeliveryAt && (
                  <InfoRow
                    icon={Calendar}
                    label='Giao thực tế'
                    value={formatDate(order.actualDeliveryAt)}
                  />
                )}
                {order.actualRentalEndAt && (
                  <InfoRow
                    icon={Calendar}
                    label='Kết thúc thực tế'
                    value={formatDate(order.actualRentalEndAt)}
                  />
                )}
                {order.pickedUpAt && (
                  <InfoRow
                    icon={Calendar}
                    label='Ngày thu hồi'
                    value={formatDate(order.pickedUpAt)}
                  />
                )}
              </div>
            </div>

            {/* ── Issue tracking ── */}
            {order.issueReportNote && (
              <div>
                <SectionLabel>Sự cố</SectionLabel>
                <div className='rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-900/15 px-4 py-3 space-y-0.5'>
                  <InfoRow
                    icon={AlertTriangle}
                    label='Ghi chú sự cố'
                    value={
                      <span className='text-amber-700 dark:text-amber-400'>
                        {order.issueReportNote}
                      </span>
                    }
                  />
                  {order.issueReportedAt && (
                    <InfoRow
                      icon={Calendar}
                      label='Báo cáo lúc'
                      value={formatDate(order.issueReportedAt)}
                    />
                  )}
                </div>
              </div>
            )}

            {/* ── QR Code ── */}
            {order.qrCode && (
              <div>
                <SectionLabel>Mã QR</SectionLabel>
                <div className='rounded-xl border border-gray-100 dark:border-white/8 bg-white dark:bg-white/4 px-4 py-3 flex items-center justify-center'>
                  {order.qrCode.startsWith('data:') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={order.qrCode}
                      alt='QR Code'
                      className='w-36 h-36 rounded-lg'
                    />
                  ) : order.qrCode.length > 100 ? (
                    // Raw base64 without data URI prefix
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`data:image/png;base64,${order.qrCode}`}
                      alt='QR Code'
                      className='w-36 h-36 rounded-lg'
                    />
                  ) : (
                    <div className='flex items-center gap-3'>
                      <QrCode className='w-5 h-5 text-text-sub shrink-0' />
                      <span className='text-xs font-mono text-text-sub break-all'>
                        {order.qrCode}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Contract (API-094) ── */}
            <div>
              <SectionLabel>Hợp đồng thuê</SectionLabel>
              {contractLoading ? (
                <div className='flex items-center gap-2 rounded-xl border border-gray-100 dark:border-white/8 bg-gray-50 dark:bg-white/4 px-4 py-3'>
                  <Loader2 className='w-4 h-4 animate-spin text-text-sub' />
                  <span className='text-xs text-text-sub'>
                    Đang tải hợp đồng…
                  </span>
                </div>
              ) : contract ? (
                <div className='rounded-xl border border-gray-100 dark:border-white/8 bg-gray-50 dark:bg-white/4 px-4 py-3 space-y-0.5'>
                  <InfoRow
                    icon={FileText}
                    label='Số hợp đồng'
                    value={
                      <span className='font-mono font-semibold text-indigo-600 dark:text-indigo-400'>
                        {contract.contractNumber}
                      </span>
                    }
                  />
                  <InfoRow
                    icon={FileText}
                    label='Phiên bản'
                    value={`v${contract.contractVersion}`}
                  />
                  <InfoRow
                    icon={BadgeCheck}
                    label='Phương thức'
                    value={
                      contract.acceptMethod === 'SIGNATURE'
                        ? 'Ký tay'
                        : 'Click đồng ý'
                    }
                  />
                  <InfoRow
                    icon={Calendar}
                    label='Đồng ý lúc'
                    value={formatDateTime(contract.acceptedAt)}
                  />
                  <InfoRow
                    icon={Calendar}
                    label='Tạo lúc'
                    value={formatDateTime(contract.createdAt)}
                  />
                  {contract.contractPdfUrl && (
                    <div className='pt-2'>
                      <a
                        href={contract.contractPdfUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors'
                      >
                        <ExternalLink className='w-3.5 h-3.5' />
                        Xem hợp đồng PDF
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className='flex items-center gap-2 rounded-xl border border-gray-100 dark:border-white/8 bg-gray-50 dark:bg-white/4 px-4 py-3'>
                  <FileText className='w-4 h-4 text-text-sub' />
                  <span className='text-xs text-text-sub italic'>
                    Chưa có hợp đồng cho đơn hàng này.
                  </span>
                </div>
              )}
            </div>

            {/* ── Financials ── */}
            <div>
              <SectionLabel>Tài chính</SectionLabel>
              <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                {(
                  [
                    {
                      label: 'Tiền thuê',
                      value: formatCurrency(order.rentalSubtotalAmount),
                      accent: false,
                    },
                    {
                      label: 'Phí dịch vụ',
                      value: formatCurrency(order.rentalFeeAmount),
                      accent: false,
                    },
                    {
                      label: 'Giảm giá',
                      value: order.voucherDiscountAmount
                        ? `- ${formatCurrency(order.voucherDiscountAmount)}`
                        : '-',
                      accent: false,
                    },
                    {
                      label: 'Tiền đặt cọc',
                      value: formatCurrency(order.depositHoldAmount),
                      accent: false,
                    },
                    {
                      label: 'Đã thanh toán',
                      value: formatCurrency(order.totalPaidAmount),
                      accent: false,
                    },
                    {
                      label: 'Tổng thanh toán',
                      value: formatCurrency(order.totalPayableAmount),
                      accent: true,
                    },
                    // Penalty fields - chỉ hiện khi có giá trị
                    order.damagePenaltyAmount != null && {
                      label: 'Phí hư hại',
                      value: formatCurrency(order.damagePenaltyAmount),
                      accent: false,
                    },
                    order.overduePenaltyAmount != null && {
                      label: 'Phí trễ hạn',
                      value: formatCurrency(order.overduePenaltyAmount),
                      accent: false,
                    },
                    order.provisionalOverduePenaltyAmount != null && {
                      label: 'Phí trễ hạn (tạm)',
                      value: formatCurrency(
                        order.provisionalOverduePenaltyAmount,
                      ),
                      accent: false,
                    },
                    order.penaltyChargeAmount != null && {
                      label: 'Tổng phí phạt',
                      value: formatCurrency(order.penaltyChargeAmount),
                      accent: false,
                    },
                    order.depositRefundAmount != null && {
                      label: 'Hoàn cọc',
                      value: formatCurrency(order.depositRefundAmount),
                      accent: false,
                    },
                  ] as (
                    | { label: string; value: string; accent: boolean }
                    | false
                  )[]
                )
                  .filter(
                    (
                      item,
                    ): item is {
                      label: string;
                      value: string;
                      accent: boolean;
                    } => !!item,
                  )
                  .map(({ label, value, accent }) => (
                    <div
                      key={label}
                      className='rounded-lg border border-gray-100 dark:border-white/8 bg-white dark:bg-white/4 px-3 py-2.5'
                    >
                      <p className='text-[11px] text-text-sub'>{label}</p>
                      <p
                        className={cn(
                          'text-sm font-semibold mt-0.5',
                          accent
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-text-main',
                        )}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            {/* ── Order lines ── */}
            {order.rentalOrderLines.length > 0 && (
              <div>
                <SectionLabel>
                  Sản phẩm thuê ({order.rentalOrderLines.length})
                </SectionLabel>
                <div className='space-y-2'>
                  {order.rentalOrderLines.map((line) => (
                    <div
                      key={line.rentalOrderLineId}
                      className='flex items-center gap-3 rounded-xl border border-gray-100 dark:border-white/8 bg-white dark:bg-white/4 px-4 py-3'
                    >
                      <div className='w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0'>
                        {line.colorCodeSnapshot ? (
                          <div
                            className='w-5 h-5 rounded-full border border-gray-200 dark:border-white/20'
                            style={{ backgroundColor: line.colorCodeSnapshot }}
                            title={line.colorNameSnapshot ?? ''}
                          />
                        ) : (
                          <CircleDot className='w-4 h-4 text-indigo-500' />
                        )}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-text-main truncate'>
                          {line.productNameSnapshot}
                        </p>
                        <div className='flex items-center gap-2 mt-0.5 flex-wrap'>
                          {line.inventorySerialNumber && (
                            <span className='text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-text-sub'>
                              S/N: {line.inventorySerialNumber}
                            </span>
                          )}
                          {line.colorNameSnapshot && (
                            <span className='text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-text-sub flex items-center gap-1'>
                              {line.colorCodeSnapshot && (
                                <span
                                  className='inline-block w-2 h-2 rounded-full'
                                  style={{
                                    backgroundColor: line.colorCodeSnapshot,
                                  }}
                                />
                              )}
                              {line.colorNameSnapshot}
                            </span>
                          )}
                          <span className='text-[10px] text-text-sub'>
                            {line.rentalDurationDays} ngày
                          </span>
                          {line.voucherCodeSnapshot && (
                            <span className='text-[10px] px-1.5 py-0.5 rounded bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'>
                              🎟 {line.voucherCodeSnapshot}{' '}
                              {line.voucherDiscountAmount > 0 &&
                                `(-${formatCurrency(line.voucherDiscountAmount)})`}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className='text-right shrink-0'>
                        <p className='text-xs font-semibold text-text-main'>
                          {formatCurrency(line.dailyPriceSnapshot)}
                          <span className='font-normal text-text-sub'>
                            /ngày
                          </span>
                        </p>
                        <p className='text-[10px] text-text-sub mt-0.5'>
                          Cọc: {formatCurrency(line.depositAmountSnapshot)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Staff assignment ── */}
            <div>
              <SectionLabel>Phân công nhân viên</SectionLabel>

              {!canAssignDelivery && !canAssignPickup ? (
                /* Trạng thái không hỗ trợ gán */
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
                <div className='space-y-2.5'>
                  {/* PAID → hiện cả 2 slot */}
                  {canAssignDelivery && (
                    <>
                      <p className='text-xs text-text-sub'>
                        Đơn đã thanh toán - chọn nhân viên{' '}
                        <span className='font-medium text-indigo-600 dark:text-indigo-400'>
                          giao hàng
                        </span>{' '}
                        {canAssignPickup && (
                          <>
                            và{' '}
                            <span className='font-medium text-emerald-600 dark:text-emerald-400'>
                              thu hồi
                            </span>{' '}
                          </>
                        )}
                        cho đơn này.
                      </p>
                      <StaffSlot
                        role='delivery'
                        staff={deliveryStaff}
                        onClick={() => setPickerOpen('delivery')}
                      />
                    </>
                  )}

                  {/* PAID / PREPARING / DELIVERING / DELIVERED / IN_USE → hiện slot thu hồi */}
                  {canAssignPickup && (
                    <>
                      {!canAssignDelivery && (
                        <p className='text-xs text-text-sub'>
                          Chọn nhân viên{' '}
                          <span className='font-medium text-emerald-600 dark:text-emerald-400'>
                            thu hồi
                          </span>{' '}
                          cho đơn này.
                        </p>
                      )}
                      <StaffSlot
                        role='pickup'
                        staff={pickupStaff}
                        onClick={() => setPickerOpen('pickup')}
                      />
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ── Cancellation request display + Admin support actions ── */}
            {order.status === 'PAID' && (
              <AdminSupportSection order={order} />
            )}
          </div>

          {/* ── Footer ── */}
          <div className='px-6 py-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-3 bg-gray-50 dark:bg-white/4 shrink-0'>
            <div className='flex items-center gap-2 text-xs text-text-sub'>
              {canAssignDelivery && deliveryStaff && (
                <span className='flex items-center gap-1 text-indigo-600 dark:text-indigo-400'>
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
            <div className='flex gap-2 shrink-0'>
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors'
              >
                Hủy
              </button>
              <button
                type='button'
                onClick={handleConfirm}
                disabled={assignMutation.isPending || !canSubmit}
                className='px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2'
              >
                {assignMutation.isPending ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <Banknote className='w-4 h-4' />
                )}
                Xác nhận gán
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Staff picker (nested) ──────────────────────────────────────── */}
      {pickerOpen && (canAssignDelivery || canAssignPickup) && (
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
