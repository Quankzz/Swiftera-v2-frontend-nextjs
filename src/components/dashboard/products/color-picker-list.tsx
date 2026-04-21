'use client';

import { useCallback, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductColorInput } from '@/features/products/types';

const PRESET_COLORS: ProductColorInput[] = [
  // Neutrals
  { name: 'Đen', code: '#000000' },
  { name: 'Trắng', code: '#ffffff' },
  { name: 'Xám', code: '#6b7280' },
  { name: 'Xám nhạt', code: '#d1d5db' },
  // Warm
  { name: 'Đỏ', code: '#ef4444' },
  { name: 'Cam', code: '#f97316' },
  { name: 'Vàng', code: '#eab308' },
  { name: 'Vàng đậm', code: '#f59e0b' },
  // Cool
  { name: 'Xanh lá', code: '#22c55e' },
  { name: 'Xanh ngọc', code: '#06b6d4' },
  { name: 'Xanh dương', code: '#3b82f6' },
  { name: 'Tím', code: '#8b5cf6' },
  // Others
  { name: 'Hồng', code: '#ec4899' },
  { name: 'Nâu', code: '#a16207' },
  { name: 'Navy', code: '#1e3a5f' },
  { name: 'Xanh rừng', code: '#065f46' },
];

interface ColorPickerListProps {
  /** Danh sách màu đang chọn */
  colors: ProductColorInput[];
  onChange: (colors: ProductColorInput[]) => void;
  /** Max số màu được chọn (default 6) */
  maxColors?: number;
  className?: string;
}

export function ColorPickerList({
  colors,
  onChange,
  maxColors = 6,
  className,
}: ColorPickerListProps) {
  const [pendingCode, setPendingCode] = useState('#3b82f6');
  const [pendingName, setPendingName] = useState('');

  const canAdd = colors.length < maxColors;
  const isPendingAlreadyAdded = colors.some((c) => c.code === pendingCode);

  const handlePresetClick = useCallback(
    (preset: ProductColorInput) => {
      if (colors.some((c) => c.code === preset.code) || !canAdd) return;
      onChange([...colors, { name: preset.name, code: preset.code }]);
    },
    [colors, canAdd, onChange],
  );

  const handleRemove = useCallback(
    (index: number) => {
      onChange(colors.filter((_, i) => i !== index));
    },
    [colors, onChange],
  );

  const handlePickerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPendingCode(e.target.value);
    },
    [],
  );

  const handleAddPending = useCallback(() => {
    if (!canAdd || isPendingAlreadyAdded) return;
    const name = pendingName.trim() || pendingCode.toUpperCase();
    onChange([...colors, { name, code: pendingCode }]);
    setPendingName('');
  }, [
    canAdd,
    isPendingAlreadyAdded,
    colors,
    pendingCode,
    pendingName,
    onChange,
  ]);

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* ── Đã chọn ── */}
      {colors.length > 0 && (
        <div className='flex flex-col gap-1.5'>
          <p className='text-xs font-medium text-text-sub'>
            Màu đã chọn ({colors.length}/{maxColors})
          </p>
          <div className='flex flex-wrap gap-2'>
            {colors.map((color, i) => (
              <div
                key={i}
                className='group relative flex flex-col items-center gap-0.5'
              >
                <div
                  className='h-9 w-9 rounded-lg border-2 border-white shadow-sm ring-1 ring-gray-200 dark:ring-white/15'
                  style={{ backgroundColor: color.code }}
                  title={`${color.name} (${color.code.toUpperCase()})`}
                />
                <span className='max-w-9 truncate text-center font-mono text-[9px] text-text-sub leading-none'>
                  {color.name}
                </span>
                <button
                  type='button'
                  onClick={() => handleRemove(i)}
                  className='absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600 focus:opacity-100'
                  title='Xóa màu này'
                >
                  <X size={9} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Preset colors ── */}
      <div className='flex flex-col gap-1.5'>
        <p className='text-xs font-medium text-text-sub'>Màu cơ bản</p>
        <div className='flex flex-wrap gap-1.5'>
          {PRESET_COLORS.map((preset) => {
            const isSelected = colors.some((c) => c.code === preset.code);
            const isDisabled = !isSelected && !canAdd;
            return (
              <button
                key={preset.code}
                type='button'
                disabled={isDisabled}
                onClick={() => handlePresetClick(preset)}
                title={`${preset.name} (${preset.code.toUpperCase()})${isSelected ? ' - Đã chọn' : isDisabled ? ' - Đã đạt tối đa' : ''}`}
                className={cn(
                  'relative h-8 w-8 rounded-md border-2 transition-all',
                  preset.code === '#ffffff'
                    ? 'border-gray-200 dark:border-white/15'
                    : 'border-transparent',
                  isSelected
                    ? 'ring-2 ring-offset-1 ring-theme-primary-start scale-110 border-white'
                    : isDisabled
                      ? 'opacity-30 cursor-not-allowed'
                      : 'hover:scale-110 hover:border-white hover:ring-2 hover:ring-offset-1 hover:ring-theme-primary-start cursor-pointer',
                )}
                style={{ backgroundColor: preset.code }}
              >
                {isSelected && (
                  <span className='absolute inset-0 flex items-center justify-center'>
                    <svg width='12' height='12' viewBox='0 0 12 12' fill='none'>
                      <path
                        d='M2 6l3 3 5-5'
                        stroke={
                          preset.code === '#ffffff' ||
                          preset.code === '#d1d5db' ||
                          preset.code === '#f59e0b' ||
                          preset.code === '#eab308'
                            ? '#374151'
                            : '#ffffff'
                        }
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tự thêm màu tùy chỉnh ── */}
      <div className='flex flex-col gap-1.5'>
        <p className='text-xs font-medium text-text-sub'>Màu tùy chỉnh</p>
        <div className='flex flex-wrap items-center gap-2'>
          {/* Color picker */}
          <input
            type='color'
            value={pendingCode}
            onChange={handlePickerChange}
            disabled={!canAdd}
            className='h-9 w-10 cursor-pointer rounded-md border border-gray-300 dark:border-white/20 bg-transparent p-0.5 disabled:cursor-not-allowed disabled:opacity-40'
            title='Chọn màu tùy chỉnh'
          />
          {/* Preview swatch */}
          <div
            className='h-9 w-9 shrink-0 rounded-md border-2 border-white shadow-sm ring-1 ring-gray-200 dark:ring-white/15'
            style={{ backgroundColor: pendingCode }}
            title={pendingCode.toUpperCase()}
          />
          {/* Hex code */}
          <span className='w-16 shrink-0 font-mono text-xs text-text-sub'>
            {pendingCode.toUpperCase()}
          </span>
          {/* Name input */}
          <input
            type='text'
            value={pendingName}
            onChange={(e) => setPendingName(e.target.value)}
            placeholder='Tên màu'
            disabled={!canAdd}
            className='h-9 min-w-0 flex-1 rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-2.5 text-sm text-text-main placeholder:text-text-sub focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20 disabled:opacity-40'
          />
          {/* Add button */}
          <button
            type='button'
            onClick={handleAddPending}
            disabled={!canAdd || isPendingAlreadyAdded}
            className={cn(
              'flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition',
              !canAdd
                ? 'border-gray-200 dark:border-white/10 text-text-sub/40 cursor-not-allowed'
                : isPendingAlreadyAdded
                  ? 'border-gray-200 dark:border-white/10 text-text-sub/50 cursor-not-allowed'
                  : 'border-theme-primary-start bg-theme-primary-start/10 text-theme-primary-start hover:bg-theme-primary-start hover:text-white cursor-pointer',
            )}
            title={
              !canAdd
                ? `Đã đạt tối đa ${maxColors} màu`
                : isPendingAlreadyAdded
                  ? 'Màu này đã có trong danh sách'
                  : `Thêm màu ${pendingCode.toUpperCase()}`
            }
          >
            <Plus size={14} />
            {isPendingAlreadyAdded ? 'Đã có' : 'Thêm'}
          </button>
        </div>
        {!canAdd && (
          <p className='text-xs text-text-sub/60'>
            Đã đạt tối đa {maxColors} màu
          </p>
        )}
      </div>
    </div>
  );
}
