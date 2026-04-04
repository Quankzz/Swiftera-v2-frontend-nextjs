'use client';

import { useCallback, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRESET_COLORS = [
  // Neutrals
  { hex: '#000000', label: 'Đen' },
  { hex: '#ffffff', label: 'Trắng' },
  { hex: '#6b7280', label: 'Xám' },
  { hex: '#d1d5db', label: 'Xám nhạt' },
  // Warm
  { hex: '#ef4444', label: 'Đỏ' },
  { hex: '#f97316', label: 'Cam' },
  { hex: '#eab308', label: 'Vàng' },
  { hex: '#f59e0b', label: 'Vàng đậm' },
  // Cool
  { hex: '#22c55e', label: 'Xanh lá' },
  { hex: '#06b6d4', label: 'Xanh ngọc' },
  { hex: '#3b82f6', label: 'Xanh dương' },
  { hex: '#8b5cf6', label: 'Tím' },
  // Others
  { hex: '#ec4899', label: 'Hồng' },
  { hex: '#a16207', label: 'Nâu' },
  { hex: '#1e3a5f', label: 'Navy' },
  { hex: '#065f46', label: 'Xanh rừng' },
];

interface ColorPickerListProps {
  /** Danh sách màu đang chọn (hex string, VD: "#1a2b3c") */
  colors: string[];
  onChange: (colors: string[]) => void;
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
  // Màu đang preview trong picker (chưa commit vào danh sách)
  const [pendingColor, setPendingColor] = useState('#3b82f6');

  const canAdd = colors.length < maxColors;
  const isPendingAlreadyAdded = colors.includes(pendingColor);

  // Thêm màu preset — chỉ thêm nếu chưa có và chưa đạt max
  const handlePresetClick = useCallback(
    (hex: string) => {
      if (colors.includes(hex) || !canAdd) return;
      onChange([...colors, hex]);
    },
    [colors, canAdd, onChange],
  );

  // Xóa màu đã chọn
  const handleRemove = useCallback(
    (index: number) => {
      onChange(colors.filter((_, i) => i !== index));
    },
    [colors, onChange],
  );

  // onChange chỉ cập nhật state tạm
  const handlePickerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPendingColor(e.target.value);
    },
    [],
  );

  // Commit màu tạm vào danh sách khi user nhấn nút "Thêm"
  const handleAddPending = useCallback(() => {
    if (!canAdd || isPendingAlreadyAdded) return;
    onChange([...colors, pendingColor]);
  }, [canAdd, isPendingAlreadyAdded, colors, pendingColor, onChange]);

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
                {/* Swatch — chỉ hiển thị màu, không có input overlay */}
                <div
                  className='h-9 w-9 rounded-lg border-2 border-white shadow-sm ring-1 ring-gray-200 dark:ring-white/15'
                  style={{ backgroundColor: color }}
                  title={`Màu: ${color}`}
                />
                <span className='font-mono text-[9px] text-text-sub leading-none'>
                  {color.toUpperCase()}
                </span>
                {/* Nút xóa — chỉ hiện khi hover vào swatch */}
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
          {PRESET_COLORS.map(({ hex, label }) => {
            const isSelected = colors.includes(hex);
            const isDisabled = !isSelected && !canAdd;
            return (
              <button
                key={hex}
                type='button'
                disabled={isDisabled}
                onClick={() => handlePresetClick(hex)}
                title={`${label} (${hex.toUpperCase()})${isSelected ? ' — Đã chọn' : isDisabled ? ' — Đã đạt tối đa' : ''}`}
                className={cn(
                  'relative h-8 w-8 rounded-md border-2 transition-all',
                  hex === '#ffffff'
                    ? 'border-gray-200 dark:border-white/15'
                    : 'border-transparent',
                  isSelected
                    ? 'ring-2 ring-offset-1 ring-theme-primary-start scale-110 border-white'
                    : isDisabled
                      ? 'opacity-30 cursor-not-allowed'
                      : 'hover:scale-110 hover:border-white hover:ring-2 hover:ring-offset-1 hover:ring-theme-primary-start cursor-pointer',
                )}
                style={{ backgroundColor: hex }}
              >
                {isSelected && (
                  <span className='absolute inset-0 flex items-center justify-center'>
                    <svg width='12' height='12' viewBox='0 0 12 12' fill='none'>
                      <path
                        d='M2 6l3 3 5-5'
                        stroke={
                          hex === '#ffffff' ||
                          hex === '#d1d5db' ||
                          hex === '#f59e0b' ||
                          hex === '#eab308'
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
        <div className='flex items-center gap-2'>
          {/* Native color input — hiển thị inline, onChange chỉ cập nhật preview */}
          <input
            type='color'
            value={pendingColor}
            onChange={handlePickerChange}
            disabled={!canAdd}
            className='h-9 w-10 cursor-pointer rounded-md border border-gray-300 dark:border-white/20 bg-transparent p-0.5 disabled:cursor-not-allowed disabled:opacity-40'
            title='Chọn màu tùy chỉnh'
          />
          {/* Preview swatch của màu đang chọn */}
          <div
            className='h-9 w-9 shrink-0 rounded-md border-2 border-white shadow-sm ring-1 ring-gray-200 dark:ring-white/15'
            style={{ backgroundColor: pendingColor }}
            title={pendingColor.toUpperCase()}
          />
          <span className='font-mono text-xs text-text-sub w-16 shrink-0'>
            {pendingColor.toUpperCase()}
          </span>
          {/* Nút commit màu vào danh sách */}
          <button
            type='button'
            onClick={handleAddPending}
            disabled={!canAdd || isPendingAlreadyAdded}
            className={cn(
              'flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition shrink-0',
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
                  : `Thêm màu ${pendingColor.toUpperCase()}`
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
