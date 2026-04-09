'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { useAdminDashboard } from '@/features/dashboards/hooks/useAdminDashboard';
import { KpiCards } from '@/features/dashboards/components/KpiCards';
import { TrendAreaChart, StatusBarChart } from '@/features/dashboards/components/OrderChart';
import { InventoryStatus } from '@/features/dashboards/components/InventoryStatus';
import { OverdueTable } from '@/features/dashboards/components/OverdueTable';

// ─── Empty-state placeholders ─────────────────────────────────────────────────

const EMPTY_INVENTORY = {
  totalItems: 0, available: 0, rented: 0, reserved: 0,
  maintenance: 0, damaged: 0, retired: 0,
};
const EMPTY_OVERDUE = { count: 0, topItems: [] };
const EMPTY_ORDER_KPI = {
  completedToday: 0, completedYesterday: 0,
  completedThisWeek: 0, completedThisMonth: 0,
  dailyCompletedLast7Days: [],
};
const EMPTY_REVENUE = {
  rentalFeeToday: 0, rentalFeeThisMonth: 0,
  depositHeldActive: 0, penaltyThisMonth: 0,
};
const EMPTY_STATUS_COUNTS = {
  pendingPayment: 0, paid: 0, preparing: 0, delivering: 0, delivered: 0,
  inUse: 0, pendingPickup: 0, pickingUp: 0, pickedUp: 0, completed: 0,
  cancelled: 0, urgentTotal: 0,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useAdminDashboard();

  return (
    <div className='space-y-5 p-4 sm:p-6'>
      {/* Title */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-bold text-text-main'>Tổng quan</h1>
          <p className='text-sm text-text-sub'>Hệ thống cho thuê thiết bị</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className='flex items-center gap-1.5 text-xs text-text-sub hover:text-text-main transition-colors disabled:opacity-50'
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      {/* Error banner */}
      {isError && (
        <div className='flex items-center gap-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-400'>
          <AlertCircle size={16} className='shrink-0' />
          <span>
            Không thể tải dữ liệu:{' '}
            {error instanceof Error ? error.message : 'Lỗi không xác định'}
          </span>
          <button
            onClick={() => refetch()}
            className='ml-auto shrink-0 underline underline-offset-2 hover:opacity-70'
          >
            Thử lại
          </button>
        </div>
      )}

      {/* ── Row 1: KPI cards ── */}
      <KpiCards
        orderKpi={data?.orderKpi ?? EMPTY_ORDER_KPI}
        revenueStats={data?.revenueStats ?? EMPTY_REVENUE}
        isLoading={isLoading}
      />

      {/* ── Row 2: Area chart (2/3) + Donut (1/3) ── */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-5'>
        <div className='lg:col-span-2'>
          <TrendAreaChart
            data={data?.orderKpi.dailyCompletedLast7Days ?? []}
            isLoading={isLoading}
          />
        </div>
        <div className='lg:col-span-1'>
          <InventoryStatus
            stats={data?.inventoryStats ?? EMPTY_INVENTORY}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* ── Row 3: Bar chart (1/2) + Overdue table (1/2) ── */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
        <StatusBarChart
          counts={data?.orderStatusCounts ?? EMPTY_STATUS_COUNTS}
          isLoading={isLoading}
        />
        <OverdueTable
          overdueOrders={data?.overdueOrders ?? EMPTY_OVERDUE}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
