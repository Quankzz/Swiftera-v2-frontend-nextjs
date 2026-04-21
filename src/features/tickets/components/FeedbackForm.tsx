'use client';

/**
 * FeedbackForm - Gửi yêu cầu hỗ trợ (contact ticket)
 *
 * Features:
 * - Tự động điền họ tên / email từ useAuth() nếu đã đăng nhập
 * - Chọn đơn thuê qua dialog (không phải nhập tay)
 * - Nội dung tin nhắn dùng Tiptap RichEditor
 * - Validate bằng react-hook-form + zod
 * - Hiển thị success card sau khi gửi thành công
 */

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CheckCircle2,
  ChevronRight,
  Loader2,
  Package,
  X,
  Search,
  HeadphonesIcon,
  CalendarDays,
  MapPin,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useCreateTicket } from '../hooks/useTickets';
import { getMyRentalOrders } from '@/features/rental-orders/api/rental-order.service';
import type { RentalOrderResponse } from '@/features/rental-orders/types';
import { STATUS_LABELS, STATUS_STYLES } from '@/features/rental-orders/types';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

// Lazy-load RichEditor để tránh SSR issues (Tiptap dùng browser APIs)
const RichEditor = dynamic(() => import('@/components/feedback/rich-editor'), {
  ssr: false,
});

// ─────────────────────────────────────────────────────────────────────────────
// Zod schema
// ─────────────────────────────────────────────────────────────────────────────

const schema = z.object({
  subject: z
    .string()
    .min(5, 'Tiêu đề tối thiểu 5 ký tự')
    .max(150, 'Tiêu đề tối đa 150 ký tự'),
  fullName: z.string().min(1, 'Vui lòng nhập họ tên').max(100),
  email: z.string().email('Email không hợp lệ').max(100),
  phone: z.string().optional(),
  attachmentUrl: z
    .string()
    .url('URL không hợp lệ')
    .optional()
    .or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

// ─── helpers ─────────────────────────────────────────────────────────────────

const vndFmt = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

function formatShortDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Order picker dialog
// ─────────────────────────────────────────────────────────────────────────────

interface OrderPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (order: RentalOrderResponse) => void;
}

function OrderPickerDialog({
  open,
  onClose,
  onSelect,
}: OrderPickerDialogProps) {
  const [orders, setOrders] = useState<RentalOrderResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchOrders = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await getMyRentalOrders({ page: pageNum, size: 10 });
      if (pageNum === 0) {
        setOrders(res.content);
      } else {
        setOrders((prev) => [...prev, ...res.content]);
      }
      setHasMore(res.meta.hasNext);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setSearch('');
      setPage(0);
      fetchOrders(0);
    }
  }, [open, fetchOrders]);

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.rentalOrderId.toLowerCase().includes(q) ||
      o.userAddress?.recipientName?.toLowerCase().includes(q) ||
      o.status?.toLowerCase().includes(q) ||
      o.rentalOrderLines?.some((l) =>
        l.productNameSnapshot?.toLowerCase().includes(q),
      )
    );
  });

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm'>
      <div className='bg-white dark:bg-surface-base w-full max-w-xl rounded-2xl shadow-xl flex flex-col max-h-[80vh]'>
        {/* Header */}
        <div className='flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-white/8'>
          <div className='flex items-center gap-2'>
            <Package size={18} className='text-theme-primary-start' />
            <h3 className='font-semibold text-gray-900 dark:text-white'>
              Chọn đơn thuê liên quan
            </h3>
          </div>
          <button
            onClick={onClose}
            className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/8 text-gray-500'
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className='px-5 py-3 border-b border-gray-100 dark:border-white/8'>
          <div className='relative'>
            <Search
              size={14}
              className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
            />
            <input
              type='text'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Tìm theo mã đơn, sản phẩm, tên người nhận...'
              className='w-full pl-8 pr-3 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary-start/40 dark:text-white'
            />
          </div>
        </div>

        {/* List */}
        <div className='overflow-y-auto flex-1'>
          {loading && orders.length === 0 ? (
            <div className='flex justify-center py-10'>
              <Loader2 size={20} className='animate-spin text-gray-400' />
            </div>
          ) : filtered.length === 0 ? (
            <div className='text-center py-10 text-sm text-gray-500 dark:text-gray-400'>
              Không tìm thấy đơn hàng nào
            </div>
          ) : (
            <ul className='divide-y divide-gray-100 dark:divide-white/8'>
              {filtered.map((order) => {
                const style = STATUS_STYLES[order.status];
                const productNames = order.rentalOrderLines
                  ?.map((l) => l.productNameSnapshot)
                  .filter(Boolean);
                const totalItems = order.rentalOrderLines?.length ?? 0;

                return (
                  <li key={order.rentalOrderId}>
                    <button
                      onClick={() => {
                        onSelect(order);
                        onClose();
                      }}
                      className='w-full text-left px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/5 flex items-start gap-3 transition-colors'
                    >
                      <div className='min-w-0 flex-1 space-y-1.5'>
                        {/* Row 1: Order ID + status badge */}
                        <div className='flex items-center gap-2 flex-wrap'>
                          <span className='text-sm font-semibold text-gray-900 dark:text-white font-mono'>
                            #{order.rentalOrderId.slice(0, 12)}…
                          </span>
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium',
                              style?.cls,
                            )}
                          >
                            <span
                              className={cn(
                                'inline-block h-1.5 w-1.5 rounded-full',
                                style?.dot,
                              )}
                            />
                            {STATUS_LABELS[order.status] ??
                              order.status.replace(/_/g, ' ')}
                          </span>
                        </div>

                        {/* Row 2: Product names */}
                        {productNames && productNames.length > 0 && (
                          <p className='text-xs text-gray-700 dark:text-gray-300 line-clamp-1'>
                            <Package
                              size={11}
                              className='inline-block mr-1 -mt-0.5 text-gray-400'
                            />
                            {productNames.slice(0, 2).join(', ')}
                            {productNames.length > 2 && (
                              <span className='text-gray-400'>
                                {' '}
                                +{productNames.length - 2} sản phẩm
                              </span>
                            )}
                            {totalItems > 0 && (
                              <span className='text-gray-400'>
                                {' '}
                                · {totalItems} mục
                              </span>
                            )}
                          </p>
                        )}

                        {/* Row 3: Meta info */}
                        <div className='flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-gray-500 dark:text-gray-400'>
                          {/* Recipient */}
                          {order.userAddress?.recipientName && (
                            <span>{order.userAddress.recipientName}</span>
                          )}
                          {/* Location */}
                          {(order.userAddress?.district ||
                            order.userAddress?.city) && (
                            <span className='flex items-center gap-0.5'>
                              <MapPin size={10} className='shrink-0' />
                              {[
                                order.userAddress.district,
                                order.userAddress.city,
                              ]
                                .filter(Boolean)
                                .join(', ')}
                            </span>
                          )}
                          {/* Order date */}
                          <span className='flex items-center gap-0.5'>
                            <CalendarDays size={10} className='shrink-0' />
                            {formatShortDate(order.placedAt)}
                          </span>
                          {/* Total */}
                          {order.totalPayableAmount > 0 && (
                            <span className='font-medium text-gray-600 dark:text-gray-300'>
                              {vndFmt.format(order.totalPayableAmount)}
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight
                        size={14}
                        className='text-gray-400 shrink-0 mt-1'
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {hasMore && !search && (
            <div className='px-5 py-3 border-t border-gray-100 dark:border-white/8'>
              <button
                onClick={() => {
                  const next = page + 1;
                  setPage(next);
                  fetchOrders(next);
                }}
                disabled={loading}
                className='w-full text-sm text-theme-primary-start dark:text-theme-primary-start hover:underline flex items-center justify-center gap-1 py-1'
              >
                {loading ? (
                  <Loader2 size={14} className='animate-spin' />
                ) : (
                  'Tải thêm'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main form
// ─────────────────────────────────────────────────────────────────────────────

export function FeedbackForm() {
  const { user } = useAuth();
  const { mutate, isPending, isSuccess } = useCreateTicket();

  const [messageHtml, setMessageHtml] = useState('');
  const [messageError, setMessageError] = useState('');
  const [selectedOrder, setSelectedOrder] =
    useState<RentalOrderResponse | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      subject: '',
      fullName: '',
      email: '',
      phone: '',
      attachmentUrl: '',
    },
  });

  // Auto-fill from auth when user is available
  useEffect(() => {
    if (user) {
      setValue('fullName', `${user.firstName} ${user.lastName}`.trim());
      setValue('email', user.email ?? '');
    }
  }, [user, setValue]);

  const onSubmit = (values: FormValues) => {
    if (
      !messageHtml ||
      messageHtml === '<p></p>' ||
      messageHtml.trim() === ''
    ) {
      setMessageError('Vui lòng nhập nội dung tin nhắn');
      return;
    }
    setMessageError('');

    mutate(
      {
        subject: values.subject,
        message: messageHtml,
        fullName: values.fullName || undefined,
        email: values.email || undefined,
        phone: values.phone || undefined,
        attachmentUrl: values.attachmentUrl || undefined,
        rentalOrderId: selectedOrder?.rentalOrderId,
      },
      {
        onSuccess: () => {
          reset();
          setMessageHtml('');
          setSelectedOrder(null);
        },
      },
    );
  };

  if (isSuccess) {
    return (
      <div className='rounded-2xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20 p-8 flex flex-col items-center text-center gap-4'>
        <div className='w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center'>
          <CheckCircle2
            size={28}
            className='text-green-600 dark:text-green-400'
          />
        </div>
        <div>
          <h2 className='text-xl font-bold text-green-800 dark:text-green-200'>
            Gửi yêu cầu thành công!
          </h2>
          <p className='mt-1 text-sm text-green-700 dark:text-green-300'>
            Chúng tôi sẽ phản hồi qua email trong vòng 24 giờ.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className='mt-2 text-sm text-green-700 dark:text-green-300 underline underline-offset-4'
        >
          Gửi yêu cầu khác
        </button>
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='rounded-2xl border border-gray-100 dark:border-white/8 bg-white dark:bg-black/20 p-6 md:p-8 space-y-5'
      >
        {/* ── Subject ───────────────────────────────────── */}
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>
            Tiêu đề <span className='text-red-500'>*</span>
          </label>
          <input
            {...register('subject')}
            placeholder='Mô tả ngắn gọn vấn đề của bạn…'
            className={cn(
              'w-full rounded-lg border px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2',
              errors.subject
                ? 'border-red-400 focus:ring-red-400/30'
                : 'border-gray-200 dark:border-white/10 focus:ring-theme-primary-start/30',
            )}
          />
          {errors.subject && (
            <p className='mt-1 text-xs text-red-500'>
              {errors.subject.message}
            </p>
          )}
        </div>

        {/* ── Contact info ──────────────────────────────── */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {/* Full name */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>
              Họ và tên <span className='text-red-500'>*</span>
            </label>
            <input
              {...register('fullName')}
              readOnly={!!user}
              placeholder='Nguyễn Văn A'
              className={cn(
                'w-full rounded-lg border px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2',
                user && 'opacity-70 cursor-default',
                errors.fullName
                  ? 'border-red-400 focus:ring-red-400/30'
                  : 'border-gray-200 dark:border-white/10 focus:ring-theme-primary-start/30',
              )}
            />
            {errors.fullName && (
              <p className='mt-1 text-xs text-red-500'>
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>
              Email <span className='text-red-500'>*</span>
            </label>
            <input
              {...register('email')}
              type='email'
              readOnly={!!user}
              placeholder='email@example.com'
              className={cn(
                'w-full rounded-lg border px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2',
                user && 'opacity-70 cursor-default',
                errors.email
                  ? 'border-red-400 focus:ring-red-400/30'
                  : 'border-gray-200 dark:border-white/10 focus:ring-theme-primary-start/30',
              )}
            />
            {errors.email && (
              <p className='mt-1 text-xs text-red-500'>
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {/* Phone */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>
              Số điện thoại
            </label>
            <input
              {...register('phone')}
              type='tel'
              placeholder='0901 234 567'
              className='w-full rounded-lg border border-gray-200 dark:border-white/10 px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-theme-primary-start/30'
            />
          </div>

          {/* Rental order picker */}
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>
              Đơn thuê liên quan{' '}
              <span className='text-gray-400 font-normal'>(tùy chọn)</span>
            </label>
            {selectedOrder ? (
              <div className='flex items-center gap-2 rounded-lg border border-theme-primary-start/30 dark:border-theme-primary-start/40 bg-theme-primary-start/5 dark:bg-theme-primary-start/10 px-3.5 py-2.5'>
                <Package
                  size={14}
                  className='text-theme-primary-start shrink-0'
                />
                <span className='text-sm text-theme-primary-start truncate flex-1'>
                  #{selectedOrder.rentalOrderId.slice(0, 16)}…
                </span>
                <button
                  type='button'
                  onClick={() => setSelectedOrder(null)}
                  className='text-theme-primary-start/60 hover:text-theme-primary-start shrink-0'
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type='button'
                onClick={() => setOrderDialogOpen(true)}
                disabled={!user}
                className={cn(
                  'w-full flex items-center justify-between rounded-lg border border-dashed px-3.5 py-2.5 text-sm transition-colors',
                  user
                    ? 'border-gray-300 dark:border-white/20 hover:border-theme-primary-start/60 dark:hover:border-theme-primary-start/40 text-gray-500 dark:text-gray-400 hover:text-theme-primary-start'
                    : 'border-gray-200 dark:border-white/10 text-gray-300 dark:text-gray-600 cursor-not-allowed',
                )}
              >
                <span className='flex items-center gap-2'>
                  <Package size={14} />
                  {user ? 'Chọn đơn hàng…' : 'Đăng nhập để chọn đơn hàng'}
                </span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ── Attachment URL ────────────────────────────── */}
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>
            Đường dẫn tệp đính kèm{' '}
            <span className='text-gray-400 font-normal'>(tùy chọn)</span>
          </label>
          <input
            {...register('attachmentUrl')}
            type='url'
            placeholder='https://drive.google.com/...'
            className={cn(
              'w-full rounded-lg border px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2',
              errors.attachmentUrl
                ? 'border-red-400 focus:ring-red-400/30'
                : 'border-gray-200 dark:border-white/10 focus:ring-theme-primary-start/30',
            )}
          />
          {errors.attachmentUrl && (
            <p className='mt-1 text-xs text-red-500'>
              {errors.attachmentUrl.message}
            </p>
          )}
        </div>

        {/* ── Message (Tiptap) ──────────────────────────── */}
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'>
            Nội dung tin nhắn <span className='text-red-500'>*</span>
          </label>
          <div
            className={cn(
              'rounded-lg border overflow-hidden',
              messageError
                ? 'border-red-400'
                : 'border-gray-200 dark:border-white/10',
            )}
          >
            <RichEditor
              placeholder='Mô tả chi tiết vấn đề của bạn…'
              minHeight='180px'
              onChange={(html) => {
                setMessageHtml(html);
                if (html && html !== '<p></p>') setMessageError('');
              }}
            />
          </div>
          {messageError && (
            <p className='mt-1 text-xs text-red-500'>{messageError}</p>
          )}
        </div>

        {/* ── Submit ────────────────────────────────────── */}
        <div className='pt-2'>
          <button
            type='submit'
            disabled={isPending}
            className='w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-theme-primary-start hover:opacity-90 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-all'
          >
            {isPending ? (
              <>
                <Loader2 size={16} className='animate-spin' />
                Đang gửi…
              </>
            ) : (
              <>
                <HeadphonesIcon size={16} />
                Gửi yêu cầu hỗ trợ
              </>
            )}
          </button>
        </div>
      </form>

      <OrderPickerDialog
        open={orderDialogOpen}
        onClose={() => setOrderDialogOpen(false)}
        onSelect={(order) => setSelectedOrder(order)}
      />
    </>
  );
}
