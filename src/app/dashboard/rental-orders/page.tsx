'use client';

import { useState } from 'react';
import {
  ClipboardList,
  Clock,
  Truck,
  PackageCheck,
  CheckCircle2,
} from 'lucide-react';
import { RentalOrder } from '@/types/dashboard';
import { useRentalOrdersQuery } from '@/hooks/api/use-rental-orders';
import { RentalOrdersTable } from '@/components/dashboard/rental-orders/orders-table';
import { AssignDialog } from '@/components/dashboard/rental-orders/assign-dialog';
import { cn } from '@/lib/utils';

function StatCard({
  label,
  value,
  icon: Icon,
  colorCls,
  isLoading,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  colorCls: string;
  isLoading?: boolean;
}) {
  return (
    <div className='flex items-center gap-3 rounded-xl border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-5 py-4 shadow-sm'>
      <span
        className={cn(
          'flex size-10 items-center justify-center rounded-xl',
          colorCls,
        )}
      >
        <Icon size={18} />
      </span>
      <div>
        {isLoading ? (
          <div className='h-7 w-10 bg-gray-200 dark:bg-white/10 rounded animate-pulse' />
        ) : (
          <p className='text-2xl font-bold text-text-main'>{value}</p>
        )}
        <p className='text-xs text-text-sub'>{label}</p>
      </div>
    </div>
  );
}

export default function RentalOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<RentalOrder | null>(null);

  // Load all orders for stats (no status filter, high limit)
  const { data: allData, isLoading: statsLoading } = useRentalOrdersQuery({
    limit: 100,
  });
  const allOrders = allData?.data ?? [];

  const stats = {
    total: allData?.total ?? 0,
    pending: allOrders.filter((o) => o.status === 'PENDING').length,
    delivering: allOrders.filter((o) => o.status === 'DELIVERING').length,
    active: allOrders.filter((o) => o.status === 'ACTIVE').length,
    completed: allOrders.filter((o) => o.status === 'COMPLETED').length,
  };

  return (
    <div className='flex flex-col gap-6 w-full p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-start gap-4'>
          <div className='p-2.5 rounded-xl bg-blue-500/10 mt-0.5'>
            <ClipboardList size={20} className='text-blue-500' />
          </div>
          <div>
            <h2 className='text-2xl font-bold tracking-tight text-text-main'>
              Đơn thuê
            </h2>
            <p className='text-text-sub mt-1 text-sm'>
              Quản lý đơn thuê thiết bị và phân công nhân viên giao hàng theo
              hub.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
        <StatCard
          label='Tổng đơn'
          value={stats.total}
          icon={ClipboardList}
          colorCls='bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
          isLoading={statsLoading}
        />
        <StatCard
          label='Chờ xác nhận'
          value={stats.pending}
          icon={Clock}
          colorCls='bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
          isLoading={statsLoading}
        />
        <StatCard
          label='Đang giao'
          value={stats.delivering}
          icon={Truck}
          colorCls='bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
          isLoading={statsLoading}
        />
        <StatCard
          label='Đang thuê'
          value={stats.active}
          icon={PackageCheck}
          colorCls='bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
          isLoading={statsLoading}
        />
        <StatCard
          label='Hoàn thành'
          value={stats.completed}
          icon={CheckCircle2}
          colorCls='bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'
          isLoading={statsLoading}
        />
      </div>

      {/* Table */}
      <div className='w-full'>
        <RentalOrdersTable onAssign={setSelectedOrder} />
      </div>

      {/* Assign Dialog */}
      <AssignDialog
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
