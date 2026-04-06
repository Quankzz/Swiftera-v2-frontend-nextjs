'use client';

/**
 * RentalOrderAssignDialog
 * ─────────────────────────────────────────────────────────────────────────────
 * Dialog hiển thị chi tiết đơn thuê + chọn nhân viên giao / thu hồi.
 *
 * Flow:
 *  1. Mở dialog này khi bấm "Gán đơn" ở bảng.
 *  2. Hiển thị thông tin đơn hàng (hub, địa chỉ, ngày, tài chính, sản phẩm).
 *  3. Hai ô "Nhân viên giao hàng" và "Nhân viên thu hồi" — bấm vào mỗi ô
 *     sẽ mở StaffPickerDialog để chọn nhân viên.
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
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAssignStaffMutation } from '@/features/rental-orders/hooks/use-rental-order-assignment';
import { StaffPickerDialog } from '@/features/rental-orders/components/staff-picker-dialog';
import {
  STATUS_LABELS,
  STATUS_STYLES,
  type RentalOrderResponse,
} from '@/features/rental-orders/types';
import type { HubStaffResponse } from '@/features/hubs/types';

// ─────────────────────────────────────────────────────────────────────────────

interface RentalOrderAssignDialogProps {
  order: RentalOrderResponse;
  isOpen: boolean;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────

function formatCurrency(v: number | null | undefined) {
  if (v == null) return '—';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(v);
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
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
        {value || '—'}
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
              Chưa chọn — bấm để chọn
            </p>
          )}
        </div>
      </div>
      <ChevronRight className='w-4 h-4 text-text-sub shrink-0' />
    </button>
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

  const statusStyle = STATUS_STYLES[order.status] ?? {
    dot: 'bg-gray-400',
    cls: 'text-gray-600 bg-gray-100 border-gray-200',
  };

  const handleConfirm = async () => {
    if (!deliveryStaff && !pickupStaff) {
      toast.warning('Vui lòng chọn ít nhất một nhân viên trước khi xác nhận.');
      return;
    }
    try {
      await assignMutation.mutateAsync({
        rentalOrderId: order.rentalOrderId,
        payload: {
          deliveryStaffId: deliveryStaff?.userId ?? undefined,
          pickupStaffId: pickupStaff?.userId ?? undefined,
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

  const address = [
    order.deliveryAddressLine,
    order.deliveryWard,
    order.deliveryDistrict,
    order.deliveryCity,
  ]
    .filter(Boolean)
    .join(', ');

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
                  #{order.rentalOrderId.slice(0, 8).toUpperCase()} —{' '}
                  {order.deliveryRecipientName}
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
                        {order.hubName}
                      </span>
                    ) : (
                      <span className='text-red-500 italic'>Chưa có hub</span>
                    )
                  }
                />
                <InfoRow
                  icon={Phone}
                  label='Người nhận'
                  value={`${order.deliveryRecipientName} · ${order.deliveryPhone}`}
                />
                <InfoRow
                  icon={MapPin}
                  label='Địa chỉ giao'
                  value={address || '—'}
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
              </div>
            </div>

            {/* ── Financials ── */}
            <div>
              <SectionLabel>Tài chính</SectionLabel>
              <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                {[
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
                      : '—',
                    accent: false,
                  },
                  {
                    label: 'Tiền đặt cọc',
                    value: formatCurrency(order.depositHoldAmount),
                    accent: false,
                  },
                  {
                    label: 'Tổng thanh toán',
                    value: formatCurrency(order.totalPayableAmount),
                    accent: true,
                  },
                ].map(({ label, value, accent }) => (
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
                        <CircleDot className='w-4 h-4 text-indigo-500' />
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
                          <span className='text-[10px] text-text-sub'>
                            {line.rentalDurationDays} ngày
                          </span>
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
              <div className='space-y-2.5'>
                <StaffSlot
                  role='delivery'
                  staff={deliveryStaff}
                  onClick={() => setPickerOpen('delivery')}
                />
                <StaffSlot
                  role='pickup'
                  staff={pickupStaff}
                  onClick={() => setPickerOpen('pickup')}
                />
              </div>
              {!deliveryStaff && !pickupStaff && (
                <p className='mt-2 text-xs text-text-sub text-center'>
                  Bấm vào ô trên để chọn nhân viên phụ trách
                </p>
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className='px-6 py-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-3 bg-gray-50 dark:bg-white/4 shrink-0'>
            <div className='flex items-center gap-2 text-xs text-text-sub'>
              {deliveryStaff && (
                <span className='flex items-center gap-1 text-indigo-600 dark:text-indigo-400'>
                  <BadgeCheck className='w-3.5 h-3.5' />
                  Giao: {deliveryStaff.firstName} {deliveryStaff.lastName}
                </span>
              )}
              {pickupStaff && (
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
                disabled={
                  assignMutation.isPending || (!deliveryStaff && !pickupStaff)
                }
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
      {pickerOpen && (
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
