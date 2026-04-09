'use client';

/**
 * VoucherPickerDialog — modal chọn voucher giảm giá.
 *
 * Mỗi voucher hiển thị dạng "vé" (ticket) với viền nét đứt,
 * hai bên có hình tròn cutout, code lớn ở trái, chi tiết ở phải.
 *
 * Props:
 *   selectedVoucherId — voucher đang chọn (để highlight)
 *   onSelect          — callback(voucherId) khi chọn
 *   onClear           — bỏ chọn voucher
 *   onClose           — đóng dialog
 *   open              — hiển thị/ẩn
 */

import { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  Percent,
  DollarSign,
  Calendar,
  Users,
  SlidersHorizontal,
  ChevronDown,
  Ticket,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVouchersQuery } from '@/features/vouchers/hooks/use-voucher-management';
import type { VoucherResponse } from '@/features/vouchers/types';

// ─── Helpers ─────────────────────────────────────────────────────
const vndFmt = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

function formatVnd(n: number) {
  return vndFmt.format(n);
}

function formatExpiry(expiresAt: string | null): string {
  if (!expiresAt) return 'Không hết hạn';
  try {
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(
      new Date(expiresAt),
    );
  } catch {
    return expiresAt;
  }
}

// ─── Ticket card ──────────────────────────────────────────────────
function VoucherTicket({
  voucher,
  selected,
  onSelect,
  compact,
}: {
  voucher: VoucherResponse;
  selected: boolean;
  onSelect: () => void;
  compact?: boolean;
}) {
  const isPercentage = voucher.discountType === 'PERCENTAGE';
  const discountText = isPercentage
    ? `${voucher.discountValue}%`
    : formatVnd(voucher.discountValue);
  const discountSub =
    isPercentage && voucher.maxDiscountAmount
      ? `tối đa ${formatVnd(voucher.maxDiscountAmount)}`
      : isPercentage
        ? 'không giới hạn'
        : 'cố định';

  const expired = voucher.expiresAt
    ? new Date(voucher.expiresAt) < new Date()
    : false;

  const unavailable = !voucher.isActive || expired;

  return (
    <button
      type='button'
      onClick={onSelect}
      disabled={unavailable}
      className={cn(
        'group relative w-full text-left transition-all duration-150',
        unavailable && 'opacity-50 cursor-not-allowed',
      )}
    >
      {/* Ticket shell */}
      <div
        className={cn(
          'relative flex min-h-22 overflow-hidden rounded-xl border-2 border-dashed',
          selected
            ? 'border-theme-primary-start bg-theme-primary-start/5 dark:bg-theme-primary-start/10'
            : unavailable
              ? 'border-gray-200 dark:border-white/8 bg-gray-50 dark:bg-white/2'
              : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/3 hover:border-theme-primary-start/60 hover:bg-gray-50 dark:hover:bg-white/5',
        )}
      >
        {/* Left side — big discount value */}
        <div
          className={cn(
            'flex w-36 shrink-0 flex-col items-center justify-center px-3 py-4 border-r-2 border-dashed',
            selected
              ? 'border-theme-primary-start/40 bg-theme-primary-start/10 dark:bg-theme-primary-start/15'
              : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5',
          )}
        >
          {isPercentage ? (
            <Percent
              size={14}
              className={cn(
                'mb-0.5',
                selected ? 'text-theme-primary-start' : 'text-text-sub',
              )}
            />
          ) : (
            <DollarSign
              size={14}
              className={cn(
                'mb-0.5',
                selected ? 'text-theme-primary-start' : 'text-text-sub',
              )}
            />
          )}
          <span
            className={cn(
              'text-xl font-black leading-none',
              selected ? 'text-theme-primary-start' : 'text-text-main',
            )}
          >
            {discountText}
          </span>
          <span className='mt-0.5 text-[9px] text-text-sub font-medium uppercase tracking-wide text-center truncate w-full'>
            {discountSub}
          </span>
        </div>

        {/* Cutout circles (ticket perforation) */}
        <div className='absolute left-19 -top-3 h-6 w-6 rounded-full bg-white dark:bg-surface-card border border-gray-200 dark:border-white/8' />
        <div className='absolute left-19 -bottom-3 h-6 w-6 rounded-full bg-white dark:bg-surface-card border border-gray-200 dark:border-white/8' />

        {/* Right side — details */}
        <div className='flex flex-1 flex-col gap-1.5 px-4 py-3 min-w-0'>
          {/* Code + selected check */}
          <div className='flex items-center justify-between gap-2'>
            <span className='font-mono text-base font-bold tracking-wider text-text-main'>
              {voucher.code}
            </span>
            {selected && (
              <CheckCircle2
                size={16}
                className='shrink-0 text-theme-primary-start'
              />
            )}
          </div>

          {!compact && (
            <div className='flex flex-col gap-1'>
              {/* Expiry */}
              <div className='flex items-center gap-1.5 text-xs text-text-sub'>
                <Calendar size={10} className='shrink-0' />
                <span>
                  {expired ? (
                    <span className='text-red-500 font-medium'>Đã hết hạn</span>
                  ) : (
                    <>HSD: {formatExpiry(voucher.expiresAt)}</>
                  )}
                </span>
              </div>

              {/* Usage */}
              <div className='flex items-center gap-1.5 text-xs text-text-sub'>
                <Users size={10} className='shrink-0' />
                <span>
                  Đã dùng: {voucher.usedCount}
                  {voucher.usageLimit ? `/${voucher.usageLimit}` : ''}
                </span>
              </div>

              {/* Min rental days */}
              {voucher.minRentalDays && (
                <div className='text-xs text-text-sub'>
                  Thuê tối thiểu {voucher.minRentalDays} ngày
                </div>
              )}

              {/* Status badges */}
              <div className='flex flex-wrap gap-1 pt-0.5'>
                {!voucher.isActive && (
                  <span className='rounded-full bg-gray-100 dark:bg-white/8 px-2 py-0.5 text-[10px] font-medium text-gray-500'>
                    Tạm ngưng
                  </span>
                )}
                {expired && (
                  <span className='rounded-full bg-red-100 dark:bg-red-900/20 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:text-red-400'>
                    Hết hạn
                  </span>
                )}
                {voucher.isActive && !expired && (
                  <span className='rounded-full bg-green-100 dark:bg-green-900/20 px-2 py-0.5 text-[10px] font-medium text-green-600 dark:text-green-400'>
                    Đang hiệu lực
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Dialog ───────────────────────────────────────────────────────

interface VoucherPickerDialogProps {
  open: boolean;
  onClose: () => void;
  selectedVoucherId?: string;
  onSelect: (voucherId: string) => void;
  onClear: () => void;
}

type SortOpt = 'newest' | 'discount_desc' | 'code_asc' | 'expiry_asc';

const SORT_LABELS: Record<SortOpt, string> = {
  newest: 'Mới nhất',
  discount_desc: 'Giảm nhiều nhất',
  code_asc: 'Mã A → Z',
  expiry_asc: 'Hết hạn sớm nhất',
};

export function VoucherPickerDialog({
  open,
  onClose,
  selectedVoucherId,
  onSelect,
  onClear,
}: VoucherPickerDialogProps) {
  const [search, setSearch] = useState('');
  const [activeOnly, setActiveOnly] = useState(true);
  const [sort, setSort] = useState<SortOpt>('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const { data, isLoading, isError } = useVouchersQuery({
    page: 1,
    size: 200,
    filter: "type:'PRODUCT_DISCOUNT'",
  });
  const allVouchers = useMemo(() => data?.content ?? [], [data]);

  const filtered = useMemo(() => {
    let list = allVouchers;

    if (activeOnly) list = list.filter((v) => v.isActive);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((v) => v.code.toLowerCase().includes(q));
    }

    list = [...list].sort((a, b) => {
      if (sort === 'code_asc') return a.code.localeCompare(b.code);
      if (sort === 'discount_desc') {
        // Normalize: both to percent-equivalent for rough sort
        const aVal = a.discountType === 'PERCENTAGE' ? a.discountValue : 0;
        const bVal = b.discountType === 'PERCENTAGE' ? b.discountValue : 0;
        return bVal - aVal;
      }
      if (sort === 'expiry_asc') {
        const aT = a.expiresAt ? new Date(a.expiresAt).getTime() : Infinity;
        const bT = b.expiresAt ? new Date(b.expiresAt).getTime() : Infinity;
        return aT - bT;
      }
      // newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [allVouchers, search, activeOnly, sort]);

  const selectedVoucher = allVouchers.find(
    (v) => v.voucherId === selectedVoucherId,
  );

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-60 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Dialog */}
      <div className='relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white dark:bg-surface-card shadow-2xl dark:shadow-black/60 max-h-[85vh]'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-100 dark:border-white/8 px-5 py-4'>
          <div className='flex items-center gap-3'>
            <div className='flex size-9 items-center justify-center rounded-xl bg-theme-accent-start/10'>
              <Ticket size={16} className='text-theme-accent-start' />
            </div>
            <div>
              <h3 className='text-base font-semibold text-text-main'>
                Chọn voucher giảm giá
              </h3>
              <p className='text-xs text-text-sub'>
                {isLoading
                  ? 'Đang tải...'
                  : `${filtered.length} voucher${activeOnly ? ' đang hiệu lực' : ''}`}
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='flex size-8 items-center justify-center rounded-lg text-text-sub hover:bg-gray-100 dark:hover:bg-white/8 hover:text-text-main transition'
          >
            <X size={16} />
          </button>
        </div>

        {/* Search + filter */}
        <div className='border-b border-gray-100 dark:border-white/8 px-5 py-3 flex flex-col gap-2'>
          <div className='relative'>
            <Search
              size={14}
              className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-sub'
            />
            <input
              type='text'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Tìm theo mã voucher...'
              autoFocus
              className='h-9 w-full rounded-lg border border-gray-200 dark:border-white/8 bg-gray-50 dark:bg-white/5 pl-8 pr-3 text-sm text-text-main placeholder:text-text-sub focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20'
            />
          </div>

          <button
            type='button'
            onClick={() => setShowFilters((v) => !v)}
            className='flex items-center gap-1.5 self-start text-xs text-text-sub hover:text-text-main transition'
          >
            <SlidersHorizontal size={12} />
            Bộ lọc & Sắp xếp
            <ChevronDown
              size={11}
              className={cn(
                'transition-transform',
                showFilters && 'rotate-180',
              )}
            />
          </button>

          {showFilters && (
            <div className='flex flex-wrap items-center gap-3 pt-1'>
              <label className='flex cursor-pointer items-center gap-2 text-xs text-text-sub'>
                <input
                  type='checkbox'
                  checked={activeOnly}
                  onChange={(e) => setActiveOnly(e.target.checked)}
                  className='h-3.5 w-3.5 rounded border-gray-300 accent-theme-primary-start'
                />
                Chỉ hiện voucher đang hiệu lực
              </label>

              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOpt)}
                className='h-7 rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-2 text-xs text-text-main focus:border-theme-primary-start focus:outline-none'
              >
                {(Object.keys(SORT_LABELS) as SortOpt[]).map((key) => (
                  <option key={key} value={key}>
                    {SORT_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Voucher list */}
        <div className='flex-1 overflow-y-auto px-5 py-4'>
          {/* No voucher option */}
          <button
            type='button'
            onClick={() => {
              onClear();
              onClose();
            }}
            className={cn(
              'mb-4 w-full rounded-xl border-2 border-dashed px-4 py-3 text-sm transition',
              !selectedVoucherId
                ? 'border-gray-400 dark:border-white/20 bg-gray-50 dark:bg-white/5 text-text-main font-medium'
                : 'border-gray-200 dark:border-white/8 text-text-sub hover:border-gray-400 hover:text-text-main',
            )}
          >
            {!selectedVoucherId && (
              <CheckCircle2 size={14} className='mr-2 inline text-text-main' />
            )}
            Không áp dụng voucher
          </button>

          {isLoading && (
            <div className='flex flex-col gap-3'>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className='h-28 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5'
                />
              ))}
            </div>
          )}

          {isError && (
            <p className='py-8 text-center text-sm text-red-500'>
              Không thể tải danh sách voucher. Vui lòng thử lại.
            </p>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className='flex flex-col items-center gap-2 py-12 text-text-sub'>
              <Ticket size={32} className='opacity-20' />
              <p className='text-sm'>Không tìm thấy voucher nào phù hợp.</p>
              {search && (
                <button
                  type='button'
                  onClick={() => {
                    setSearch('');
                  }}
                  className='text-xs text-theme-primary-start hover:underline'
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          )}

          {!isLoading && !isError && filtered.length > 0 && (
            <div className='flex flex-col gap-3'>
              {filtered.map((v) => (
                <VoucherTicket
                  key={v.voucherId}
                  voucher={v}
                  selected={v.voucherId === selectedVoucherId}
                  onSelect={() => {
                    onSelect(v.voucherId);
                    onClose();
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer — selected preview */}
        <div className='border-t border-gray-100 dark:border-white/8 px-5 py-3'>
          {selectedVoucher ? (
            <div className='flex items-center gap-3'>
              <div className='flex-1 min-w-0'>
                <VoucherTicket
                  voucher={selectedVoucher}
                  selected
                  onSelect={() => {}}
                  compact
                />
              </div>
              <div className='flex shrink-0 gap-2'>
                <button
                  type='button'
                  onClick={() => {
                    onClear();
                    onClose();
                  }}
                  className='rounded-lg border border-red-200 dark:border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/15 transition'
                >
                  Bỏ chọn
                </button>
                <button
                  type='button'
                  onClick={onClose}
                  className='rounded-lg border border-gray-200 dark:border-white/8 px-3 py-1.5 text-xs text-text-main hover:bg-gray-50 dark:hover:bg-white/8 transition'
                >
                  Đóng
                </button>
              </div>
            </div>
          ) : (
            <div className='flex items-center justify-between'>
              <p className='text-xs text-text-sub'>Chưa chọn voucher</p>
              <button
                type='button'
                onClick={onClose}
                className='rounded-lg border border-gray-200 dark:border-white/8 px-4 py-1.5 text-sm text-text-main hover:bg-gray-50 dark:hover:bg-white/8 transition'
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
