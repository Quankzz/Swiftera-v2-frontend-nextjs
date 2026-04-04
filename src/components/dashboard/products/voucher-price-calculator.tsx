'use client';

/**
 * VoucherPriceCalculator — UI component để tính dailyPrice từ oldDailyPrice + voucher.
 *
 * Logic tính (theo BE spec, Module 11: VOUCHERS):
 *   PERCENTAGE:   discount = min(oldDailyPrice * discountValue/100, maxDiscountAmount ?? ∞)
 *   FIXED_AMOUNT: discount = discountValue
 *   no voucher:   dailyPrice = oldDailyPrice
 *
 * BE spec (Module 8: PRODUCTS):
 *   - dailyPrice REQUIRED (> 0) trong create/update payload
 *   - oldDailyPrice phải >= dailyPrice nếu có
 *   - Vì vậy: oldDailyPrice là giá gốc, dailyPrice là giá sau giảm
 *
 * Parent nhận onValueChange({ dailyPrice, oldDailyPrice }) và dùng để submit.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Tag,
  Info,
  Percent,
  DollarSign,
  ChevronRight,
  X as XIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVouchersQuery } from '@/features/vouchers/hooks/use-voucher-management';
import type { VoucherResponse } from '@/features/vouchers/types';
import { VoucherPickerDialog } from './voucher-picker-dialog';

// ─── Pricing computation ──────────────────────────────────────────
export interface PriceValues {
  /** Giá thuê thực tế (sau giảm) — gửi lên BE */
  dailyPrice: number;
  /** Giá gốc trước giảm — gửi lên BE khi > dailyPrice */
  oldDailyPrice: number | undefined;
  /** Voucher đang áp dụng (nếu có) */
  selectedVoucherId: string | undefined;
}

function computeDiscount(
  oldDailyPrice: number,
  voucher: VoucherResponse | null,
): number {
  if (!voucher) return 0;
  if (voucher.discountType === 'PERCENTAGE') {
    const raw = (oldDailyPrice * voucher.discountValue) / 100;
    const cap = voucher.maxDiscountAmount ?? Infinity;
    return Math.min(raw, cap);
  }
  // FIXED_AMOUNT
  return voucher.discountValue;
}

function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─────────────────────────────────────────────────────────────────────────────

interface VoucherPriceCalculatorProps {
  /** Giá gốc (string vì input HTML) */
  oldDailyPrice: string;
  onOldDailyPriceChange: (value: string) => void;
  /** Voucher đang được chọn */
  selectedVoucherId: string | undefined;
  onVoucherChange: (voucherId: string | undefined) => void;
  /** Callback để parent nhận dailyPrice đã tính */
  onValueChange: (values: PriceValues) => void;
  /** Class ngoài */
  className?: string;
}

const inputCls =
  'h-9 w-full rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-3 text-sm text-text-main placeholder:text-text-sub focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20';

export function VoucherPriceCalculator({
  oldDailyPrice,
  onOldDailyPriceChange,
  selectedVoucherId,
  onVoucherChange,
  onValueChange,
  className,
}: VoucherPriceCalculatorProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  // Fetch active vouchers — needed to find selectedVoucher details
  const { data: vouchersData } = useVouchersQuery({
    page: 0,
    size: 200,
  });
  const vouchers = useMemo(() => vouchersData?.content ?? [], [vouchersData]);

  const selectedVoucher =
    vouchers.find((v) => v.voucherId === selectedVoucherId) ?? null;

  const oldPrice = parseFloat(oldDailyPrice) || 0;
  const discount = useMemo(
    () => computeDiscount(oldPrice, selectedVoucher),
    [oldPrice, selectedVoucher],
  );
  const dailyPrice = Math.max(oldPrice - discount, 0);

  // Notify parent whenever computed value changes
  const notifyParent = useCallback(() => {
    onValueChange({
      dailyPrice,
      oldDailyPrice:
        selectedVoucher && oldPrice > dailyPrice ? oldPrice : undefined,
      selectedVoucherId,
    });
  }, [dailyPrice, oldPrice, selectedVoucher, selectedVoucherId, onValueChange]);

  useEffect(() => {
    notifyParent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyPrice, selectedVoucherId, oldDailyPrice]);

  const hasDiscount = discount > 0;
  const isPercentage = selectedVoucher?.discountType === 'PERCENTAGE';

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Old Daily Price input */}
      <div className='flex flex-col gap-1.5'>
        <label className='text-xs font-medium text-text-sub'>
          Giá gốc (₫/ngày) <span className='text-red-500'>*</span>
        </label>
        <div className='relative'>
          <DollarSign
            size={14}
            className='pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-sub'
          />
          <input
            type='number'
            min={0}
            step={1000}
            value={oldDailyPrice}
            onChange={(e) => onOldDailyPriceChange(e.target.value)}
            placeholder='VD: 500000'
            className={cn(inputCls, 'pl-7')}
          />
        </div>
      </div>

      {/* Voucher picker button */}
      <div className='flex flex-col gap-1.5'>
        <label className='text-xs font-medium text-text-sub flex items-center gap-1'>
          <Tag size={11} />
          Áp dụng voucher giảm giá
        </label>
        <button
          type='button'
          onClick={() => setPickerOpen(true)}
          className={cn(
            'flex h-10 w-full items-center gap-2.5 rounded-md border px-3 text-sm transition text-left',
            selectedVoucher
              ? 'border-theme-accent-start/40 bg-theme-accent-start/5 dark:bg-theme-accent-start/10 text-text-main hover:border-theme-accent-start'
              : 'border-dashed border-gray-300 dark:border-white/15 text-text-sub hover:border-theme-primary-start hover:bg-theme-primary-start/5',
          )}
        >
          <Tag
            size={13}
            className={
              selectedVoucher ? 'text-theme-accent-start' : 'text-text-sub'
            }
          />
          <span className='flex-1 truncate'>
            {selectedVoucher
              ? selectedVoucher.code
              : 'Nhấn để chọn voucher giảm giá...'}
          </span>
          {selectedVoucher ? (
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                onVoucherChange(undefined);
              }}
              className='flex size-5 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-white/15 text-text-sub hover:text-text-main transition'
              title='Bỏ chọn voucher'
            >
              <XIcon size={11} />
            </button>
          ) : (
            <ChevronRight size={14} className='shrink-0 text-text-sub' />
          )}
        </button>
      </div>

      {/* VoucherPickerDialog */}
      <VoucherPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedVoucherId={selectedVoucherId}
        onSelect={(vid) => onVoucherChange(vid)}
        onClear={() => onVoucherChange(undefined)}
      />

      {/* Selected voucher detail info */}
      {selectedVoucher && (
        <div className='flex items-start gap-2 rounded-lg border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-900/15 px-3 py-2.5 text-xs text-blue-700 dark:text-blue-300'>
          <Info size={13} className='mt-0.5 shrink-0' />
          <div className='flex flex-col gap-0.5'>
            <span className='font-semibold'>
              {isPercentage ? (
                <>
                  <Percent size={11} className='inline mr-0.5' />
                  Giảm {selectedVoucher.discountValue}%
                  {selectedVoucher.maxDiscountAmount
                    ? ` (tối đa ${formatVnd(selectedVoucher.maxDiscountAmount)})`
                    : ''}
                </>
              ) : (
                <>Giảm cố định {formatVnd(selectedVoucher.discountValue)}</>
              )}
            </span>
            {selectedVoucher.minRentalDays && (
              <span>Tối thiểu {selectedVoucher.minRentalDays} ngày thuê</span>
            )}
          </div>
        </div>
      )}

      {/* Computed result */}
      <div className='rounded-lg border border-gray-200 dark:border-white/8 bg-gray-50 dark:bg-white/3 px-4 py-3'>
        <div className='flex items-center justify-between text-sm'>
          <span className='text-text-sub'>Giá thuê/ngày (gửi lên BE)</span>
          <div className='flex items-center gap-2'>
            {hasDiscount && oldPrice > 0 && (
              <span className='text-xs text-text-sub line-through'>
                {formatVnd(oldPrice)}
              </span>
            )}
            <span
              className={cn(
                'font-bold text-base',
                hasDiscount
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-text-main',
              )}
            >
              {dailyPrice > 0 ? formatVnd(dailyPrice) : '—'}
            </span>
          </div>
        </div>
        {hasDiscount && (
          <p className='mt-1 text-xs text-green-600 dark:text-green-400'>
            Đã giảm {formatVnd(discount)}
          </p>
        )}
        {oldPrice <= 0 && (
          <p className='mt-1 text-xs text-amber-600 dark:text-amber-400'>
            Nhập giá gốc để tính toán
          </p>
        )}
      </div>
    </div>
  );
}
