'use client';

import { useState } from 'react';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Package,
  AlertCircle,
  CheckCircle2,
  Wrench,
  XCircle,
  Clock,
  ShieldAlert,
  Warehouse,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  InventoryItemStatus,
  InventoryItemConditionGrade,
} from '@/features/products/types';
import type { DraftInventoryItem } from './use-product-form';
import { HubPickerDialog } from './hub-picker-dialog';

// ─── Status meta ──────────────────────────────────────────────────
// Source: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md — Module 9
// Status enum: AVAILABLE | RESERVED | RENTED | MAINTENANCE | DAMAGED | RETIRED
const STATUS_OPTIONS: {
  value: InventoryItemStatus;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    value: 'AVAILABLE',
    label: 'Sẵn sàng',
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-500/30',
  },
  {
    value: 'RESERVED',
    label: 'Đã đặt trước',
    icon: Clock,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    border: 'border-violet-200 dark:border-violet-500/30',
  },
  {
    value: 'RENTED',
    label: 'Đang cho thuê',
    icon: Package,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-500/30',
  },
  {
    value: 'MAINTENANCE',
    label: 'Đang bảo trì',
    icon: Wrench,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-500/30',
  },
  {
    value: 'DAMAGED',
    label: 'Hỏng / Hư',
    icon: ShieldAlert,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-500/30',
  },
  {
    value: 'RETIRED',
    label: 'Ngừng sử dụng',
    icon: XCircle,
    color: 'text-gray-500 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-white/5',
    border: 'border-gray-200 dark:border-white/8',
  },
];

const CONDITION_GRADES: {
  value: InventoryItemConditionGrade;
  label: string;
}[] = [
  { value: 'NEW', label: 'Mới — Như hộp' },
  { value: 'GOOD', label: 'Tốt — Vài vết nhỏ' },
  { value: 'FAIR', label: 'Trung bình — Dùng nhiều' },
  { value: 'POOR', label: 'Kém — Cần kiểm tra' },
];

function StatusBadge({ status }: { status: InventoryItemStatus }) {
  const meta = STATUS_OPTIONS.find((s) => s.value === status)!;
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        meta.bg,
        meta.border,
        meta.color,
      )}
    >
      <Icon size={11} />
      {meta.label}
    </span>
  );
}

// ─── Single inventory item row ────────────────────────────────────
function InventoryItemRow({
  item,
  index,
  onUpdate,
  onRemove,
}: {
  item: DraftInventoryItem;
  index: number;
  onUpdate: (patch: Partial<Omit<DraftInventoryItem, 'draftId'>>) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(!item.serialNumber);
  const [hubDialogOpen, setHubDialogOpen] = useState(false);
  // Local hubName for display — initialized from item data (pre-loaded from product detail)
  const [hubName, setHubName] = useState<string>(item.hubName ?? '');

  const inputCls =
    'h-9 w-full rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-3 text-sm text-text-main placeholder:text-text-sub focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20';

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === item.status)!;
  const StatusIcon = currentStatus.icon;

  return (
    <div className='rounded-lg border border-gray-200 dark:border-white/8 bg-gray-50 dark:bg-white/3 overflow-hidden'>
      {/* Row header */}
      <div className='flex items-center gap-3 px-4 py-2.5'>
        {/* Index badge */}
        <span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-white/10 text-xs font-semibold text-text-sub'>
          {index + 1}
        </span>

        {/* Serial number (condensed view) */}
        <div className='flex min-w-0 flex-1 items-center gap-2'>
          {item.serialNumber ? (
            <>
              <span className='font-mono text-sm font-medium text-text-main truncate'>
                {item.serialNumber}
              </span>
              <StatusBadge status={item.status} />
              <span className='hidden sm:inline rounded bg-gray-100 dark:bg-white/8 px-1.5 py-0.5 text-xs text-text-sub'>
                {item.conditionGrade}
              </span>
            </>
          ) : (
            <span className='text-sm text-text-sub italic flex items-center gap-1.5'>
              <AlertCircle size={13} />
              Chưa nhập số seri
            </span>
          )}
        </div>

        {/* Actions */}
        <div className='flex items-center gap-1 shrink-0'>
          <button
            type='button'
            onClick={() => setExpanded((v) => !v)}
            className='flex h-7 w-7 items-center justify-center rounded-md text-text-sub hover:bg-gray-200 dark:hover:bg-white/8 hover:text-text-main transition'
            title={expanded ? 'Thu gọn' : 'Mở rộng'}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            type='button'
            onClick={onRemove}
            className='flex h-7 w-7 items-center justify-center rounded-md text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition'
            title='Xóa thiết bị này'
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className='border-t border-gray-200 dark:border-white/8 px-4 py-4 grid grid-cols-1 gap-3 sm:grid-cols-2'>
          {/* Serial Number */}
          <div className='flex flex-col gap-1.5 sm:col-span-2'>
            <label className='text-xs font-medium text-text-sub'>
              Số Serial <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              value={item.serialNumber}
              onChange={(e) => onUpdate({ serialNumber: e.target.value })}
              placeholder='VD: SN-2026-00123'
              className={cn(inputCls, 'font-mono')}
            />
          </div>

          {/* Hub Picker */}
          <div className='flex flex-col gap-1.5 sm:col-span-2'>
            <label className='text-xs font-medium text-text-sub'>
              Kho Hub lưu trữ <span className='text-red-500'>*</span>
            </label>
            <button
              type='button'
              onClick={() => setHubDialogOpen(true)}
              className={cn(
                'flex h-10 w-full items-center gap-2.5 rounded-md border px-3 text-sm transition text-left',
                item.hubId
                  ? 'border-theme-primary-start/40 bg-theme-primary-start/5 dark:bg-theme-primary-start/10 text-text-main hover:border-theme-primary-start'
                  : 'border-dashed border-gray-300 dark:border-white/15 text-text-sub hover:border-theme-primary-start hover:bg-theme-primary-start/5',
              )}
            >
              <Warehouse
                size={14}
                className={
                  item.hubId ? 'text-theme-primary-start' : 'text-text-sub'
                }
              />
              <span className='flex-1 truncate'>
                {item.hubId
                  ? hubName || item.hubId
                  : 'Nhấn để chọn hub lưu trữ...'}
              </span>
              <ChevronRight size={14} className='shrink-0 text-text-sub' />
            </button>
            {item.hubId && (
              <p className='text-[11px] text-text-sub font-mono'>
                ID: {item.hubId}
              </p>
            )}
          </div>

          {/* Hub picker dialog */}
          <HubPickerDialog
            open={hubDialogOpen}
            onClose={() => setHubDialogOpen(false)}
            selectedHubId={item.hubId || undefined}
            onSelect={({ hubId, hubName: name }) => {
              onUpdate({ hubId });
              setHubName(name);
            }}
          />

          {/* Status */}
          <div className='flex flex-col gap-1.5'>
            <label className='text-xs font-medium text-text-sub'>
              Trạng thái
            </label>
            <div className='relative'>
              <select
                value={item.status}
                onChange={(e) =>
                  onUpdate({ status: e.target.value as InventoryItemStatus })
                }
                className={cn(inputCls, 'appearance-none pr-8 cursor-pointer')}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <StatusIcon
                size={13}
                className={cn(
                  'pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2',
                  currentStatus.color,
                )}
              />
            </div>
          </div>

          {/* Condition Grade */}
          <div className='flex flex-col gap-1.5'>
            <label className='text-xs font-medium text-text-sub'>
              Tình trạng máy
            </label>
            <select
              value={item.conditionGrade}
              onChange={(e) =>
                onUpdate({
                  conditionGrade: e.target.value as InventoryItemConditionGrade,
                })
              }
              className={cn(inputCls, 'cursor-pointer')}
            >
              {CONDITION_GRADES.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          {/* Staff Note */}
          <div className='flex flex-col gap-1.5 sm:col-span-2'>
            <label className='text-xs font-medium text-text-sub'>
              Ghi chú nội bộ
            </label>
            <textarea
              value={item.staffNote}
              onChange={(e) => onUpdate({ staffNote: e.target.value })}
              placeholder='VD: Màn hình có vài vết xước nhỏ, pin 85%...'
              rows={2}
              className='w-full resize-none rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-3 py-2 text-sm text-text-main placeholder:text-text-sub focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20'
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Inventory summary bar ────────────────────────────────────────
function InventorySummary({ items }: { items: DraftInventoryItem[] }) {
  const total = items.length;
  const available = items.filter((i) => i.status === 'AVAILABLE').length;
  const rented = items.filter((i) => i.status === 'RENTED').length;
  const maintenance = items.filter((i) => i.status === 'MAINTENANCE').length;
  const damaged = items.filter((i) => i.status === 'DAMAGED').length;

  if (total === 0) return null;

  return (
    <div className='flex flex-wrap gap-2'>
      <Chip
        label='Tổng'
        value={total}
        className='text-text-sub bg-gray-100 dark:bg-white/8 border-gray-200 dark:border-white/8'
      />
      <Chip
        label='Sẵn sàng'
        value={available}
        className='text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-500/30'
      />
      {rented > 0 && (
        <Chip
          label='Đang thuê'
          value={rented}
          className='text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-500/30'
        />
      )}
      {maintenance > 0 && (
        <Chip
          label='Bảo trì'
          value={maintenance}
          className='text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-500/30'
        />
      )}
      {damaged > 0 && (
        <Chip
          label='Hỏng'
          value={damaged}
          className='text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-500/30'
        />
      )}
    </div>
  );
}

function Chip({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
        className,
      )}
    >
      <span className='font-bold'>{value}</span>
      {label}
    </span>
  );
}

// ─── Main InventorySection export ────────────────────────────────
interface InventorySectionProps {
  items: DraftInventoryItem[];
  onAdd: () => void;
  onRemove: (draftId: string) => void;
  onUpdate: (
    draftId: string,
    patch: Partial<Omit<DraftInventoryItem, 'draftId'>>,
  ) => void;
}

export function InventorySection({
  items,
  onAdd,
  onRemove,
  onUpdate,
}: InventorySectionProps) {
  return (
    <div className='flex flex-col gap-4'>
      {/* Summary */}
      <InventorySummary items={items} />

      {/* Hint when empty */}
      {items.length === 0 && (
        <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-white/15 py-8 text-center'>
          <Package size={28} className='mb-2 text-text-sub/50' />
          <p className='text-sm font-medium text-text-main'>
            Chưa có thiết bị nào
          </p>
          <p className='mt-0.5 text-xs text-text-sub'>
            Thêm từng thiết bị vật lý với số serial riêng biệt
          </p>
        </div>
      )}

      {/* Item list */}
      <div className='flex flex-col gap-2'>
        {items.map((item, index) => (
          <InventoryItemRow
            key={item.draftId}
            item={item}
            index={index}
            onUpdate={(patch) => onUpdate(item.draftId, patch)}
            onRemove={() => onRemove(item.draftId)}
          />
        ))}
      </div>

      {/* Add button */}
      <button
        type='button'
        onClick={onAdd}
        className='flex h-10 items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 dark:border-white/15 bg-gray-50 dark:bg-white/3 text-sm text-text-sub transition hover:border-theme-primary-start hover:bg-theme-primary-start/5 hover:text-theme-primary-start'
      >
        <Plus size={15} />
        Thêm thiết bị / Serial
      </button>
    </div>
  );
}
