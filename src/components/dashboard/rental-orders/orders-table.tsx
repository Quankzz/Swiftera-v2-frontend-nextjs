'use client';

import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/dashboard/ui/data-table';
import { RentalOrder, RentalOrderStatus } from '@/types/dashboard';
import { useRentalOrdersQuery } from '@/hooks/api/use-rental-orders';
import { RENTAL_ORDER_STATUSES } from '@/api/rental-orders';
import { Truck, MapPin, User2, ClipboardList, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OrdersTableProps {
  onAssign: (order: RentalOrder) => void;
}

const STATUS_STYLES: Record<
  RentalOrderStatus,
  { label: string; dot: string; cls: string }
> = {
  PENDING: {
    label: 'Chờ xác nhận',
    dot: 'bg-amber-400',
    cls: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-500/30',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    dot: 'bg-blue-400',
    cls: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-500/30',
  },
  DELIVERING: {
    label: 'Đang giao',
    dot: 'bg-indigo-400',
    cls: 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-900/20 dark:border-indigo-500/30',
  },
  ACTIVE: {
    label: 'Đang thuê',
    dot: 'bg-green-400',
    cls: 'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-500/30',
  },
  RETURNING: {
    label: 'Đang thu hồi',
    dot: 'bg-orange-400',
    cls: 'text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-500/30',
  },
  COMPLETED: {
    label: 'Hoàn thành',
    dot: 'bg-gray-400',
    cls: 'text-gray-600 bg-gray-100 border-gray-200 dark:text-gray-400 dark:bg-white/5 dark:border-white/10',
  },
  CANCELLED: {
    label: 'Đã hủy',
    dot: 'bg-red-400',
    cls: 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-500/30',
  },
};

function StatusBadge({ status }: { status: RentalOrderStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium whitespace-nowrap',
        s.cls,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', s.dot)} />
      {s.label}
    </span>
  );
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
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

function StatusFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: RentalOrderStatus | '') => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as RentalOrderStatus | '')}
      className='h-9 rounded-lg border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-3 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20 focus:border-theme-primary-start transition'
    >
      <option value=''>Tất cả trạng thái</option>
      {RENTAL_ORDER_STATUSES.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}

export function RentalOrdersTable({ onAssign }: OrdersTableProps) {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<RentalOrderStatus | ''>('');
  const [search] = useState('');

  const { data, isLoading, isError } = useRentalOrdersQuery({
    page,
    limit,
    status: statusFilter || undefined,
    search: search || undefined,
  });

  const columns = useMemo<ColumnDef<RentalOrder>[]>(
    () => [
      // Col 1: Mã đơn + ngày đặt
      {
        accessorKey: 'rentalOrderId',
        header: 'Đơn hàng',
        cell: ({ row }) => (
          <div className='min-w-27.5'>
            <div className='flex items-center gap-1.5 mb-1'>
              <ClipboardList className='w-3.5 h-3.5 text-blue-500 shrink-0' />
              <span className='font-mono text-xs font-semibold text-gray-800 dark:text-gray-200 tracking-tight'>
                {row.original.rentalOrderId}
              </span>
            </div>
            <p className='text-xs text-gray-400 dark:text-gray-500'>
              {formatDate(row.original.placedAt)}
            </p>
          </div>
        ),
      },
      // Col 2: Khách hàng
      {
        accessorKey: 'deliveryRecipientName',
        header: 'Khách hàng',
        cell: ({ row }) => {
          const { deliveryRecipientName, deliveryPhone } = row.original;
          return (
            <div className='flex items-center gap-2.5 min-w-40'>
              <div className='w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0'>
                {deliveryRecipientName.charAt(0).toUpperCase()}
              </div>
              <div className='min-w-0'>
                <p className='font-medium text-sm text-gray-800 dark:text-gray-200 truncate'>
                  {deliveryRecipientName}
                </p>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  {deliveryPhone}
                </p>
              </div>
            </div>
          );
        },
      },
      // Col 3: Địa chỉ giao
      {
        accessorKey: 'deliveryCity',
        header: 'Địa chỉ giao',
        cell: ({ row }) => {
          const { deliveryAddressLine, deliveryDistrict, deliveryCity } =
            row.original;
          return (
            <div className='flex items-start gap-1.5 min-w-35 max-w-50'>
              <MapPin className='w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0' />
              <div className='min-w-0'>
                <p className='text-xs text-gray-700 dark:text-gray-300 line-clamp-1'>
                  {deliveryAddressLine}
                </p>
                <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>
                  {deliveryDistrict}, {deliveryCity}
                </p>
              </div>
            </div>
          );
        },
      },
      // Col 4: Thời gian thuê
      {
        accessorKey: 'startDate',
        header: 'Thời gian thuê',
        cell: ({ row }) => (
          <div className='min-w-27.5'>
            <div className='flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300 font-medium'>
              <Calendar className='w-3 h-3 text-gray-400' />
              {formatDate(row.original.startDate)}
            </div>
            <p className='text-xs text-gray-400 mt-0.5 pl-4'>
              → {formatDate(row.original.endDate)}
            </p>
          </div>
        ),
      },
      // Col 5: Tổng tiền
      {
        accessorKey: 'grandTotalPaid',
        header: 'Thanh toán',
        cell: ({ row }) => (
          <div className='min-w-30'>
            <p className='font-semibold text-sm text-gray-800 dark:text-gray-100'>
              {formatCurrency(row.original.grandTotalPaid)}
            </p>
            <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>
              Cọc: {formatCurrency(row.original.totalDeposit)}
            </p>
          </div>
        ),
      },
      // Col 6: Hub + nhân viên
      {
        id: 'hub',
        header: 'Hub / Nhân viên',
        cell: ({ row }) => {
          const { hubName, deliveryStaffName } = row.original;
          if (!hubName) {
            return (
              <span className='inline-flex items-center gap-1 text-xs text-gray-400 italic'>
                <span className='w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600' />
                Chưa gán
              </span>
            );
          }
          return (
            <div className='min-w-35'>
              <div className='flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400'>
                <MapPin className='w-3 h-3 shrink-0' />
                <span className='line-clamp-1'>{hubName}</span>
              </div>
              {deliveryStaffName && (
                <div className='flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                  <User2 className='w-3 h-3 shrink-0' />
                  {deliveryStaffName}
                </div>
              )}
            </div>
          );
        },
      },
      // Col 7: Trạng thái
      {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      // Col 8: Action
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const canAssign =
            row.original.status === 'PENDING' ||
            row.original.status === 'CONFIRMED';
          return (
            <Button
              size='sm'
              variant={canAssign ? 'default' : 'ghost'}
              onClick={() => onAssign(row.original)}
              className={cn(
                'flex items-center gap-1.5 text-xs h-8 px-3 whitespace-nowrap',
                !canAssign &&
                  'text-text-sub border border-gray-200 dark:border-white/8',
              )}
            >
              <Truck className='w-3.5 h-3.5' />
              {canAssign ? 'Gán đơn' : 'Xem'}
            </Button>
          );
        },
      },
    ],
    [onAssign],
  );

  const handleStatusChange = (v: RentalOrderStatus | '') => {
    setStatusFilter(v);
    setPage(1);
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <DataTable
      columns={columns}
      data={data?.data ?? []}
      isLoading={isLoading}
      isError={isError}
      errorMessage='Không thể tải danh sách đơn thuê. Vui lòng thử lại.'
      emptyMessage='Chưa có đơn thuê nào.'
      searchPlaceholder='Tìm mã đơn, khách hàng...'
      searchColumn='rentalOrderId'
      totalLabel='đơn thuê'
      manualPagination
      pageIndex={page}
      pageCount={totalPages}
      onPageChange={(p) => setPage(p + 1)}
      pageSize={limit}
      totalRows={data?.total}
      toolbarRight={
        <StatusFilter value={statusFilter} onChange={handleStatusChange} />
      }
    />
  );
}
