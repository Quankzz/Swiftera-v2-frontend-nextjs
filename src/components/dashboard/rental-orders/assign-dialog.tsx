'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Package,
  MapPin,
  User,
  Truck,
  CalendarClock,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { RentalOrder, AssignOrderInput } from '@/types/dashboard';
import { useAssignOrderMutation } from '@/hooks/api/use-rental-orders';
import { useHubsQuery, useHubStaffQuery } from '@/hooks/api/use-hubs';
import { cn } from '@/lib/utils';

interface AssignDialogProps {
  order: RentalOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatCurrency(v: number) {
  return v.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  PENDING: {
    label: 'Chờ xác nhận',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  DELIVERING: {
    label: 'Đang giao hàng',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  ACTIVE: {
    label: 'Đang thuê',
    color: 'text-green-600 bg-green-50 border-green-200',
  },
  RETURNING: {
    label: 'Đang thu hồi',
    color: 'text-orange-600 bg-orange-50 border-orange-200',
  },
  COMPLETED: {
    label: 'Hoàn thành',
    color: 'text-gray-600 bg-gray-50 border-gray-200',
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'text-red-600 bg-red-50 border-red-200',
  },
};

export function AssignDialog({ order, isOpen, onClose }: AssignDialogProps) {
  const [selectedHubId, setSelectedHubId] = useState('');
  const [deliveryStaffId, setDeliveryStaffId] = useState('');
  const [pickupStaffId, setPickupStaffId] = useState('');
  const [plannedDeliveryAt, setPlannedDeliveryAt] = useState('');
  const [plannedPickupAt, setPlannedPickupAt] = useState('');

  const { data: hubsData, isLoading: hubsLoading } = useHubsQuery({
    isActive: true,
  });
  const { data: staffList = [], isLoading: staffLoading } = useHubStaffQuery(
    selectedHubId || undefined,
  );
  const assignMutation = useAssignOrderMutation();

  const hubs = hubsData?.data ?? [];
  const deliveryStaff = staffList.filter(
    (s) => s.role === 'delivery' || s.role === 'both',
  );
  const pickupStaff = staffList.filter(
    (s) => s.role === 'pickup' || s.role === 'both',
  );

  // Reset form when order changes
  const resetToOrder = (o: RentalOrder) => {
    setSelectedHubId(o.hubId ?? '');
    setDeliveryStaffId(o.deliveryStaffId ?? '');
    setPickupStaffId(o.pickupStaffId ?? '');
    setPlannedDeliveryAt(
      o.plannedDeliveryAt ? o.plannedDeliveryAt.slice(0, 16) : '',
    );
    setPlannedPickupAt(o.plannedPickupAt ? o.plannedPickupAt.slice(0, 16) : '');
  };

  useEffect(() => {
    if (order) resetToOrder(order);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.rentalOrderId]);

  // Reset staff selection when hub changes
  const prevHubRef = useState(selectedHubId)[0];
  useEffect(() => {
    if (prevHubRef !== selectedHubId) {
      setDeliveryStaffId('');
      setPickupStaffId('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHubId]);

  if (!isOpen || !order) return null;

  const statusMeta = STATUS_META[order.status] ?? {
    label: order.status,
    color: '',
  };
  const canAssign = order.status === 'PENDING' || order.status === 'CONFIRMED';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedHubId || !deliveryStaffId) return;
    const input: AssignOrderInput = {
      hubId: selectedHubId,
      deliveryStaffId,
      pickupStaffId: pickupStaffId || undefined,
      plannedDeliveryAt: plannedDeliveryAt
        ? new Date(plannedDeliveryAt).toISOString()
        : undefined,
      plannedPickupAt: plannedPickupAt
        ? new Date(plannedPickupAt).toISOString()
        : undefined,
    };
    await assignMutation.mutateAsync({ id: order!.rentalOrderId, input });
    onClose();
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Dialog */}
      <div className='relative z-10 w-full max-w-3xl mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10 bg-linear-to-r from-blue-600 to-indigo-600'>
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center'>
              <Truck className='w-5 h-5 text-white' />
            </div>
            <div>
              <h2 className='text-base font-semibold text-white'>
                Gán đơn hàng
              </h2>
              <p className='text-xs text-blue-100'>{order.rentalOrderId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors'
          >
            <X className='w-4 h-4 text-white' />
          </button>
        </div>

        {/* Order Summary */}
        <div className='px-6 py-4 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10'>
          <div className='grid grid-cols-3 gap-3 text-sm'>
            <div>
              <p className='text-xs text-gray-500 dark:text-gray-400 mb-0.5'>
                Khách hàng
              </p>
              <p className='font-medium text-gray-800 dark:text-gray-200'>
                {order.deliveryRecipientName}
              </p>
              <p className='text-gray-500 dark:text-gray-400 text-xs'>
                {order.deliveryPhone}
              </p>
            </div>
            <div>
              <p className='text-xs text-gray-500 dark:text-gray-400 mb-0.5'>
                Địa chỉ giao
              </p>
              <p className='font-medium text-gray-800 dark:text-gray-200 text-xs leading-relaxed'>
                {order.deliveryAddressLine}, {order.deliveryWard},{' '}
                {order.deliveryDistrict}, {order.deliveryCity}
              </p>
            </div>
            <div>
              <p className='text-xs text-gray-500 dark:text-gray-400 mb-0.5'>
                Thời gian thuê
              </p>
              <p className='font-medium text-gray-800 dark:text-gray-200'>
                {formatDate(order.startDate)} → {formatDate(order.endDate)}
              </p>
            </div>
            <div>
              <p className='text-xs text-gray-500 dark:text-gray-400 mb-0.5'>
                Trạng thái
              </p>
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium',
                  statusMeta.color,
                )}
              >
                {statusMeta.label}
              </span>
            </div>
            <div className='col-span-3'>
              <p className='text-xs text-gray-500 dark:text-gray-400 mb-1'>
                Sản phẩm
              </p>
              <div className='flex flex-wrap gap-2'>
                {order.items?.map((item) => (
                  <span
                    key={item.rentalOrderItemId}
                    className='inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-xs text-gray-700 dark:text-gray-300'
                  >
                    <Package className='w-3 h-3 text-blue-500' />
                    {item.productName}
                    <span className='text-gray-400 font-mono ml-1'>
                      {item.serialNumber}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className='flex flex-col flex-1 overflow-hidden'
        >
          <div className='flex-1 overflow-y-auto px-6 py-5 space-y-5'>
            {!canAssign && (
              <div className='rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/30 p-3 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400'>
                <CheckCircle2 className='w-4 h-4 shrink-0' />
                Đơn hàng này đang ở trạng thái{' '}
                <strong>{statusMeta.label}</strong> - chỉ có thể xem, không thể
                chỉnh sửa gán đơn.
              </div>
            )}

            {/* Hub full-width */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>
                <MapPin className='w-3.5 h-3.5 inline mr-1' />
                Hub xử lý <span className='text-red-500'>*</span>
              </label>
              <select
                value={selectedHubId}
                onChange={(e) => setSelectedHubId(e.target.value)}
                disabled={!canAssign || hubsLoading}
                required
                className='w-full rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50'
              >
                <option value=''>- Chọn hub -</option>
                {hubs.map((hub) => (
                  <option key={hub.hubId} value={hub.hubId}>
                    {hub.name} ({hub.district}, {hub.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Delivery + Pickup staff side by side */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>
                  <Truck className='w-3.5 h-3.5 inline mr-1' />
                  Nhân viên giao hàng <span className='text-red-500'>*</span>
                </label>
                <select
                  value={deliveryStaffId}
                  onChange={(e) => setDeliveryStaffId(e.target.value)}
                  disabled={!canAssign || !selectedHubId || staffLoading}
                  required
                  className='w-full rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50'
                >
                  <option value=''>
                    {!selectedHubId
                      ? '- Chọn hub trước -'
                      : staffLoading
                        ? 'Đang tải...'
                        : deliveryStaff.length === 0
                          ? 'Không có nhân viên'
                          : '- Chọn nhân viên giao -'}
                  </option>
                  {deliveryStaff.map((s) => (
                    <option key={s.userId} value={s.userId}>
                      {s.firstName} {s.lastName} - {s.phoneNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>
                  <User className='w-3.5 h-3.5 inline mr-1' />
                  Nhân viên thu hồi{' '}
                  <span className='text-gray-400 dark:text-gray-500 font-normal'>
                    (tùy chọn)
                  </span>
                </label>
                <select
                  value={pickupStaffId}
                  onChange={(e) => setPickupStaffId(e.target.value)}
                  disabled={!canAssign || !selectedHubId || staffLoading}
                  className='w-full rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50'
                >
                  <option value=''>- Chưa phân công -</option>
                  {pickupStaff.map((s) => (
                    <option key={s.userId} value={s.userId}>
                      {s.firstName} {s.lastName} - {s.phoneNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dates */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>
                  <CalendarClock className='w-3.5 h-3.5 inline mr-1' />
                  Dự kiến giao
                </label>
                <input
                  type='datetime-local'
                  value={plannedDeliveryAt}
                  onChange={(e) => setPlannedDeliveryAt(e.target.value)}
                  disabled={!canAssign}
                  className='w-full rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>
                  <CalendarClock className='w-3.5 h-3.5 inline mr-1' />
                  Dự kiến thu hồi
                </label>
                <input
                  type='datetime-local'
                  value={plannedPickupAt}
                  onChange={(e) => setPlannedPickupAt(e.target.value)}
                  disabled={!canAssign}
                  className='w-full rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50'
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='px-6 py-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-3 bg-gray-50 dark:bg-white/5'>
            <div className='text-sm text-gray-500 dark:text-gray-400'>
              Tổng:{' '}
              <strong className='text-gray-800 dark:text-gray-200'>
                {formatCurrency(order.grandTotalPaid)}
              </strong>
            </div>
            <div className='flex gap-2'>
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors'
              >
                Đóng
              </button>
              {canAssign && (
                <button
                  type='submit'
                  disabled={
                    !selectedHubId ||
                    !deliveryStaffId ||
                    assignMutation.isPending
                  }
                  className='px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 flex items-center gap-2'
                >
                  {assignMutation.isPending ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : (
                    <CheckCircle2 className='w-4 h-4' />
                  )}
                  Xác nhận gán đơn
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
