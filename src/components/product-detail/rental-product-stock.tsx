'use client';

import { useMemo, useState } from 'react';
import {
  Package,
  ChevronDown,
  ChevronUp,
  MapPin,
  ShieldCheck,
  Palette,
} from 'lucide-react';
import type { InventoryItemInProduct as ProductInventoryItemResponse } from '@/features/products/types';

interface RentalStockSectionProps {
  inventoryItems: ProductInventoryItemResponse[];
  availableStock: number;
  totalStock: number;
  minRentalDays: number;
}

const STATUS_CONFIG: Record<
  ProductInventoryItemResponse['status'],
  { label: string; color: string; bgColor: string }
> = {
  AVAILABLE: {
    label: 'Sẵn sàng',
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
  },
  RESERVED: {
    label: 'Đã đặt trước',
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/40',
  },
  RENTED: {
    label: 'Đang thuê',
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/40',
  },
  MAINTENANCE: {
    label: 'Bảo trì',
    color: 'text-orange-700 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/40',
  },
  DAMAGED: {
    label: 'Hư hỏng',
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/40',
  },
  RETIRED: {
    label: 'Ngưng hoạt động',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
  },
};

const CONDITION_CONFIG: Record<string, { label: string; color: string }> = {
  NEW: { label: 'Mới', color: 'text-emerald-700 dark:text-emerald-400' },
  GOOD: { label: 'Tốt', color: 'text-blue-700 dark:text-blue-400' },
  FAIR: { label: 'Trung bình', color: 'text-amber-700 dark:text-amber-400' },
  POOR: { label: 'Kém', color: 'text-red-700 dark:text-red-400' },
};

export function RentalStockSection({
  inventoryItems,
  availableStock,
  totalStock,
  minRentalDays,
}: RentalStockSectionProps) {
  const [expanded, setExpanded] = useState(false);

  // Group inventory theo màu
  const colorGroups = useMemo(() => {
    const groups = new Map<
      string,
      {
        colorId: string | null;
        colorName: string | null;
        colorCode: string | null;
        items: ProductInventoryItemResponse[];
      }
    >();

    for (const item of inventoryItems) {
      const key = item.productColorId ?? '__no_color__';
      if (!groups.has(key)) {
        groups.set(key, {
          colorId: item.productColorId,
          colorName: item.colorName,
          colorCode: item.colorCode,
          items: [],
        });
      }
      groups.get(key)!.items.push(item);
    }

    return [...groups.values()];
  }, [inventoryItems]);

  const hasColors = colorGroups.some((g) => g.colorId !== null);

  const visibleItems = expanded
    ? inventoryItems
    : inventoryItems.filter((item) => item.status === 'AVAILABLE');

  const rentedCount = inventoryItems.filter(
    (i) => i.status === 'RENTED',
  ).length;

  return (
    <div className='rounded-xl border border-border/60 bg-card p-4 font-sans ambient-glow sm:p-5'>
      <div className='mb-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-base font-bold tracking-tight text-foreground sm:text-lg'>
            Tình trạng kho
          </h2>
          <button
            type='button'
            onClick={() => setExpanded((v) => !v)}
            className='flex items-center gap-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
          >
            {expanded ? (
              <>
                Thu gọn <ChevronUp className='size-3.5' />
              </>
            ) : (
              <>
                Xem tất cả ({totalStock}) <ChevronDown className='size-3.5' />
              </>
            )}
          </button>
        </div>

        {/* Summary badges */}
        <div className='mt-3 flex flex-wrap items-center gap-2'>
          <div className='flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'>
            <Package className='size-3.5' />
            {availableStock} thiết bị sẵn sàng
          </div>
          {rentedCount > 0 && (
            <div className='flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'>
              {rentedCount} đang cho thuê
            </div>
          )}
          <div className='flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground'>
            Tối thiểu {minRentalDays} ngày
          </div>
        </div>

        {/* Color breakdown - chỉ hiển thị khi có màu */}
        {hasColors && (
          <div className='mt-3 flex flex-wrap gap-2'>
            {colorGroups
              .filter((g) => g.colorId !== null)
              .map((group) => {
                const availInGroup = group.items.filter(
                  (i) => i.status === 'AVAILABLE',
                ).length;
                return (
                  <div
                    key={group.colorId}
                    className='flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1.5 text-xs'
                  >
                    <span
                      className='inline-block size-3 shrink-0 rounded-full border border-border/60'
                      style={{ backgroundColor: group.colorCode ?? '#888' }}
                    />
                    <span className='font-medium text-foreground'>
                      {group.colorName}
                    </span>
                    <span
                      className={
                        availInGroup > 0
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-muted-foreground'
                      }
                    >
                      {availInGroup > 0
                        ? `${availInGroup} sẵn sàng`
                        : 'Hết hàng'}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Danh sách serial - nếu có màu thì group; nếu không thì flat */}
      {hasColors ? (
        <div className='space-y-4'>
          {colorGroups.map((group) => {
            const groupItems = expanded
              ? group.items
              : group.items.filter((i) => i.status === 'AVAILABLE');
            if (groupItems.length === 0 && !expanded) return null;

            return (
              <div key={group.colorId ?? '__no_color__'}>
                {group.colorId && (
                  <div className='mb-2 flex items-center gap-2'>
                    <Palette className='size-3.5 text-muted-foreground' />
                    <span
                      className='inline-block size-3 rounded-full border border-border/60'
                      style={{ backgroundColor: group.colorCode ?? '#888' }}
                    />
                    <span className='text-xs font-semibold text-foreground'>
                      {group.colorName}
                    </span>
                    <span className='text-xs text-muted-foreground'>
                      (
                      {
                        group.items.filter((i) => i.status === 'AVAILABLE')
                          .length
                      }
                      /{group.items.length} sẵn sàng)
                    </span>
                  </div>
                )}
                <div className='space-y-2'>
                  {groupItems.map((item) => (
                    <InventoryItemRow key={item.inventoryItemId} item={item} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className='space-y-2'>
          {visibleItems.map((item) => (
            <InventoryItemRow key={item.inventoryItemId} item={item} />
          ))}
          {!expanded && inventoryItems.length > visibleItems.length && (
            <p className='py-2 text-center text-xs text-muted-foreground'>
              + {inventoryItems.length - visibleItems.length} thiết bị khác
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function InventoryItemRow({ item }: { item: ProductInventoryItemResponse }) {
  const statusCfg = STATUS_CONFIG[item.status];
  const condCfg = CONDITION_CONFIG[item.conditionGrade ?? ''];

  return (
    <div className='flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3'>
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <span className='font-mono text-xs font-semibold text-foreground'>
            {item.serialNumber}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusCfg.bgColor} ${statusCfg.color}`}
          >
            {statusCfg.label}
          </span>
        </div>
        <div className='mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground'>
          <span className='flex items-center gap-1'>
            <MapPin className='size-3' />
            {item.hubName}
          </span>
          {item.conditionGrade && (
            <span className='flex items-center gap-1'>
              <ShieldCheck className='size-3' />
              <span className={condCfg?.color ?? ''}>
                {condCfg?.label ?? item.conditionGrade}
              </span>
            </span>
          )}
        </div>
        {item.staffNote && (
          <p className='mt-1 text-[11px] italic text-muted-foreground'>
            {item.staffNote}
          </p>
        )}
      </div>
    </div>
  );
}
