'use client';

import { useState, useMemo } from 'react';
import {
  X,
  Search,
  Users,
  Loader2,
  CheckCircle2,
  UserCheck,
  Package,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  useHubStaffForAssignQuery,
  useAssignStaffMutation,
} from '@/features/rental-orders/hooks/use-rental-order-assignment';
import type {
  RentalOrderResponse,
  HubOption,
} from '@/features/rental-orders/types';
import type { HubStaffResponse } from '@/features/hubs/types';

// ─────────────────────────────────────────────────────────────────────────────

interface AssignStaffDialogProps {
  order: RentalOrderResponse;
  hub: HubOption;
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onAssigned: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────

function getInitials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function StaffCard({
  staff,
  selectedLabel,
  onSelectDelivery,
  onSelectPickup,
}: {
  staff: HubStaffResponse;
  selectedLabel: 'delivery' | 'pickup' | 'both' | null;
  onSelectDelivery: () => void;
  onSelectPickup: () => void;
}) {
  const fullName = `${staff.firstName} ${staff.lastName}`;

  const isDelivery = selectedLabel === 'delivery' || selectedLabel === 'both';
  const isPickup = selectedLabel === 'pickup' || selectedLabel === 'both';

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-all',
        selectedLabel
          ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-900/10'
          : 'border-gray-200 dark:border-white/8 bg-white dark:bg-white/4',
      )}
    >
      <div className='flex items-start gap-3'>
        {/* Avatar */}
        {staff.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={staff.avatarUrl}
            alt={fullName}
            className='w-10 h-10 rounded-full object-cover shrink-0'
          />
        ) : (
          <div className='w-10 h-10 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center shrink-0'>
            <span className='text-white text-xs font-bold'>
              {getInitials(staff.firstName, staff.lastName)}
            </span>
          </div>
        )}

        {/* Info */}
        <div className='flex-1 min-w-0'>
          <p className='font-semibold text-sm text-text-main'>{fullName}</p>
          {staff.nickname && (
            <p className='text-xs text-text-sub'>
              &ldquo;{staff.nickname}&rdquo;
            </p>
          )}
          <p className='text-xs text-text-sub truncate'>{staff.email}</p>
          <div className='flex items-center gap-2 mt-1'>
            <span className='text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-text-sub font-medium'>
              Nhân viên
            </span>
            {staff.isVerified && (
              <span className='text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium'>
                Đã xác thực
              </span>
            )}
            {staff.phoneNumber && (
              <span className='text-[10px] text-text-sub'>
                {staff.phoneNumber}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Role buttons */}
      <div className='flex gap-2 mt-3'>
        {/* Giao hàng */}
        <button
          type='button'
          onClick={onSelectDelivery}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border transition-all',
            isDelivery
              ? 'border-indigo-400 bg-indigo-500 text-white'
              : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-text-sub hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
          )}
        >
          {isDelivery ? (
            <CheckCircle2 className='w-3.5 h-3.5' />
          ) : (
            <Package className='w-3.5 h-3.5' />
          )}
          Giao hàng
        </button>

        {/* Thu hồi */}
        <button
          type='button'
          onClick={onSelectPickup}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border transition-all',
            isPickup
              ? 'border-emerald-400 bg-emerald-500 text-white'
              : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-text-sub hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
          )}
        >
          {isPickup ? (
            <CheckCircle2 className='w-3.5 h-3.5' />
          ) : (
            <UserCheck className='w-3.5 h-3.5' />
          )}
          Thu hồi
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function AssignStaffDialog({
  order,
  hub,
  isOpen,
  onClose,
  onBack,
  onAssigned,
}: AssignStaffDialogProps) {
  const [search, setSearch] = useState('');
  const [deliveryStaffId, setDeliveryStaffId] = useState<string | null>(
    order.deliveryStaffId ?? null,
  );
  const [pickupStaffId, setPickupStaffId] = useState<string | null>(
    order.pickupStaffId ?? null,
  );

  const { data: staffData, isLoading } = useHubStaffForAssignQuery(hub.hubId);

  const assignMutation = useAssignStaffMutation();

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

  const getStaffLabel = (
    staffId: string,
  ): 'delivery' | 'pickup' | 'both' | null => {
    const isD = deliveryStaffId === staffId;
    const isP = pickupStaffId === staffId;
    if (isD && isP) return 'both';
    if (isD) return 'delivery';
    if (isP) return 'pickup';
    return null;
  };

  const handleSelectDelivery = (staffId: string) => {
    setDeliveryStaffId((prev) => (prev === staffId ? null : staffId));
  };

  const handleSelectPickup = (staffId: string) => {
    setPickupStaffId((prev) => (prev === staffId ? null : staffId));
  };

  const handleConfirm = async () => {
    if (!deliveryStaffId && !pickupStaffId) {
      toast.warning('Vui lòng chọn ít nhất một nhân viên giao hoặc thu hồi.');
      return;
    }
    try {
      await assignMutation.mutateAsync({
        rentalOrderId: order.rentalOrderId,
        payload: {
          deliveryStaffId: deliveryStaffId ?? undefined,
          pickupStaffId: pickupStaffId ?? undefined,
        },
      });
      toast.success('Đã gán nhân viên thành công!');
      onAssigned();
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Gán nhân viên thất bại.';
      toast.error(msg);
    }
  };

  if (!isOpen) return null;

  const deliveryStaffName = allStaff.find((s) => s.userId === deliveryStaffId);
  const pickupStaffName = allStaff.find((s) => s.userId === pickupStaffId);

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Dialog */}
      <div className='relative z-10 w-full max-w-2xl mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10 bg-linear-to-r from-emerald-600 to-teal-600 shrink-0'>
          <div className='flex items-center gap-3'>
            <button
              type='button'
              onClick={onBack}
              className='w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors'
            >
              <ArrowLeft className='w-4 h-4 text-white' />
            </button>
            <div className='w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center'>
              <Users className='w-5 h-5 text-white' />
            </div>
            <div>
              <h2 className='text-base font-semibold text-white'>
                Chọn nhân viên
              </h2>
              <p className='text-xs text-emerald-100'>
                Hub: {hub.name} — Đơn:{' '}
                {order.rentalOrderId.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors'
          >
            <X className='w-4 h-4 text-white' />
          </button>
        </div>

        {/* Search */}
        <div className='px-5 py-3 border-b border-gray-100 dark:border-white/10 shrink-0'>
          <div className='relative'>
            <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400' />
            <input
              type='text'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Tìm nhân viên theo tên, email, số điện thoại...'
              className='h-9 w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 pl-8 pr-3 text-sm text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition'
            />
          </div>
        </div>

        {/* Staff grid */}
        <div className='flex-1 overflow-y-auto px-5 py-3'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center py-12 gap-2'>
              <Loader2 className='w-6 h-6 text-emerald-500 animate-spin' />
              <p className='text-sm text-text-sub'>
                Đang tải danh sách nhân viên...
              </p>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 gap-2'>
              <Users className='w-8 h-8 text-gray-300 dark:text-gray-600' />
              <p className='text-sm text-text-sub'>Không tìm thấy nhân viên</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
              {filteredStaff.map((staff) => (
                <StaffCard
                  key={staff.userId}
                  staff={staff}
                  selectedLabel={getStaffLabel(staff.userId)}
                  onSelectDelivery={() => handleSelectDelivery(staff.userId)}
                  onSelectPickup={() => handleSelectPickup(staff.userId)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Selection summary */}
        {(deliveryStaffId || pickupStaffId) && (
          <div className='px-5 py-2.5 border-t border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/60 dark:bg-emerald-900/10 flex flex-wrap gap-x-4 gap-y-1 shrink-0'>
            {deliveryStaffId && deliveryStaffName && (
              <div className='flex items-center gap-1.5 text-xs'>
                <Package className='w-3.5 h-3.5 text-indigo-500' />
                <span className='text-text-sub'>Giao hàng:</span>
                <span className='font-medium text-text-main'>
                  {deliveryStaffName.firstName} {deliveryStaffName.lastName}
                </span>
              </div>
            )}
            {pickupStaffId && pickupStaffName && (
              <div className='flex items-center gap-1.5 text-xs'>
                <UserCheck className='w-3.5 h-3.5 text-emerald-500' />
                <span className='text-text-sub'>Thu hồi:</span>
                <span className='font-medium text-text-main'>
                  {pickupStaffName.firstName} {pickupStaffName.lastName}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className='px-5 py-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-3 bg-gray-50 dark:bg-white/5 shrink-0'>
          <p className='text-sm text-text-sub'>
            {filteredStaff.length} nhân viên
          </p>
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={onBack}
              className='flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors'
            >
              <ArrowLeft className='w-4 h-4' />
              Quay lại
            </button>
            <button
              type='button'
              onClick={handleConfirm}
              disabled={
                assignMutation.isPending || (!deliveryStaffId && !pickupStaffId)
              }
              className='px-5 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2'
            >
              {assignMutation.isPending ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <ChevronRight className='w-4 h-4' />
              )}
              Xác nhận gán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
