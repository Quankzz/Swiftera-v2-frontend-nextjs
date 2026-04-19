'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  useProductReviewsQuery,
  useCreateReview,
  useDeleteReview,
  useMarkHelpfulReview,
} from '@/hooks/api/use-reviews';
import type { ProductReviewResponse } from '@/api/reviewsApi';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   REUSABLE HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function StarRating({
  value,
  onChange,
  size = 'md',
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: 'sm' | 'md' | 'lg';
}) {
  const ids = useMemo(() => Array.from({ length: 5 }, (_, i) => `star-${i}`), []);
  const map = { sm: 'size-4', md: 'size-5', lg: 'size-6' };
  return (
    <div className='flex items-center gap-0.5' role='group' aria-label='Đánh giá sao'>
      {ids.map((id, i) => {
        const filled = i < value;
        return (
          <button
            key={id}
            type='button'
            onClick={() => onChange?.(i + 1)}
            className={cn(
              'rounded transition-all duration-150',
              onChange
                ? 'cursor-pointer hover:scale-110 active:scale-95'
                : 'cursor-default',
              map[size],
            )}
            aria-label={`${i + 1} sao`}
            disabled={!onChange}
          >
            <svg
              viewBox='0 0 24 24'
              fill={filled ? 'currentColor' : 'none'}
              stroke='currentColor'
              strokeWidth={1.5}
              className={cn(
                map[size],
                filled
                  ? 'text-amber-400 drop-shadow-sm'
                  : 'text-muted-foreground/40',
              )}
            >
              <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

type DateCandidate =
  | string
  | number
  | Date
  | { seconds?: number; nanos?: number; nanoseconds?: number }
  | null
  | undefined;

function parseBackendDateString(value: string): Date | null {
  // Format from backend docs/examples: "2026-03-24 10:00:00 AM".
  const withMeridiem = value.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|SA|CH)$/i,
  );

  if (withMeridiem) {
    const year = Number.parseInt(withMeridiem[1], 10);
    const month = Number.parseInt(withMeridiem[2], 10) - 1;
    const day = Number.parseInt(withMeridiem[3], 10);
    let hour = Number.parseInt(withMeridiem[4], 10);
    const minute = Number.parseInt(withMeridiem[5], 10);
    const second = Number.parseInt(withMeridiem[6] ?? '0', 10);
    const token = withMeridiem[7].toUpperCase();

    const isPm = token === 'PM' || token === 'CH';
    const isAm = token === 'AM' || token === 'SA';

    if (isPm && hour < 12) hour += 12;
    if (isAm && hour === 12) hour = 0;

    const parsed = new Date(year, month, day, hour, minute, second);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const ymd = value.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?$/,
  );
  if (ymd) {
    const year = Number.parseInt(ymd[1], 10);
    const month = Number.parseInt(ymd[2], 10) - 1;
    const day = Number.parseInt(ymd[3], 10);
    const hour = Number.parseInt(ymd[4], 10);
    const minute = Number.parseInt(ymd[5], 10);
    const second = Number.parseInt(ymd[6] ?? '0', 10);

    const parsed = new Date(year, month, day, hour, minute, second);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

function parseDateCandidate(value: DateCandidate): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const parsedFromBackend = parseBackendDateString(trimmed);
    if (parsedFromBackend) return parsedFromBackend;

    const asNumber = Number(trimmed);
    if (!Number.isNaN(asNumber)) {
      const millis = Math.abs(asNumber) < 1e12 ? asNumber * 1000 : asNumber;
      const fromNumber = new Date(millis);
      if (!Number.isNaN(fromNumber.getTime())) return fromNumber;
    }

    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const millis = Math.abs(value) < 1e12 ? value * 1000 : value;
    const parsed = new Date(millis);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof value === 'object' && value !== null) {
    const seconds =
      typeof value.seconds === 'number'
        ? value.seconds
        : undefined;
    const nanos =
      typeof value.nanos === 'number'
        ? value.nanos
        : typeof value.nanoseconds === 'number'
          ? value.nanoseconds
          : 0;

    if (typeof seconds === 'number' && Number.isFinite(seconds)) {
      const millis = seconds * 1000 + Math.floor(nanos / 1_000_000);
      const parsed = new Date(millis);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
  }

  return null;
}

function toIsoDateOrEmpty(value: unknown): string {
  const parsed = parseDateCandidate(value as DateCandidate);
  return parsed ? parsed.toISOString() : '';
}

/** Hiển thị thời gian tương đối từ createdAt, fallback updatedAt khi cần. */
function formatRelativeTime(
  primaryDate?: unknown,
  fallbackDate?: unknown,
): string {
  const date =
    parseDateCandidate(primaryDate as DateCandidate) ??
    parseDateCandidate(fallbackDate as DateCandidate);
  if (!date) return 'Không rõ';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  const rtf = new Intl.RelativeTimeFormat('vi', { numeric: 'auto' });

  if (Math.abs(diffSec) < 60) return rtf.format(-diffSec, 'second');
  if (Math.abs(diffMin) < 60) return rtf.format(-diffMin, 'minute');
  if (Math.abs(diffHr) < 24) return rtf.format(-diffHr, 'hour');
  if (Math.abs(diffDay) < 30) return rtf.format(-diffDay, 'day');
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatTooltipTime(primaryDate?: unknown, fallbackDate?: unknown): string {
  const date =
    parseDateCandidate(primaryDate as DateCandidate) ??
    parseDateCandidate(fallbackDate as DateCandidate);
  if (!date) return '';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/* ═══════════════════════════════════════════════════════════════════════════
   SHARE MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

/* Share modal removed per request: UI and logic deleted. */

/* ═══════════════════════════════════════════════════════════════════════════
   REVIEW CARD
   ═══════════════════════════════════════════════════════════════════════════ */

function ReviewCard({
  review,
  currentUserId,
  highlighted,
  isHelpfulPending,
  onDelete,
  onMarkHelpful,
}: {
  review: ProductReviewResponse;
  currentUserId: string | null;
  highlighted?: boolean;
  isHelpfulPending?: boolean;
  onDelete: (reviewId: string) => void;
  onMarkHelpful: (reviewId: string) => void;
}) {
  const isOwner = currentUserId === review.userId;
  const helpfulCount = Math.max(
    0,
    review.helpfulCount + (isHelpfulPending ? 1 : 0),
  );

  return (
    <motion.div
      id={`review-${review.productReviewId}`}
      initial={highlighted ? false : undefined}
      animate={
        highlighted
          ? {
              boxShadow: [
                '0 0 0 0 rgba(251, 191, 36, 0)',
                '0 0 0 4px rgba(251, 191, 36, 0.3)',
                '0 0 0 2px rgba(251, 191, 36, 0.2)',
              ],
            }
          : undefined
      }
      transition={{ duration: 0.5 }}
      className={cn(
        'rounded-2xl border p-5 transition-all duration-500',
        highlighted
          ? 'border-amber-400/60 bg-amber-50/40 ring-2 ring-amber-300/50 dark:border-amber-600/50 dark:bg-amber-950/20 dark:ring-amber-700/40'
          : 'border-border/60 bg-card dark:bg-card/80',
      )}
    >
      {/* Header */}
      <div className='flex items-start justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-rose-400 to-rose-600 text-sm font-bold text-white shadow-sm'>
            {(review.userNickname ?? 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className='text-sm font-semibold text-foreground'>
              {review.userNickname ?? 'Người dùng'}
            </p>
            <StarRating value={review.rating} size='sm' />
          </div>
        </div>
        <div className='flex flex-col items-end gap-1.5'>
          <span
            className='text-xs text-muted-foreground'
            title={formatTooltipTime(review.createdAt, review.updatedAt) || undefined}
          >
            {formatRelativeTime(review.createdAt, review.updatedAt)}
          </span>
          {highlighted && (
            <Badge className='bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'>
              Đang xem
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      {review.content && (
        <p className='mt-4 text-sm leading-relaxed text-foreground'>
          {review.content}
        </p>
      )}

      {/* Staff reply */}
      {review.sellerReply && (
        <div className='mt-4 rounded-xl border border-emerald-200/60 bg-emerald-50/60 p-4 dark:border-emerald-800/50 dark:bg-emerald-950/20'>
          <div className='mb-2 flex items-center gap-2'>
            <div className='flex size-6 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50'>
              <svg
                viewBox='0 0 24 24'
                className='size-3.5 text-emerald-600 dark:text-emerald-400'
                fill='none'
                stroke='currentColor'
                strokeWidth={2}
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
              </svg>
            </div>
            <p className='text-xs font-semibold text-emerald-700 dark:text-emerald-400'>
              Phản hồi từ Swiftera
            </p>
          </div>
          <p className='text-sm leading-relaxed text-emerald-800 dark:text-emerald-200'>
            {review.sellerReply}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className='mt-4 flex items-center gap-2 border-t border-border/40 pt-4'>
        {/* Helpful */}
        <button
          type='button'
          onClick={() => onMarkHelpful(review.productReviewId)}
          disabled={isHelpfulPending}
          className={cn(
            'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all',
            isHelpfulPending
              ? 'bg-rose-50 text-rose-400 dark:bg-rose-950/30'
              : 'text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400',
          )}
        >
          {isHelpfulPending ? (
            <Loader2 className='size-3.5 animate-spin' />
          ) : (
            <ThumbsUp className='size-3.5' />
          )}
          <span>Hữu ích</span>
          {helpfulCount > 0 && (
            <span className={cn(isHelpfulPending ? 'text-rose-300' : 'text-rose-500')}>
              ({helpfulCount})
            </span>
          )}
        </button>

        {/* Share button removed per request */}

        {/* Delete (owner only) */}
        {isOwner && (
          <button
            type='button'
            onClick={() => onDelete(review.productReviewId)}
            className='ml-auto flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400'
          >
            Xóa
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   WRITE REVIEW FORM
   ═══════════════════════════════════════════════════════════════════════════ */

function WriteReviewForm({
  productId,
  orderId,
  onSuccess,
}: {
  productId: string;
  orderId: string;
  onSuccess: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const createReview = useCreateReview({ onSuccess });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá.');
      return;
    }
    createReview.mutate({
      rentalOrderId: orderId,
      productId,
      rating,
      content: content.trim() || undefined,
    });
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className='space-y-4 rounded-2xl border border-rose-200/50 bg-rose-50/30 p-5 dark:border-rose-800/50 dark:bg-rose-950/20'
    >
      <div>
        <label className='mb-2 block text-sm font-semibold text-foreground'>
          Đánh giá của bạn
        </label>
        <StarRating value={rating} onChange={setRating} size='lg' />
      </div>

      <div>
        <label
          htmlFor='review-content'
          className='mb-2 block text-sm font-semibold text-foreground'
        >
          Nhận xét (tùy chọn)
        </label>
        <Textarea
          id='review-content'
          placeholder='Chia sẻ trải nghiệm của bạn với sản phẩm này...'
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className='resize-none rounded-xl'
        />
      </div>

      <div className='flex items-center justify-end gap-2'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={onSuccess}
          className='rounded-xl'
        >
          Hủy
        </Button>
        <Button
          type='submit'
          size='sm'
          disabled={rating === 0 || createReview.isPending}
          className='rounded-xl bg-rose-600 hover:bg-rose-700'
        >
          {createReview.isPending ? (
            <Loader2 className='size-4 animate-spin' />
          ) : (
            'Gửi đánh giá'
          )}
        </Button>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   RENTAL REVIEWS SECTION
   ═══════════════════════════════════════════════════════════════════════════ */

type NormalizedReview = ProductReviewResponse;
type NormalizedReviewsData = {
  items: NormalizedReview[];
  totalPages: number;
  totalItems: number;
};

function normalizeReviewsData(
  data: unknown,
): NormalizedReviewsData | undefined {
  if (!data || typeof data !== 'object') return undefined;
  const d = data as Record<string, unknown>;

  const normalizeItems = (items: unknown[]): NormalizedReview[] => {
    return items.map((item) => {
      const review = item as ProductReviewResponse;
      const raw = item as Record<string, unknown>;

      const createdAt = toIsoDateOrEmpty(
        raw.createdAt ??
        raw.created_at ??
        raw.createdTime ??
        raw.createdDate,
      );
      const updatedAt = toIsoDateOrEmpty(
        raw.updatedAt ??
        raw.updated_at ??
        raw.modifiedAt ??
        raw.modifiedTime ??
        raw.updatedDate,
      );

      return {
        ...review,
        createdAt: createdAt || updatedAt,
        updatedAt: updatedAt || createdAt,
      };
    });
  };

  if (Array.isArray(d.items)) {
    return {
      items: normalizeItems(d.items),
      totalPages:
        typeof d.totalPages === 'number' && d.totalPages > 0
          ? d.totalPages
          : 1,
      totalItems: typeof d.totalItems === 'number' ? d.totalItems : 0,
    };
  }

  const meta = d.meta as Record<string, unknown> | undefined;
  const content = Array.isArray(d.content) ? d.content : [];
  return {
    items: normalizeItems(content),
    totalPages:
      typeof meta?.totalPages === 'number' ? (meta.totalPages as number) : 1,
    totalItems:
      typeof meta?.totalElements === 'number'
        ? (meta.totalElements as number)
        : 0,
  };
}

export function RentalReviewsSection({
  productId,
  rating,
  currentUserId,
  userCompletedOrderId,
}: {
  productId: string;
  rating: number;
  currentUserId: string | null;
  userCompletedOrderId: string | null;
}) {
  const deleteReview = useDeleteReview({
    onSuccess: () => toast.success('Đã xóa đánh giá.'),
    onError: (err) => toast.error(err.message || 'Không xóa được đánh giá.'),
  });
  const markHelpful = useMarkHelpfulReview({
    onSuccess: () => toast.success('Cảm ơn bạn đã đánh giá!'),
    onError: (err) => toast.error(err.message),
  });

  const [page, setPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const PAGE_SIZE = 5;
  const FILTER_FETCH_SIZE = 1000;
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [helpfulPendingId, setHelpfulPendingId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const deepLinkedReviewId = searchParams.get('review');
  const deepLinkScrolledIdRef = useRef<string | null>(null);

  const queryParams = useMemo(() => {
    return {
      page: 1,
      size: FILTER_FETCH_SIZE,
    };
  }, [FILTER_FETCH_SIZE]);

  const fetchReviews = useProductReviewsQuery(productId, queryParams);
  const normalizedData = useMemo(
    () => normalizeReviewsData(fetchReviews.data),
    [fetchReviews.data],
  );

  const allReviews = useMemo(
    () => normalizedData?.items ?? [],
    [normalizedData],
  );

  const filteredReviews = useMemo(() => {
    if (ratingFilter === null) return allReviews;
    return allReviews.filter((review) => review.rating === ratingFilter);
  }, [allReviews, ratingFilter]);

  const totalElements = filteredReviews.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const deepLinkedReviewPage = useMemo(() => {
    if (!deepLinkedReviewId) return null;
    const index = filteredReviews.findIndex(
      (review) => review.productReviewId === deepLinkedReviewId,
    );
    if (index < 0) return null;
    return Math.floor(index / PAGE_SIZE) + 1;
  }, [deepLinkedReviewId, filteredReviews]);

  const effectivePage = Math.min(
    Math.max(deepLinkedReviewPage ?? safePage, 1),
    totalPages,
  );

  const visibleReviews = useMemo(() => {
    const start = (effectivePage - 1) * PAGE_SIZE;
    return filteredReviews.slice(start, start + PAGE_SIZE);
  }, [effectivePage, filteredReviews]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!deepLinkedReviewId) {
      deepLinkScrolledIdRef.current = null;
      return;
    }
    if (deepLinkScrolledIdRef.current === deepLinkedReviewId) return;

    const isVisible = visibleReviews.some(
      (review) => review.productReviewId === deepLinkedReviewId,
    );
    if (!isVisible) return;

    const frame = window.requestAnimationFrame(() => {
      const element = document.getElementById(`review-${deepLinkedReviewId}`);
      if (!element) return;
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      deepLinkScrolledIdRef.current = deepLinkedReviewId;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [deepLinkedReviewId, visibleReviews]);

  const isLoading = fetchReviews.isLoading && allReviews.length === 0;
  const isFetching = fetchReviews.isFetching;

  const clearDeepLinkParam = useCallback(() => {
    if (typeof window === 'undefined') return;
    const currentUrl = new URL(window.location.href);
    if (!currentUrl.searchParams.has('review')) return;
    currentUrl.searchParams.delete('review');
    window.history.replaceState(
      {},
      '',
      `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`,
    );
  }, []);

  // Optimistic helpful update
  function handleMarkHelpful(reviewId: string) {
    if (helpfulPendingId) return;
    setHelpfulPendingId(reviewId);
    markHelpful.mutate(reviewId, {
      onSettled: () => setHelpfulPendingId(null),
    });
  }

  const handleDelete = useCallback(
    (reviewId: string) => {
      if (!confirm('Xóa đánh giá này?')) return;
      deleteReview.mutate(reviewId);
    },
    [deleteReview],
  );

  // Share functionality removed per request.

  const RATING_OPTIONS: { label: string; value: number | null }[] = [
    { label: 'Tất cả', value: null },
    { label: '5 sao', value: 5 },
    { label: '4 sao', value: 4 },
    { label: '3 sao', value: 3 },
    { label: '2 sao', value: 2 },
    { label: '1 sao', value: 1 },
  ];

  return (
    <div>
      {/* Header */}
      <div className='mb-5 flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h2 className='text-xl font-bold text-foreground'>Đánh giá sản phẩm</h2>
          <div className='mt-1.5 flex items-center gap-3'>
            <StarRating value={Math.round(rating)} size='sm' />
            <span className='text-sm font-medium text-foreground'>
              {rating > 0 ? rating.toFixed(1) : 'Chưa có'}
            </span>
            {totalElements > 0 && (
              <span className='text-sm text-muted-foreground'>
                ({totalElements} đánh giá)
              </span>
            )}
          </div>

          {/* Rating filter */}
          <div className='mt-3 flex flex-wrap gap-1.5'>
            {RATING_OPTIONS.map((opt) => (
              <button
                key={String(opt.value)}
                type='button'
                onClick={() => {
                  clearDeepLinkParam();
                  setPage(1);
                  setRatingFilter(opt.value);
                }}
                className={cn(
                  'flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-all',
                  ratingFilter === opt.value
                    ? 'border-rose-400/60 bg-rose-50 text-rose-700 dark:border-rose-600/50 dark:bg-rose-950/30 dark:text-rose-300'
                    : 'border-border/60 bg-muted/30 text-muted-foreground hover:border-rose-300/40 hover:bg-rose-50/40 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-400',
                )}
              >
                {opt.value !== null && (
                  <Star className='size-3 text-amber-400' fill='currentColor' />
                )}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {userCompletedOrderId && !showWriteForm && (
          <Button
            size='sm'
            onClick={() => setShowWriteForm(true)}
            className='rounded-xl bg-rose-600 hover:bg-rose-700'
          >
            <MessageSquare className='size-4' />
            Viết đánh giá
          </Button>
        )}
      </div>

      {/* Write form */}
      <AnimatePresence>
        {showWriteForm && userCompletedOrderId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='overflow-hidden'
          >
            <WriteReviewForm
              productId={productId}
              orderId={userCompletedOrderId}
              onSuccess={() => setShowWriteForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review list */}
      <div className='mt-4 space-y-3'>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className='space-y-2 rounded-2xl border border-border/60 p-5'
            >
              <div className='flex items-center gap-3'>
                <Skeleton className='size-10 rounded-full' />
                <div className='space-y-1.5'>
                  <Skeleton className='h-4 w-28' />
                  <Skeleton className='h-3 w-20' />
                </div>
              </div>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-3/4' />
            </div>
          ))
        ) : filteredReviews.length === 0 ? (
          <div className='rounded-2xl border border-dashed border-border/80 bg-muted/20 py-12 text-center'>
            <Star className='mx-auto size-10 text-muted-foreground/40' />
            <p className='mt-3 font-medium text-muted-foreground'>
              {ratingFilter !== null
                ? `Không có đánh giá ${ratingFilter} sao nào.`
                : 'Chưa có đánh giá nào.'}
            </p>
            {userCompletedOrderId && (
              <p className='mt-1 text-sm text-muted-foreground'>
                Hãy là người đầu tiên đánh giá sản phẩm này!
              </p>
            )}
          </div>
        ) : (
          visibleReviews.map((review) => (
            <ReviewCard
              key={review.productReviewId}
              review={review}
              currentUserId={currentUserId}
              highlighted={deepLinkedReviewId === review.productReviewId}
              isHelpfulPending={helpfulPendingId === review.productReviewId}
              onDelete={handleDelete}
              onMarkHelpful={handleMarkHelpful}
            />
          ))
        )}
      </div>

      {/* Pagination / Load more */}
      {!isLoading && (
        <>
          {totalPages > 1 && (
            <div className='mt-5 flex items-center justify-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  clearDeepLinkParam();
                  setPage((currentPage) => Math.max(1, currentPage - 1));
                }}
                disabled={effectivePage === 1 || isFetching}
                className='rounded-xl'
              >
                <ChevronUp className='size-4 rotate-90' />
              </Button>
              <span className='px-3 text-sm text-muted-foreground'>
                {effectivePage} / {totalPages}
              </span>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  clearDeepLinkParam();
                  setPage((currentPage) => Math.min(totalPages, currentPage + 1));
                }}
                disabled={effectivePage >= totalPages || isFetching}
                className='rounded-xl'
              >
                <ChevronDown className='size-4 rotate-90' />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Share modal removed per request */}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   RENTAL RELATED PRODUCTS
   ═══════════════════════════════════════════════════════════════════════════ */

function RelatedProductSkeleton() {
  return (
    <div className='overflow-hidden rounded-xl border border-border/60'>
      <Skeleton className='aspect-square w-full' />
      <div className='space-y-2 p-3'>
        <Skeleton className='h-4 w-3/4' />
        <Skeleton className='h-4 w-1/2' />
      </div>
    </div>
  );
}

export function RentalRelatedProducts({
  currentProductId,
}: {
  currentProductId: string;
}) {
  const [products] = useState<never[]>([]);

  if (products.length === 0) return null;

  return (
    <div>
      <h2 className='mb-4 text-xl font-bold text-foreground'>
        Sản phẩm liên quan
      </h2>
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
        {products.map((product) => (
          <Link
            key={(product as { productId: string }).productId}
            href={`/product/${(product as { productId: string }).productId}`}
            className='group overflow-hidden rounded-xl border border-border/60 bg-card transition-shadow hover:shadow-md dark:bg-card/80'
          >
            <div className='relative aspect-square bg-muted'>
              {/* <Image src={...} fill className='object-cover' /> */}
            </div>
            <div className='p-3'>
              <p className='line-clamp-2 text-sm font-medium text-foreground group-hover:text-rose-600 dark:group-hover:text-rose-400'>
                {String((product as { name: string }).name ?? '')}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
