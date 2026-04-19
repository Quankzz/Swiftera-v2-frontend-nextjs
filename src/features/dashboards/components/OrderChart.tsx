'use client';

/**
 * OrderChart - Hàng thứ hai (trái 66%):
 *   - Area Chart: xu hướng 7 ngày (dailyCompletedLast7Days)
 *
 * Hàng thứ ba (trái 50%):
 *   - Bar Chart: đếm theo trạng thái (orderStatusCounts)
 */

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';
import type {
  DailyCompletedPoint,
  OrderStatusCounts,
} from '@/features/dashboards/types';

// ─── Skeleton ────────────────────────────────────────────────────────────────

function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div
      className='w-full rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse'
      style={{ height }}
    />
  );
}

// ─── Area Chart: 7 ngày ──────────────────────────────────────────────────────

const AREA_COLOR = '#6366f1';

interface TrendChartProps {
  data: DailyCompletedPoint[];
  isLoading: boolean;
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export function TrendAreaChart({ data, isLoading }: TrendChartProps) {
  const chartData = data.map((p) => ({
    label: formatShortDate(p.date),
    count: p.count,
  }));

  return (
    <div className='rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card p-5 flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <div className='w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center'>
          <TrendingUp size={15} className='text-indigo-500' />
        </div>
        <div>
          <p className='text-sm font-semibold text-text-main'>
            Xu hướng hoàn thành
          </p>
          <p className='text-xs text-text-sub'>7 ngày gần nhất</p>
        </div>
      </div>

      {isLoading ? (
        <ChartSkeleton height={220} />
      ) : (
        <ResponsiveContainer width='100%' height={220}>
          <AreaChart
            data={chartData}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id='areaGrad' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor={AREA_COLOR} stopOpacity={0.25} />
                <stop offset='95%' stopColor={AREA_COLOR} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray='3 3'
              stroke='currentColor'
              strokeOpacity={0.06}
            />
            <XAxis
              dataKey='label'
              tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.5 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.5 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface-card, #fff)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                fontSize: 12,
              }}
              formatter={(val) => [val ?? 0, 'Đơn hoàn thành']}
            />
            <Area
              type='monotone'
              dataKey='count'
              stroke={AREA_COLOR}
              strokeWidth={2.5}
              fill='url(#areaGrad)'
              dot={{ r: 3, fill: AREA_COLOR, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: AREA_COLOR }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ─── Bar Chart: status counts ─────────────────────────────────────────────────

const STATUS_CONFIG: {
  key: keyof Omit<OrderStatusCounts, 'urgentTotal'>;
  label: string;
  color: string;
}[] = [
  { key: 'pendingPayment', label: 'Chờ TT', color: '#f59e0b' },
  { key: 'paid', label: 'Đã TT', color: '#06b6d4' },
  { key: 'preparing', label: 'Chuẩn bị', color: '#8b5cf6' },
  { key: 'delivering', label: 'Đang giao', color: '#6366f1' },
  { key: 'delivered', label: 'Đã giao', color: '#3b82f6' },
  { key: 'inUse', label: 'Đang thuê', color: '#10b981' },
  { key: 'pendingPickup', label: 'Chờ thu', color: '#f97316' },
  { key: 'pickingUp', label: 'Đang thu', color: '#ef4444' },
  { key: 'pickedUp', label: 'Đã thu', color: '#14b8a6' },
  { key: 'completed', label: 'Hoàn thành', color: '#6b7280' },
  { key: 'cancelled', label: 'Đã hủy', color: '#dc2626' },
];

interface StatusBarChartProps {
  counts: OrderStatusCounts;
  isLoading: boolean;
}

export function StatusBarChart({ counts, isLoading }: StatusBarChartProps) {
  const chartData = STATUS_CONFIG.map(({ key, label, color }) => ({
    label,
    count: counts[key] as number,
    color,
  })).filter((d) => d.count > 0);

  return (
    <div className='rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card p-5 flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <div className='w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center'>
          <BarChart3 size={15} className='text-blue-500' />
        </div>
        <div>
          <p className='text-sm font-semibold text-text-main'>
            Trạng thái đơn hàng
          </p>
          <p className='text-xs text-text-sub'>Số đơn đang ở mỗi trạng thái</p>
        </div>
      </div>

      {isLoading ? (
        <ChartSkeleton height={200} />
      ) : (
        <ResponsiveContainer width='100%' height={200}>
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
            barSize={20}
          >
            <CartesianGrid
              strokeDasharray='3 3'
              stroke='currentColor'
              strokeOpacity={0.06}
              vertical={false}
            />
            <XAxis
              dataKey='label'
              tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.55 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.55 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface-card, #fff)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                fontSize: 12,
              }}
              formatter={(val) => [val ?? 0, 'Đơn']}
            />
            <Bar dataKey='count' radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
