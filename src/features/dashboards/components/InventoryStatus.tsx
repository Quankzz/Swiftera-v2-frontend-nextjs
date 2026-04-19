'use client';

/**
 * InventoryStatus - Hàng thứ hai (phải 33%):
 * Donut chart hiển thị phân bổ trạng thái tồn kho.
 */

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Package } from 'lucide-react';
import type { InventoryStats } from '@/features/dashboards/types';

// ─── Config ───────────────────────────────────────────────────────────────────

const INVENTORY_SEGMENTS = [
  { key: 'available', label: 'Có sẵn', color: '#10b981' },
  { key: 'rented', label: 'Đang thuê', color: '#6366f1' },
  { key: 'reserved', label: 'Đặt trước', color: '#f59e0b' },
  { key: 'maintenance', label: 'Bảo trì', color: '#f97316' },
  { key: 'damaged', label: 'Hư hỏng', color: '#ef4444' },
  { key: 'retired', label: 'Ngừng dùng', color: '#9ca3af' },
] as const;

// ─── Skeleton ────────────────────────────────────────────────────────────────

function DonutSkeleton() {
  return (
    <div className='flex flex-col items-center gap-3 animate-pulse'>
      <div className='w-40 h-40 rounded-full bg-gray-100 dark:bg-white/8' />
      <div className='space-y-2 w-full'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className='h-3 bg-gray-100 dark:bg-white/8 rounded w-3/4 mx-auto'
          />
        ))}
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

interface InventoryStatusProps {
  stats: InventoryStats;
  isLoading: boolean;
}

export function InventoryStatus({ stats, isLoading }: InventoryStatusProps) {
  const chartData = INVENTORY_SEGMENTS.map(({ key, label, color }) => ({
    name: label,
    value: stats[key],
    color,
  })).filter((d) => d.value > 0);

  return (
    <div className='rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card p-5 flex flex-col gap-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center'>
            <Package size={15} className='text-emerald-500' />
          </div>
          <div>
            <p className='text-sm font-semibold text-text-main'>Tồn kho</p>
            <p className='text-xs text-text-sub'>
              {isLoading ? '…' : `${stats.totalItems} thiết bị`}
            </p>
          </div>
        </div>
        {!isLoading && (
          <span className='text-2xl font-bold text-text-main'>
            {stats.totalItems}
          </span>
        )}
      </div>

      {/* Chart */}
      {isLoading ? (
        <DonutSkeleton />
      ) : (
        <>
          <ResponsiveContainer width='100%' height={180}>
            <PieChart>
              <Pie
                data={chartData}
                cx='50%'
                cy='50%'
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey='value'
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface-card, #fff)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  fontSize: 12,
                }}
                formatter={(val, name) => [val, name]}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className='grid grid-cols-2 gap-x-4 gap-y-1.5'>
            {chartData.map((seg) => (
              <div key={seg.name} className='flex items-center gap-1.5'>
                <span
                  className='w-2.5 h-2.5 rounded-full shrink-0'
                  style={{ background: seg.color }}
                />
                <span className='text-[11px] text-text-sub truncate'>
                  {seg.name}
                </span>
                <span className='text-[11px] font-semibold text-text-main ml-auto'>
                  {seg.value}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
