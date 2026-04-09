'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Truck,
  AlertCircle,
  TicketPercent,
  X,
  Phone,
  Tag,
  MapPin,
  User,
  ChevronDown,
  Pencil,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { HighlightText } from '@/components/ui/highlight-text';
import { Magnetic } from '@/components/ui/magnetic';
import { SpotlightCard } from '@/components/common/spotlight-card';
import { ShinyText } from '@/components/common/shiny-text';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useCartQuery,
  useRemoveCartLine,
  useUpdateCartLineQuantity,
  useClearCart,
} from '@/hooks/api/use-cart';
import { useCreateRentalOrder } from '@/hooks/api/use-rental-orders';
import { useInitiatePayment } from '@/hooks/api/use-payments';
import { VoucherLinePickerDialog } from '@/components/checkout/voucher-line-picker-dialog';
import { PolicyConsentDialog } from '@/components/checkout/policy-consent-dialog';
import {
  useCustomerVouchersQuery,
  useValidateVoucherMutation,
} from '@/features/vouchers/hooks/use-customer-vouchers';
import { toast } from 'sonner';
import type { VoucherResponse } from '@/features/vouchers/types';
import type { CartLineResponse, CartLineVoucherItem } from '@/api/cart';
import { useDeliveryInfo } from '@/hooks/use-delivery-info';

const formatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

/* ─── Skeleton ─────────────────────────────────────────────────────────────── */

function CartLineSkeleton() {
  return (
    <div className='flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-5'>
      <Skeleton className='size-36 shrink-0 rounded-xl' />
      <div className='flex-1 space-y-3'>
        <Skeleton className='h-5 w-3/4' />
        <div className='flex gap-2'>
          <Skeleton className='h-5 w-16' />
          <Skeleton className='h-5 w-20' />
        </div>
        <div className='flex items-center justify-between pt-2'>
          <Skeleton className='h-9 w-28 rounded-xl' />
          <Skeleton className='h-8 w-24' />
        </div>
      </div>
    </div>
  );
}

/* ─── Tính discount từ CartLineVoucherItem ─────────────────────────────────── */

function calcLineVoucherDiscount(
  lineSubtotal: number,
  vouchers: CartLineVoucherItem[] | undefined,
  code: string,
): number {
  const v = (vouchers ?? []).find((x) => x.code === code);
  if (!v) return 0;
  if (v.discountType === 'PERCENTAGE') {
    let d = Math.floor((lineSubtotal * v.discountValue) / 100);
    if (v.maxDiscountAmount) d = Math.min(d, v.maxDiscountAmount);
    return d;
  }
  return Math.min(v.discountValue, lineSubtotal);
}

/* ─── Cart line row ───────────────────────────────────────────────────────── */

function CartLineRow({
  line,
  index,
  isSelected,
  onToggle,
  onRemove,
  onUpdateQty,
  isRemoving,
  isUpdating,
  appliedVoucherCode,
  voucherDiscount,
  onOpenVoucher,
}: {
  line: CartLineResponse;
  index: number;
  isSelected: boolean;
  onToggle: (cartLineId: string) => void;
  onRemove: (cartLineId: string) => void;
  onUpdateQty: (cartLineId: string, quantity: number) => void;
  isRemoving: boolean;
  isUpdating: boolean;
  appliedVoucherCode: string | null;
  voucherDiscount: number;
  onOpenVoucher: (line: CartLineResponse) => void;
}) {
  const days = line.rentalDurationDays;
  const qty = line.quantity;
  const lineTotal = line.lineTotal;

  const isMutating = isRemoving || isUpdating;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <SpotlightCard
        className={`rounded-2xl border shadow-sm backdrop-blur-sm transition-colors ${
          isSelected
            ? 'border-rose-500/50 bg-card/95 dark:bg-card/80 ring-1 ring-rose-500/20'
            : 'border-border/70 bg-card/90 dark:bg-card/80'
        }`}
        spotlightColor='rgba(254, 20, 81, 0.14)'
      >
        <div className='flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-5'>
          {/* Checkbox */}
          <button
            type='button'
            onClick={() => onToggle(line.cartLineId)}
            className='mx-auto mt-1 flex shrink-0 items-start sm:mx-0'
            aria-label={isSelected ? 'Bỏ chọn' : 'Chọn'}
          >
            <span
              className={cn(
                'flex size-[22px] items-center justify-center rounded-full border-2 transition-all duration-150',
                isSelected
                  ? 'border-rose-500 bg-rose-500 shadow-sm shadow-rose-200 dark:shadow-rose-900/40'
                  : 'border-muted-foreground/30 hover:border-rose-400',
              )}
            >
              {isSelected && (
                <svg
                  viewBox='0 0 24 24'
                  className='size-3 text-white'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='3.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <polyline points='20 6 9 17 4 12' />
                </svg>
              )}
            </span>
          </button>

          {/* Image */}
          <Link
            href={`/product/${line.productId}`}
            className='group relative mx-auto aspect-square w-full max-w-[148px] shrink-0 overflow-hidden rounded-xl border border-rose-500/20 bg-muted/50 shadow-inner ring-1 ring-rose-500/10 transition-transform duration-300 hover:scale-[1.02] sm:mx-0'
          >
            {line.productImageUrl ? (
              <img
                src={line.productImageUrl}
                alt={line.productName}
                className='size-full object-cover transition-transform duration-500 group-hover:scale-105'
              />
            ) : (
              <div className='flex size-full items-center justify-center text-muted-foreground'>
                <ShoppingBag className='size-10' />
              </div>
            )}
          </Link>

          {/* Info */}
          <div className='min-w-0 flex-1 space-y-3'>
            <div className='flex flex-col justify-between gap-2 sm:flex-row sm:items-start'>
              <div>
                <Link
                  href={`/product/${line.productId}`}
                  className={`text-base font-semibold leading-snug transition-colors ${
                    isSelected
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-foreground hover:text-rose-600 dark:hover:text-rose-400'
                  }`}
                >
                  {line.productName}
                </Link>

                <div className='mt-2 flex flex-wrap items-center gap-2'>
                  <Badge
                    variant='outline'
                    className='rounded-lg border-rose-500/30 text-xs font-normal text-rose-700 dark:text-rose-300'
                  >
                    {days} ngày
                  </Badge>
                  <Badge
                    variant='secondary'
                    className='rounded-lg text-xs font-normal'
                  >
                    {formatter.format(line.dailyPrice)}₫ / ngày
                  </Badge>

                  {/* Màu sắc */}
                  {line.colorName && (
                    <Badge
                      variant='outline'
                      className='gap-1.5 rounded-lg border-border/60 text-xs font-normal text-foreground'
                    >
                      {line.colorCode && (
                        <span
                          className='inline-block size-2.5 shrink-0 rounded-full border border-border/60'
                          style={{ backgroundColor: line.colorCode }}
                        />
                      )}
                      {line.colorName}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Delete */}
              <Button
                type='button'
                variant='ghost'
                size='icon-sm'
                className='shrink-0 self-end text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-40 sm:self-start'
                aria-label='Xóa khỏi giỏ'
                disabled={isMutating}
                onClick={() => onRemove(line.cartLineId)}
              >
                <Trash2
                  className={`size-4 ${isRemoving ? 'animate-pulse' : ''}`}
                />
              </Button>
            </div>

            {/* Quantity + Price + Voucher */}
            <div className='flex flex-col gap-3 border-t border-border/60 pt-3'>
              <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-center gap-1 rounded-xl border border-input bg-muted/30 p-1 dark:bg-muted/20'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='size-9 rounded-lg p-0'
                    disabled={qty <= 1 || isMutating}
                    onClick={() => onUpdateQty(line.cartLineId, qty - 1)}
                  >
                    <Minus className='size-4' />
                  </Button>
                  <span
                    className={`min-w-9 text-center text-sm font-bold tabular-nums ${isUpdating ? 'opacity-60' : ''}`}
                  >
                    {qty}
                  </span>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='size-9 rounded-lg p-0'
                    disabled={isMutating}
                    onClick={() => onUpdateQty(line.cartLineId, qty + 1)}
                  >
                    <Plus className='size-4' />
                  </Button>
                </div>

                <div className='min-w-0 max-w-full self-stretch overflow-x-auto sm:max-w-none sm:shrink-0 sm:self-center'>
                  <div className='ml-auto inline-block min-w-min space-y-0.5 text-right text-sm'>
                    <div className='whitespace-nowrap text-muted-foreground'>
                      Thuê ({qty} × {days} ngày):
                    </div>
                    {voucherDiscount > 0 ? (
                      <>
                        <div className='whitespace-nowrap text-sm text-muted-foreground line-through'>
                          {formatter.format(lineTotal)}
                        </div>
                        <div className='whitespace-nowrap text-lg font-bold tabular-nums text-rose-600 dark:text-rose-400'>
                          {formatter.format(lineTotal - voucherDiscount)}
                        </div>
                      </>
                    ) : (
                      <div className='whitespace-nowrap pt-1 text-lg font-bold tabular-nums text-rose-600 dark:text-rose-400'>
                        {formatter.format(lineTotal)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Voucher per-line */}
              <div className='flex items-center gap-2'>
                {appliedVoucherCode ? (
                  <>
                    <div className='flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-50/60 px-2.5 py-1.5 dark:bg-rose-950/30'>
                      <TicketPercent className='size-3.5 shrink-0 text-rose-600 dark:text-rose-400' />
                      <span className='font-mono text-xs font-bold text-rose-600 dark:text-rose-400'>
                        {appliedVoucherCode}
                      </span>
                      {voucherDiscount > 0 && (
                        <span className='ml-auto text-xs font-medium text-emerald-600 dark:text-emerald-400'>
                          −{formatter.format(voucherDiscount)}
                        </span>
                      )}
                    </div>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon-sm'
                      className='size-7 shrink-0 text-destructive hover:bg-red-50 dark:hover:bg-red-950/30'
                      onClick={() => onOpenVoucher(line)}
                      title='Đổi hoặc bỏ voucher'
                    >
                      <X className='size-3.5' />
                    </Button>
                  </>
                ) : (
                  <button
                    type='button'
                    onClick={() => onOpenVoucher(line)}
                    className='flex items-center gap-1.5 rounded-lg border border-dashed border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-rose-400/60 hover:bg-rose-50/40 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-400'
                  >
                    <Tag className='size-3.5' />
                    {(line.availableVouchers?.length ?? 0) > 0
                      ? `${line.availableVouchers?.length} voucher khả dụng`
                      : 'Áp mã voucher'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}

/* ─── Summary skeleton ────────────────────────────────────────────────────── */

function SummarySkeleton() {
  return (
    <div className='space-y-5 p-5 sm:p-6'>
      <div className='flex items-center gap-2'>
        <Skeleton className='size-5 w-5' />
        <Skeleton className='h-6 w-36' />
      </div>
      <div className='space-y-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className='flex justify-between'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-4 w-20' />
          </div>
        ))}
        <div className='border-t border-border pt-4'>
          <div className='flex justify-between'>
            <Skeleton className='h-5 w-28' />
            <Skeleton className='h-8 w-28' />
          </div>
        </div>
      </div>
      <Skeleton className='h-12 w-full rounded-xl' />
      <Skeleton className='h-11 w-full rounded-xl' />
    </div>
  );
}

/* ─── Voucher input section ────────────────────────────────────────────────── */

function VoucherSection({
  voucherCode,
  onApply,
  onClear,
  cartRentalSubtotal,
  cartRentalDays,
}: {
  voucherCode: string;
  onApply: (code: string) => void;
  onClear: () => void;
  cartRentalSubtotal: number;
  cartRentalDays: number;
}) {
  const [input, setInput] = useState(voucherCode);
  const { data: vouchersData, isLoading } = useCustomerVouchersQuery();
  const [dialogOpen, setDialogOpen] = useState(false);

  const vouchers: VoucherResponse[] = vouchersData?.items ?? [];

  // Validate voucher trước khi apply
  const validateVoucher = useValidateVoucherMutation();

  async function handleApply() {
    if (!input.trim()) return;
    try {
      const result = await validateVoucher.mutateAsync({
        code: input.trim().toUpperCase(),
        rentalDurationDays: cartRentalDays,
        rentalSubtotalAmount: cartRentalSubtotal,
      });
      if (result.valid) {
        onApply(input.trim().toUpperCase());
      } else {
        toast.error('Voucher không hợp lệ hoặc chưa đủ điều kiện.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Mã voucher không đúng.';
      toast.error(msg);
    }
  }

  function handlePick(v: VoucherResponse) {
    setInput(v.code);
    onApply(v.code);
    setDialogOpen(false);
  }

  return (
    <div className='space-y-2'>
      <label className='flex items-center gap-1.5 text-sm font-semibold text-foreground'>
        <TicketPercent className='size-4 text-rose-600 dark:text-rose-400' />
        Mã voucher
      </label>

      {voucherCode ? (
        <div className='flex items-center justify-between rounded-lg border border-rose-500/40 bg-rose-50/60 px-3 py-2 dark:bg-rose-950/30'>
          <span className='font-mono text-sm font-bold text-rose-600 dark:text-rose-400'>
            {voucherCode}
          </span>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            className='size-7 shrink-0 text-destructive hover:bg-red-50 dark:hover:bg-red-950/30'
            onClick={onClear}
          >
            <X className='size-3.5' />
          </Button>
        </div>
      ) : (
        <div className='flex gap-2'>
          <input
            type='text'
            placeholder='Nhập mã voucher…'
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && void handleApply()}
            className='h-10 w-full rounded-lg border border-input bg-background px-3 font-mono text-sm uppercase placeholder:text-muted-foreground focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200'
          />
          <Button
            type='button'
            size='sm'
            className='h-10 shrink-0 gap-1.5 bg-rose-600 px-3 hover:bg-rose-700'
            onClick={() => void handleApply()}
            disabled={!input.trim()}
          >
            Áp dụng
          </Button>
          <Button
            type='button'
            size='sm'
            variant='outline'
            className='h-10 shrink-0 gap-1.5 border-rose-500/30'
            onClick={() => setDialogOpen(true)}
          >
            Chọn voucher
          </Button>
        </div>
      )}

      <VoucherLinePickerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lineRentalSubtotal={cartRentalSubtotal}
        lineRentalDays={cartRentalDays}
        appliedCode={voucherCode}
        onApply={(v) => handlePick(v)}
        onClear={() => setDialogOpen(false)}
      />
    </div>
  );
}

/* ─── Delivery Info Dialog ───────────────────────────────────────────────────── */

const inputCls =
  'h-10 w-full rounded-xl border border-input bg-background px-3.5 text-sm placeholder:text-muted-foreground/60 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900/20';
const labelCls = 'mb-1.5 block text-xs font-semibold text-muted-foreground';

function DeliveryInfoDialog({
  open,
  onOpenChange,
  recipientName,
  setRecipientName,
  phone,
  setPhone,
  addressLine,
  setAddressLine,
  ward,
  setWard,
  district,
  setDistrict,
  city,
  setCity,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  recipientName: string;
  setRecipientName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  addressLine: string;
  setAddressLine: (v: string) => void;
  ward: string;
  setWard: (v: string) => void;
  district: string;
  setDistrict: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  onConfirm: () => void;
}) {
  const canConfirm = recipientName.trim() !== '' && phone.trim() !== '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90dvh] overflow-y-auto sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2.5'>
            <div className='flex size-8 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/50'>
              <Truck className='size-4 text-rose-600 dark:text-rose-400' />
            </div>
            Thông tin giao hàng
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-5 py-2'>
          {/* Tên người nhận */}
          <div>
            <label htmlFor='d-recipient-name' className={labelCls}>
              <span className='flex items-center gap-1'>
                <User className='size-3' />
                Họ và tên người nhận
                <span className='ml-0.5 text-rose-500'>*</span>
              </span>
            </label>
            <input
              id='d-recipient-name'
              type='text'
              placeholder='Nguyễn Văn A'
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              autoComplete='name'
              className={inputCls}
            />
          </div>

          {/* Số điện thoại */}
          <div>
            <label htmlFor='d-phone' className={labelCls}>
              <span className='flex items-center gap-1'>
                <Phone className='size-3' />
                Số điện thoại
                <span className='ml-0.5 text-rose-500'>*</span>
              </span>
            </label>
            <input
              id='d-phone'
              type='tel'
              inputMode='tel'
              placeholder='09xx xxx xxx'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete='tel'
              className={inputCls}
            />
          </div>
          {/* Số nhà, đường */}
          <div>
            <label htmlFor='d-address-line' className={labelCls}>
              Số nhà, tên đường
            </label>
            <input
              id='d-address-line'
              type='text'
              placeholder='123 Đường Lê Lợi'
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              autoComplete='address-line1'
              className={inputCls}
            />
          </div>

          {/* Phường / Xã + Quận / Huyện */}
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label htmlFor='d-ward' className={labelCls}>
                Phường / Xã
              </label>
              <input
                id='d-ward'
                type='text'
                placeholder='P. Bến Nghé'
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor='d-district' className={labelCls}>
                Quận / Huyện
              </label>
              <input
                id='d-district'
                type='text'
                placeholder='Q. 1'
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Tỉnh / Thành phố */}
          <div>
            <label htmlFor='d-city' className={labelCls}>
              Tỉnh / Thành phố
            </label>
            <input
              id='d-city'
              type='text'
              placeholder='TP. Hồ Chí Minh'
              value={city}
              onChange={(e) => setCity(e.target.value)}
              autoComplete='address-level1'
              className={inputCls}
            />
          </div>
        </div>

        <DialogFooter className='gap-2'>
          <Button
            variant='outline'
            className='flex-1 rounded-xl'
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            className='flex-1 rounded-xl bg-rose-600 font-semibold text-white hover:bg-rose-700 disabled:opacity-50'
            disabled={!canConfirm}
            onClick={onConfirm}
          >
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Cart page ────────────────────────────────────────────────────────────── */

export default function CartPage() {
  const { data: cart, isLoading, isError } = useCartQuery();
  const removeMutation = useRemoveCartLine();
  const updateQtyMutation = useUpdateCartLineQuantity();
  const clearMutation = useClearCart();
  const createOrder = useCreateRentalOrder();
  const initiatePayment = useInitiatePayment();

  // Chọn sản phẩm
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Voucher toàn đơn
  const [voucherCode, setVoucherCode] = useState('');

  // Thông tin giao hàng — lưu vào sessionStorage
  const {
    recipientName,
    setRecipientName,
    phone,
    setPhone,
    addressLine,
    setAddressLine,
    ward,
    setWard,
    district,
    setDistrict,
    city,
    setCity,
  } = useDeliveryInfo();
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);

  // Voucher per-line: cartLineId → voucherCode
  const [lineVouchers, setLineVouchers] = useState<Map<string, string>>(
    new Map(),
  );
  const [voucherDialogOpen, setVoucherDialogOpen] = useState(false);
  const [voucherDialogLine, setVoucherDialogLine] =
    useState<CartLineResponse | null>(null);

  // Policy consent dialog
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);

  const lines: CartLineResponse[] = cart?.cartLines ?? [];

  // Toggle checkbox
  function toggleSelect(cartLineId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(cartLineId)) {
        next.delete(cartLineId);
      } else {
        next.add(cartLineId);
      }
      return next;
    });
  }

  // Select all / deselect all
  function toggleSelectAll() {
    if (selectedIds.size === lines.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(lines.map((l) => l.cartLineId)));
    }
  }

  const selectedLines = useMemo(
    () => lines.filter((l) => selectedIds.has(l.cartLineId)),
    [lines, selectedIds],
  );

  // Tính tổng discount từ voucher per-line cho selectedLines
  const lineVoucherDiscount = useMemo(() => {
    return selectedLines.reduce((sum, l) => {
      const code = lineVouchers.get(l.cartLineId);
      if (!code) return sum;
      return (
        sum + calcLineVoucherDiscount(l.lineTotal, l.availableVouchers, code)
      );
    }, 0);
  }, [selectedLines, lineVouchers]);

  // Tính tổng cho sản phẩm đã chọn
  const selectedTotals = useMemo(() => {
    const subtotal = selectedLines.reduce((acc, l) => acc + l.lineTotal, 0);
    const maxRentalDays = selectedLines.reduce(
      (max, l) => Math.max(max, l.rentalDurationDays),
      0,
    );
    return {
      subtotal,
      grandTotal: subtotal - lineVoucherDiscount,
      selectedCount: selectedLines.length,
      selectedQty: selectedLines.reduce((a, l) => a + l.quantity, 0),
      maxRentalDays,
    };
  }, [selectedLines, lineVoucherDiscount]);

  const totalQty = useMemo(
    () => lines.reduce((a, l) => a + l.quantity, 0),
    [lines],
  );

  const isMutating = removeMutation.isPending || clearMutation.isPending;

  const handleRemove = (cartLineId: string) => {
    removeMutation.mutate(cartLineId);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(cartLineId);
      return next;
    });
  };

  const handleUpdateQty = (cartLineId: string, quantity: number) => {
    if (quantity < 1) return;
    updateQtyMutation.mutate({ cartLineId, quantity });
  };

  const handleClear = () => {
    if (confirm('Xóa toàn bộ giỏ hàng?')) {
      clearMutation.mutate();
      setSelectedIds(new Set());
    }
  };

  function handleApplyVoucher(code: string) {
    setVoucherCode(code.toUpperCase());
  }

  function handleRemoveVoucher() {
    setVoucherCode('');
  }

  function handleOpenLineVoucher(line: CartLineResponse) {
    setVoucherDialogLine(line);
    setVoucherDialogOpen(true);
  }

  function handleApplyLineVoucher(cartLineId: string, code: string) {
    setLineVouchers((prev) => {
      const next = new Map(prev);
      next.set(cartLineId, code.toUpperCase());
      return next;
    });
  }

  function handleClearLineVoucher(cartLineId: string) {
    setLineVouchers((prev) => {
      const next = new Map(prev);
      next.delete(cartLineId);
      return next;
    });
    setVoucherDialogLine(null);
    setVoucherDialogOpen(false);
  }

  /** Bước 1: Validate input rồi mở dialog điều khoản */
  function handleProceedToRent() {
    if (selectedLines.length === 0) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm để thuê.');
      return;
    }
    if (!recipientName.trim()) {
      toast.error('Vui lòng nhập tên người nhận hàng.');
      return;
    }
    if (!phone.trim()) {
      toast.error('Vui lòng nhập số điện thoại liên hệ giao hàng.');
      return;
    }
    setPolicyDialogOpen(true);
  }

  /** Bước 2: Gọi sau khi user đã đồng ý điều khoản → tạo đơn + thanh toán */
  async function handleCreateOrder() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const expectedDeliveryDate = tomorrow.toISOString().slice(0, 10);

    try {
      const result = await createOrder.mutateAsync({
        deliveryRecipientName: recipientName.trim(),
        deliveryPhone: phone.trim(),
        deliveryAddressLine: addressLine.trim() || undefined,
        deliveryWard: ward.trim() || undefined,
        deliveryDistrict: district.trim() || undefined,
        deliveryCity: city.trim() || undefined,
        expectedDeliveryDate,
        voucherCode: voucherCode || undefined,
        orderLines: selectedLines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          rentalDurationDays: l.rentalDurationDays,
          ...(l.productColorId ? { productColorId: l.productColorId } : {}),
          ...(lineVouchers.get(l.cartLineId)
            ? { voucherCode: lineVouchers.get(l.cartLineId) }
            : {}),
        })),
      });

      // Lấy payment URL
      const paymentUrl = await initiatePayment.mutateAsync(
        result.rentalOrderId,
      );

      // Xóa các dòng đã chọn khỏi cart (gọi từng dòng)
      await Promise.all(
        selectedLines.map((l) => removeMutation.mutateAsync(l.cartLineId)),
      );

      // Redirect Vnpay
      window.location.href = paymentUrl;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tạo đơn thuê thất bại.';
      toast.error(msg);
    }
  }

  return (
    <div className='relative min-h-screen overflow-x-hidden bg-white font-sans dark:bg-surface-base'>
      <div className='relative mx-auto w-full max-w-7xl px-3 pb-16 pt-20 sm:px-4 sm:pt-24 md:px-6 md:pt-28'>
        {/* Breadcrumb */}
        <nav className='mb-4 text-xs text-muted-foreground sm:mb-6 sm:text-sm'>
          <ol className='flex flex-wrap items-center gap-x-1.5 gap-y-1'>
            <li>
              <Link
                href='/'
                className='font-medium text-rose-600 transition-colors hover:underline dark:text-rose-400'
              >
                Trang chủ
              </Link>
            </li>
            <li className='text-border'>/</li>
            <li className='font-semibold text-foreground'>Giỏ hàng</li>
          </ol>
        </nav>

        {/* Header */}
        <motion.header
          className='mb-8 sm:mb-10'
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {isLoading ? (
            <div className='space-y-3'>
              <Skeleton className='h-10 w-64' />
              <Skeleton className='h-5 w-80' />
            </div>
          ) : (
            <>
              <div className='flex flex-wrap items-end gap-3 gap-y-2'>
                <h1 className='text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl'>
                  Giỏ hàng{' '}
                  <HighlightText
                    variant='marker'
                    color='destructive'
                    className='font-extrabold'
                  >
                    cho thuê
                  </HighlightText>
                </h1>
                {lines.length > 0 && (
                  <Badge className='border-0 bg-rose-600 text-white shadow-md dark:bg-rose-500'>
                    {totalQty} sản phẩm
                  </Badge>
                )}
              </div>
              <p className='mt-2 max-w-xl text-sm text-muted-foreground sm:text-base'>
                <ShinyText className='font-medium'>Kiểm tra đơn thuê</ShinyText>
                {' — '}
                trước khi tiến hành thanh toán. Giao nhanh toàn quốc.
                <Truck className='ml-1 inline size-4 align-text-bottom text-rose-600 dark:text-rose-400' />
              </p>
            </>
          )}
        </motion.header>

        {/* Error */}
        {isError && (
          <SpotlightCard
            className='rounded-3xl border border-destructive/30 bg-destructive/5 p-12 text-center shadow-lg'
            spotlightColor='rgba(254, 20, 81, 0.1)'
          >
            <AlertCircle className='mx-auto size-12 text-destructive' />
            <p className='mt-4 text-lg font-semibold text-foreground'>
              Không tải được giỏ hàng
            </p>
            <p className='mx-auto mt-2 max-w-sm text-sm text-muted-foreground'>
              Vui lòng đăng nhập hoặc thử lại sau.
            </p>
            <Button
              className='mt-6 rounded-xl bg-rose-600 font-semibold text-white hover:bg-rose-700'
              render={<Link href='/login?redirect=/cart' />}
            >
              Đăng nhập
            </Button>
          </SpotlightCard>
        )}

        {/* Empty */}
        {!isLoading && !isError && lines.length === 0 && (
          <SpotlightCard
            className='rounded-3xl border border-dashed border-border/80 bg-card/80 p-12 text-center shadow-lg backdrop-blur-md dark:bg-card/60'
            spotlightColor='rgba(254, 20, 81, 0.15)'
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <div className='mx-auto flex size-20 items-center justify-center rounded-2xl bg-linear-to-br from-rose-500/20 to-rose-400/20 ring-1 ring-rose-500/20'>
                <ShoppingBag className='size-10 text-rose-600 dark:text-rose-400' />
              </div>
              <p className='mt-6 text-xl font-bold text-foreground'>
                Giỏ hàng trống
              </p>
              <p className='mx-auto mt-2 max-w-sm text-sm text-muted-foreground'>
                Thêm thiết bị từ trang chi tiết sản phẩm để bắt đầu thuê.
              </p>
              <Magnetic intensity={0.35} range={120}>
                <Button
                  className='mt-8 rounded-xl bg-rose-600 px-8 font-semibold text-white shadow-lg hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600'
                  render={<Link href='/' />}
                >
                  Khám phá sản phẩm
                </Button>
              </Magnetic>
            </motion.div>
          </SpotlightCard>
        )}

        {/* Has items OR loading */}
        {(lines.length > 0 || isLoading) && !isError && (
          <div className='grid gap-8 lg:grid-cols-12 lg:gap-10'>
            {/* Cart lines */}
            <div className='space-y-4 lg:col-span-7'>
              <SpotlightCard
                className='rounded-2xl border border-border/60 bg-card/70 shadow-md backdrop-blur-sm dark:bg-card/50'
                spotlightColor='rgba(254, 20, 81, 0.1)'
              >
                <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-4 py-4 sm:px-6'>
                  <div className='flex items-center gap-3'>
                    <span className='text-sm font-semibold text-foreground'>
                      Đơn của bạn
                    </span>
                    {isLoading ? (
                      <Skeleton className='h-5 w-16' />
                    ) : (
                      <Badge variant='secondary' className='rounded-full'>
                        {lines.length} dòng
                      </Badge>
                    )}
                  </div>
                  {!isLoading && lines.length > 0 && (
                    <div className='flex items-center gap-2'>
                      <button
                        type='button'
                        onClick={toggleSelectAll}
                        className='flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                      >
                        <span
                          className={cn(
                            'flex size-4 items-center justify-center rounded border-2 transition-all duration-150',
                            selectedIds.size === lines.length &&
                              lines.length > 0
                              ? 'border-rose-500 bg-rose-500'
                              : 'border-muted-foreground/40',
                          )}
                        >
                          {selectedIds.size === lines.length &&
                            lines.length > 0 && (
                              <svg
                                viewBox='0 0 24 24'
                                className='size-2.5 text-white'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth='3.5'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              >
                                <polyline points='20 6 9 17 4 12' />
                              </svg>
                            )}
                        </span>
                        {selectedIds.size === lines.length
                          ? 'Bỏ chọn tất cả'
                          : 'Chọn tất cả'}
                      </button>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='text-destructive hover:bg-destructive/10 hover:text-destructive'
                        disabled={isMutating}
                        onClick={handleClear}
                      >
                        Xóa tất cả
                      </Button>
                    </div>
                  )}
                </div>

                <div className='space-y-4 p-4 sm:p-6'>
                  {isLoading
                    ? Array.from({ length: 2 }).map((_, i) => (
                        <CartLineSkeleton key={i} />
                      ))
                    : lines.map((line, index) => {
                        const appliedCode =
                          lineVouchers.get(line.cartLineId) ?? null;
                        const voucherDiscount = appliedCode
                          ? calcLineVoucherDiscount(
                              line.lineTotal,
                              line.availableVouchers,
                              appliedCode,
                            )
                          : 0;
                        return (
                          <CartLineRow
                            key={line.cartLineId}
                            line={line}
                            index={index}
                            isSelected={selectedIds.has(line.cartLineId)}
                            onToggle={toggleSelect}
                            onRemove={handleRemove}
                            onUpdateQty={handleUpdateQty}
                            isRemoving={
                              removeMutation.isPending &&
                              removeMutation.variables === line.cartLineId
                            }
                            isUpdating={
                              updateQtyMutation.isPending &&
                              updateQtyMutation.variables?.cartLineId ===
                                line.cartLineId
                            }
                            appliedVoucherCode={appliedCode}
                            voucherDiscount={voucherDiscount}
                            onOpenVoucher={handleOpenLineVoucher}
                          />
                        );
                      })}
                </div>
              </SpotlightCard>
            </div>

            {/* Summary */}
            <div className='lg:col-span-5'>
              <div className='lg:sticky lg:top-28'>
                <SpotlightCard
                  className='rounded-2xl border border-rose-500/20 bg-card/90 shadow-xl backdrop-blur-md dark:border-rose-500/25 dark:bg-card/80'
                  spotlightColor='rgba(254, 20, 81, 0.18)'
                >
                  {isLoading ? (
                    <SummarySkeleton />
                  ) : (
                    <div className='space-y-5 p-5 sm:p-6'>
                      <div className='flex items-center gap-2'>
                        {/* <Sparkles className='size-5 text-rose-600 dark:text-rose-400' /> */}
                        <h2 className='text-lg font-bold text-foreground'>
                          Tóm tắt thanh toán
                        </h2>
                      </div>

                      {/* Thông tin giao hàng */}
                      <div className='space-y-2'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-1.5'>
                            <Truck className='size-4 text-rose-600 dark:text-rose-400' />
                            <span className='text-sm font-semibold text-foreground'>
                              Thông tin giao hàng
                            </span>
                          </div>
                          {(recipientName || phone) && (
                            <button
                              type='button'
                              onClick={() => setDeliveryDialogOpen(true)}
                              className='flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                            >
                              <Pencil className='size-3' />
                              Sửa
                            </button>
                          )}
                        </div>

                        {recipientName || phone ? (
                          /* ── Summary khi đã điền ── */
                          <button
                            type='button'
                            onClick={() => setDeliveryDialogOpen(true)}
                            className='w-full rounded-xl border border-border/60 bg-muted/20 p-3.5 text-left transition-colors hover:border-rose-300/60 hover:bg-rose-50/30 dark:hover:bg-rose-950/10'
                          >
                            <div className='flex items-start gap-3'>
                              <CheckCircle2 className='mt-0.5 size-4 shrink-0 text-emerald-500' />
                              <div className='min-w-0 space-y-0.5'>
                                {recipientName && (
                                  <p className='truncate text-sm font-semibold text-foreground'>
                                    {recipientName}
                                  </p>
                                )}
                                {phone && (
                                  <p className='text-xs text-muted-foreground'>
                                    {phone}
                                  </p>
                                )}
                                {(addressLine || district || city) && (
                                  <p className='truncate text-xs text-muted-foreground'>
                                    {[addressLine, ward, district, city]
                                      .filter(Boolean)
                                      .join(', ')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        ) : (
                          /* ── CTA khi chưa điền ── */
                          <button
                            type='button'
                            onClick={() => setDeliveryDialogOpen(true)}
                            className='flex w-full items-center justify-between rounded-xl border border-dashed border-rose-300/60 bg-rose-50/30 px-4 py-3.5 text-left transition-colors hover:border-rose-400/70 hover:bg-rose-50/50 dark:border-rose-800/40 dark:bg-rose-950/10 dark:hover:bg-rose-950/20'
                          >
                            <div className='flex items-center gap-2.5'>
                              <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950/40'>
                                <User className='size-4 text-rose-600 dark:text-rose-400' />
                              </div>
                              <div>
                                <p className='text-sm font-semibold text-rose-700 dark:text-rose-300'>
                                  Nhập thông tin giao hàng
                                </p>
                                <p className='text-xs text-rose-600/70 dark:text-rose-400/70'>
                                  Tên người nhận &amp; số điện thoại bắt buộc
                                </p>
                              </div>
                            </div>
                            <ChevronDown className='-rotate-90 size-4 text-rose-400' />
                          </button>
                        )}
                      </div>

                      {/* Voucher */}
                      {/* <VoucherSection
                        voucherCode={voucherCode}
                        onApply={handleApplyVoucher}
                        onClear={handleRemoveVoucher}
                        cartRentalSubtotal={selectedTotals.subtotal}
                        cartRentalDays={selectedTotals.maxRentalDays}
                      /> */}

                      <div className='space-y-3 text-sm'>
                        <div className='flex items-baseline justify-between gap-3'>
                          <span className='text-muted-foreground'>
                            Tiền thuê
                            {selectedTotals.selectedCount > 0 && (
                              <span className='ml-1'>
                                ({selectedTotals.selectedQty} sản phẩm)
                              </span>
                            )}
                          </span>
                          <span className='font-medium tabular-nums text-foreground'>
                            {selectedTotals.selectedCount > 0
                              ? formatter.format(selectedTotals.subtotal)
                              : formatter.format(0)}
                          </span>
                        </div>

                        {/* Giảm giá voucher per-line */}
                        {lineVoucherDiscount > 0 && (
                          <div className='flex items-baseline justify-between gap-3'>
                            <span className='flex items-center gap-1 text-muted-foreground'>
                              <TicketPercent className='size-3.5 text-rose-500' />
                              Voucher sản phẩm
                            </span>
                            <span className='font-medium tabular-nums text-emerald-600 dark:text-emerald-400'>
                              −{formatter.format(lineVoucherDiscount)}
                            </span>
                          </div>
                        )}

                        {selectedTotals.selectedCount === 0 &&
                          lines.length > 0 && (
                            <p className='text-xs text-amber-600 dark:text-amber-400'>
                              Chưa chọn sản phẩm nào.
                            </p>
                          )}

                        <div className='border-t border-border/80 pt-4'>
                          <div className='flex items-baseline justify-between gap-3'>
                            <span className='text-base font-bold text-foreground'>
                              Tổng thanh toán
                            </span>
                            <span className='text-2xl font-extrabold tabular-nums text-rose-600 dark:text-rose-400'>
                              {selectedTotals.selectedCount > 0
                                ? formatter.format(selectedTotals.grandTotal)
                                : formatter.format(0)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className='rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs leading-relaxed text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100'>
                        Giá chưa bao gồm phí vận chuyển và 8% VAT. Tiền cọc (nếu
                        có) sẽ hiển thị ở bước thanh toán VNPay.
                      </div>

                      <Magnetic intensity={0.3} range={100}>
                        <Button
                          type='button'
                          className='h-12 w-full rounded-xl bg-rose-600 text-base font-bold text-white shadow-lg hover:bg-rose-700 disabled:opacity-50 dark:bg-rose-500 dark:hover:bg-rose-600'
                          disabled={
                            isMutating ||
                            selectedTotals.selectedCount === 0 ||
                            !recipientName.trim() ||
                            !phone.trim() ||
                            createOrder.isPending ||
                            initiatePayment.isPending
                          }
                          onClick={handleProceedToRent}
                        >
                          {createOrder.isPending ||
                          initiatePayment.isPending ? (
                            <span className='flex items-center gap-2'>
                              <span className='size-4 animate-spin rounded-full border-2 border-white/30 border-t-white' />
                              Đang xử lý…
                            </span>
                          ) : (
                            'Tiến hành thuê'
                          )}
                        </Button>
                      </Magnetic>

                      <Button
                        variant='outline'
                        className='w-full rounded-xl border-rose-500/30'
                        disabled={isMutating}
                        render={<Link href='/' />}
                      >
                        Tiếp tục xem sản phẩm
                      </Button>
                    </div>
                  )}
                </SpotlightCard>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delivery info dialog */}
      <DeliveryInfoDialog
        open={deliveryDialogOpen}
        onOpenChange={setDeliveryDialogOpen}
        recipientName={recipientName}
        setRecipientName={setRecipientName}
        phone={phone}
        setPhone={setPhone}
        addressLine={addressLine}
        setAddressLine={setAddressLine}
        ward={ward}
        setWard={setWard}
        district={district}
        setDistrict={setDistrict}
        city={city}
        setCity={setCity}
        onConfirm={() => setDeliveryDialogOpen(false)}
      />

      {/* Policy consent dialog */}
      <PolicyConsentDialog
        open={policyDialogOpen}
        onOpenChange={setPolicyDialogOpen}
        onAllConsented={() => void handleCreateOrder()}
      />

      {/* Voucher picker dialog — per-line */}
      {voucherDialogLine &&
        (() => {
          // Tập hợp các code đang được dùng ở các dòng KHÁC (không phải dòng đang mở dialog)
          const usedByOtherLines = new Set(
            [...lineVouchers.entries()]
              .filter(([id]) => id !== voucherDialogLine.cartLineId)
              .map(([, code]) => code),
          );
          return (
            <VoucherLinePickerDialog
              open={voucherDialogOpen}
              onOpenChange={(o) => {
                setVoucherDialogOpen(o);
                if (!o) setVoucherDialogLine(null);
              }}
              lineRentalSubtotal={
                voucherDialogLine.dailyPrice *
                voucherDialogLine.quantity *
                voucherDialogLine.rentalDurationDays
              }
              lineRentalDays={voucherDialogLine.rentalDurationDays}
              appliedCode={
                lineVouchers.get(voucherDialogLine.cartLineId) ?? null
              }
              suggestedVouchers={voucherDialogLine.availableVouchers}
              productId={voucherDialogLine.productId}
              usedCodes={usedByOtherLines}
              onApply={(v) => {
                handleApplyLineVoucher(voucherDialogLine.cartLineId, v.code);
                setVoucherDialogLine(null);
                setVoucherDialogOpen(false);
              }}
              onClear={() =>
                handleClearLineVoucher(voucherDialogLine.cartLineId)
              }
            />
          );
        })()}
    </div>
  );
}
