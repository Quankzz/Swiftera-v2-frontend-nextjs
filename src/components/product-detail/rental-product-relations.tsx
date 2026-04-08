'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import {
  ThumbsUp,
  Share2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Send,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  useProductReviewsQuery,
  useMyReviewForProductQuery,
  useCreateReview,
  useDeleteReview,
} from '@/hooks/api/use-reviews';
import { useRelatedProductsQuery } from '@/features/products/hooks/use-related-products';
import { toast } from 'sonner';
import type { ProductReviewResponse } from '@/api/reviews';
import { useAuthStore } from '@/stores/auth-store';

/* ─── Stars ─────────────────────────────────────────────────────────────── */

function ReviewRatingStars({
  rating,
  size = 'sm',
}: {
  rating: number;
  size?: 'sm' | 'lg';
}) {
  return (
    <div className='flex items-center gap-1'>
      {Array.from({ length: 5 }).map((_, index) => {
        const starFill = Math.min(10, Math.max(0, (rating - index) * 10));
        const starSize = size === 'lg' ? 'text-base sm:text-lg' : 'text-sm';
        return (
          <div
            key={index}
            className={`relative inline-block ${starSize}`}
            style={{
              width: '1em',
              height: '1em',
              fontSize: size === 'lg' ? '1em' : '0.875em',
            }}
          >
            <span className='absolute inset-0 leading-none text-muted-foreground/40'>
              ★
            </span>
            <span
              className='absolute inset-0 leading-none text-yellow-400 overflow-hidden'
              style={{ width: `${starFill * 10}%` }}
            >
              ★
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Một thẻ đánh giá ──────────────────────────────────────────────────── */

interface ReviewCardProps {
  review: ProductReviewResponse;
  /** userId đang đăng nhập — nếu trùng với review.userId thì hiện nút xoá */
  currentUserId?: string | null;
  onDeleteSuccess?: () => void;
}

function timeAgo(iso: string) {
  try {
    if (!iso) return '';

    // Parse format: "2026-04-05 11:50:55 AM" or "2026-04-07T12:54:17.797820609Z"
    let year: number,
      month: number,
      day: number,
      hours: number,
      minutes: number,
      seconds: number;

    if (iso.includes('T')) {
      // ISO format: 2026-04-07T12:54:17.797820609Z
      const parts = iso.split(/[^0-9]/);
      year = Number(parts[0]);
      month = Number(parts[1]);
      day = Number(parts[2]);
      hours = Number(parts[3]);
      minutes = Number(parts[4]);
      seconds = Number(parts[5]);
    } else {
      // Vietnamese format: "2026-04-05 11:50:55 AM"
      const match = iso.match(
        /^(\d{4})-(\d{2})-(\d{2}) (\d{1,2}):(\d{2}):(\d{2}) (AM|PM)$/,
      );
      if (!match) return iso;
      let hour12 = Number(match[4]);
      const ampm = match[7].toUpperCase();
      year = Number(match[1]);
      month = Number(match[2]);
      day = Number(match[3]);
      minutes = Number(match[5]);
      seconds = Number(match[6]);
      if (ampm === 'PM' && hour12 !== 12) hour12 += 12;
      else if (ampm === 'AM' && hour12 === 12) hour12 = 0;
      hours = hour12;
    }

    const date = new Date(year, month - 1, day, hours, minutes, seconds);
    if (isNaN(date.getTime())) return iso;

    const diff = Date.now() - date.getTime();
    const seconds2 = Math.floor(diff / 1000);
    if (seconds2 < 60) return 'Vừa xong';
    const minutes2 = Math.floor(seconds2 / 60);
    if (minutes2 < 60) return `${minutes2} phút trước`;
    const hours2 = Math.floor(minutes2 / 60);
    if (hours2 < 24) return `${hours2} giờ trước`;
    const days = Math.floor(hours2 / 24);
    if (days === 0) return 'Hôm nay';
    if (days === 1) return 'Hôm qua';
    if (days < 30) return `${days} ngày trước`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} tháng trước`;
    return `${Math.floor(months / 12)} năm trước`;
  } catch {
    return iso;
  }
}

function ReviewCard({
  review,
  currentUserId,
  onDeleteSuccess,
}: ReviewCardProps) {
  const deleteReview = useDeleteReview({
    onSuccess: () => {
      toast.success('Đánh giá đã được xóa.');
      onDeleteSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Xóa đánh giá thất bại.');
    },
  });

  const isOwnReview = currentUserId && review.userId === currentUserId;
  const authorName = review.userNickname
    ? `@${review.userNickname}`
    : review.userId.slice(0, 8).toUpperCase();

  return (
    <div className='border-b border-border/40 py-4 sm:py-5 last:border-0'>
      <div className='flex flex-col gap-3 sm:flex-row sm:gap-4'>
        <Avatar className='size-10 shrink-0'>
          <AvatarImage src='' alt={authorName} />
          <AvatarFallback className='bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300'>
            {authorName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className='flex-1'>
          <div className='flex flex-col gap-0.5 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-4 sm:text-sm'>
            <span className='font-medium text-foreground'>{authorName}</span>
            <span>{timeAgo(review.createdAt)}</span>
          </div>

          <div className='mt-2 flex items-center gap-2'>
            <ReviewRatingStars rating={review.rating} />
            <span className='text-sm font-medium text-foreground'>
              {review.rating === 5
                ? 'Xuất sắc'
                : review.rating === 4
                  ? 'Tốt'
                  : review.rating === 3
                    ? 'Bình thường'
                    : review.rating === 2
                      ? 'Kém'
                      : 'Rất kém'}
            </span>
          </div>

          {review.content && (
            <p className='mt-3 leading-relaxed text-foreground'>
              {review.content}
            </p>
          )}

          {review.sellerReply && (
            <div className='mt-3 rounded-lg border border-border bg-muted/40 p-3 dark:bg-muted/20 sm:p-4'>
              <div className='mb-1.5 flex items-center gap-2'>
                <Avatar className='size-6'>
                  <AvatarFallback className='bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300'>
                    S
                  </AvatarFallback>
                </Avatar>
                <span className='font-semibold text-foreground'>Swiftera</span>
              </div>
              <p className='leading-relaxed text-foreground'>
                {review.sellerReply}
              </p>
            </div>
          )}

          <div className='mt-3 flex flex-wrap items-center gap-2 sm:gap-4'>
            <Button
              variant='ghost'
              size='sm'
              className='h-8 text-muted-foreground sm:h-9'
            >
              <ThumbsUp className='mr-2 size-4' />
              Hữu ích ({review.helpfulCount})
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='h-8 text-muted-foreground sm:h-9'
            >
              <Share2 className='mr-2 size-4' />
              Chia sẻ
            </Button>
            {isOwnReview && (
              <Button
                variant='ghost'
                size='sm'
                className='ml-auto h-8 gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 sm:h-9'
                onClick={() => {
                  if (confirm('Bạn có chắc muốn xóa đánh giá này?')) {
                    deleteReview.mutate(review.productReviewId);
                  }
                }}
                disabled={deleteReview.isPending}
              >
                {deleteReview.isPending ? (
                  <Loader2 className='size-4 animate-spin' />
                ) : (
                  <Trash2 className='size-4' />
                )}
                Xóa
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Form viết đánh giá ─────────────────────────────────────────────── */

interface ReviewFormProps {
  productId: string;
  rentalOrderId: string;
  onSuccess?: () => void;
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className='flex items-center gap-1'>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type='button'
          onClick={() => onChange(star)}
          className='text-2xl transition-transform hover:scale-110'
        >
          <span
            className={
              star <= value ? 'text-yellow-400' : 'text-muted-foreground/30'
            }
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ productId, rentalOrderId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [expanded, setExpanded] = useState(false);

  const createReview = useCreateReview({
    onSuccess: () => {
      toast.success('Cảm ơn bạn! Đánh giá của bạn đã được gửi.');
      setContent('');
      setExpanded(false);
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err.message || 'Gửi đánh giá thất bại. Vui lòng thử lại.');
    },
  });

  function handleSubmit() {
    if (rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá.');
      return;
    }
    createReview.mutate({
      rentalOrderId,
      productId,
      rating,
      content: content.trim() || undefined,
    });
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className='w-full rounded-xl border-2 border-dashed border-rose-300 bg-rose-50 py-3 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-700 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-900/30'
      >
        Bạn đã thuê sản phẩm này — nhấn để viết đánh giá
      </button>
    );
  }

  return (
    <div className='rounded-xl border border-rose-300 bg-rose-50/60 p-4 dark:border-rose-700 dark:bg-rose-950/20 sm:p-5'>
      <p className='mb-3 text-sm font-semibold text-foreground'>
        Đánh giá của bạn
      </p>
      <div className='mb-4 flex items-center gap-3'>
        <span className='text-sm text-muted-foreground'>Số sao:</span>
        <StarPicker value={rating} onChange={setRating} />
        <span className='text-sm text-muted-foreground'>
          {rating === 5
            ? 'Xuất sắc'
            : rating === 4
              ? 'Tốt'
              : rating === 3
                ? 'Bình thường'
                : rating === 2
                  ? 'Kém'
                  : 'Rất kém'}
        </span>
      </div>
      <textarea
        rows={3}
        placeholder='Chia sẻ trải nghiệm của bạn với sản phẩm này (tùy chọn)...'
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className='mb-4 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200'
      />
      <div className='flex items-center justify-end gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setExpanded(false)}
          disabled={createReview.isPending}
        >
          Hủy
        </Button>
        <Button
          size='sm'
          className='gap-1.5 bg-rose-600 text-white hover:bg-rose-700'
          onClick={handleSubmit}
          disabled={createReview.isPending}
        >
          {createReview.isPending ? (
            <Loader2 className='size-4 animate-spin' />
          ) : (
            <Send className='size-4' />
          )}
          Gửi đánh giá
        </Button>
      </div>
    </div>
  );
}

/* ─── Reviews Section (dùng cho product detail page) ────────────────────── */

interface RentalReviewsSectionProps {
  productId: string;
  rating: number;
  reviewCount: number;
  /** userId của user đang đăng nhập — để check quyền viết review */
  currentUserId?: string | null;
  /** rentalOrderId đã hoàn thành của user này cho product này */
  userCompletedOrderId?: string | null;
}

const PAGE_SIZE = 5;
const RATING_FILTERS = [
  { id: '', label: 'Tất cả' },
  { id: '5', label: '5 sao' },
  { id: '4', label: '4 sao' },
  { id: '3', label: '3 sao' },
  { id: '2', label: '2 sao' },
  { id: '1', label: '1 sao' },
];

export function RentalReviewsSection({
  productId,
  rating,
  reviewCount,
  currentUserId,
  userCompletedOrderId,
}: RentalReviewsSectionProps) {
  const [page, setPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState('');

  const { data, isLoading, refetch } = useProductReviewsQuery(productId, {
    page,
    size: PAGE_SIZE,
  });

  // Kiểm tra user đã đánh giá sản phẩm này chưa
  const { data: myReview } = useMyReviewForProductQuery(
    productId,
    currentUserId ?? null,
  );

  // User được phép viết review: đã thuê (có order completed) + chưa đánh giá
  const canWriteReview = !!userCompletedOrderId && !myReview;

  const reviews = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div
      id='reviews'
      className='rounded-xl border border-border/60 bg-card p-4 font-sans ambient-glow sm:p-6'
    >
      <div className='mb-6 flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h2 className='text-lg font-bold tracking-tight text-foreground sm:text-xl'>
            Khách hàng đánh giá
          </h2>
          <p className='mt-1 text-sm text-muted-foreground'>
            ({reviewCount} đánh giá)
          </p>
        </div>

        {/* Average rating badge */}
        <div className='flex flex-wrap items-baseline gap-2'>
          <span className='text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl'>
            {rating.toFixed(1)}
          </span>
          <div className='flex flex-col gap-1'>
            <ReviewRatingStars rating={rating} size='lg' />
            <span className='text-xs text-muted-foreground'>
              {reviewCount} đánh giá
            </span>
          </div>
        </div>
      </div>

      {/* Form viết đánh giá — chỉ hiện khi user đã thuê và chưa đánh giá */}
      {canWriteReview && (
        <div className='mb-6'>
          <ReviewForm
            productId={productId}
            rentalOrderId={userCompletedOrderId!}
            onSuccess={refetch}
          />
        </div>
      )}

      {/* Filter chips */}
      <div className='mb-6 flex flex-wrap gap-2'>
        {RATING_FILTERS.map((f) => (
          <Button
            key={f.id || 'all'}
            variant={ratingFilter === f.id ? 'default' : 'outline'}
            size='sm'
            className={cn(
              'h-8 rounded-full px-3 text-xs sm:h-9 sm:px-4 sm:text-sm',
              ratingFilter === f.id
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : '',
            )}
            onClick={() => {
              setRatingFilter(f.id);
              setPage(1);
            }}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Reviews list */}
      {isLoading ? (
        <div className='space-y-4'>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className='flex gap-3'>
              <Skeleton className='size-10 shrink-0 rounded-full' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-3 w-32' />
                <Skeleton className='h-3 w-full' />
                <Skeleton className='h-3 w-48' />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className='py-10 text-center'>
          <p className='text-sm text-muted-foreground'>
            Chưa có đánh giá nào cho sản phẩm này.
          </p>
        </div>
      ) : (
        <div className='divide-y'>
          {reviews.map((review) => (
            <ReviewCard
              key={review.productReviewId}
              review={review}
              currentUserId={currentUserId}
              onDeleteSuccess={refetch}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className='mt-6'>
          <PaginationContent className='flex flex-wrap justify-center gap-y-2'>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={cn(page === 1 && 'pointer-events-none opacity-40')}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={page === i + 1}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={cn(
                  page === totalPages && 'pointer-events-none opacity-40',
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

/* ─── Sản phẩm liên quan ───────────────────────────────────────────────── */

interface ArrowProps {
  onClick?: () => void;
}

function SampleNextArrow(props: ArrowProps) {
  const { onClick } = props;
  return (
    <div
      className='absolute top-1/2 right-0 z-10 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-card shadow-md transition-colors hover:bg-muted/50 sm:right-[-12px] sm:size-10 sm:shadow-lg'
      onClick={onClick}
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'
        strokeWidth='2'
        stroke='currentColor'
        className='size-5 text-foreground'
      >
        <path strokeLinecap='round' strokeLinejoin='round' d='M9 5l7 7-7 7' />
      </svg>
    </div>
  );
}

function SamplePrevArrow(props: ArrowProps) {
  const { onClick } = props;
  return (
    <div
      className='absolute top-1/2 left-0 z-10 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-card shadow-md transition-colors hover:bg-muted/50 sm:left-[-12px] sm:size-10 sm:shadow-lg'
      onClick={onClick}
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'
        strokeWidth='2'
        stroke='currentColor'
        className='size-5 text-foreground'
      >
        <path strokeLinecap='round' strokeLinejoin='round' d='M15 5l-7 7 7 7' />
      </svg>
    </div>
  );
}

interface RentalRelatedProductsProps {
  currentProductId: string;
}

export function RentalRelatedProducts({
  currentProductId,
}: RentalRelatedProductsProps) {
  const {
    data: related = [],
    isLoading,
    isError,
  } = useRelatedProductsQuery(currentProductId);

  const n = related.length;
  const settings = {
    dots: false,
    infinite: n > 4,
    speed: 500,
    slidesToShow: Math.min(4, n),
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: Math.min(3, n) },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(2, n),
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
          arrows: false,
        },
      },
    ],
  };

  return (
    <div className='rounded-xl border border-border/60 bg-card p-4 font-sans ambient-glow sm:p-5'>
      <h2 className='mb-4 text-base font-bold tracking-tight text-foreground sm:mb-5 sm:text-lg'>
        Sản phẩm liên quan
      </h2>

      {isLoading ? (
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='space-y-2'>
              <Skeleton className='aspect-square w-full rounded-xl' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-3 w-2/3' />
            </div>
          ))}
        </div>
      ) : isError ? (
        <p className='py-6 text-center text-sm text-muted-foreground'>
          Không tải được danh sách sản phẩm liên quan. Vui lòng thử lại sau.
        </p>
      ) : related.length === 0 ? (
        <p className='py-6 text-center text-sm text-muted-foreground'>
          Chưa có sản phẩm gợi ý khác.
        </p>
      ) : (
        <div className='overflow-x-hidden px-1 sm:px-4'>
          <Slider {...settings} className='related-rental-slider'>
            {related.map((product) => (
              <div key={product.productId} className='px-2'>
                <Link
                  href={`/product/${product.productId}`}
                  className='block group'
                >
                  <div className='relative mb-3 aspect-square overflow-hidden rounded-xl bg-muted/40'>
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                      />
                    ) : (
                      <div className='flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground'>
                        Chưa có ảnh
                      </div>
                    )}
                    {product.discountPercent != null &&
                      product.discountPercent > 0 && (
                        <span className='absolute top-2 left-2 rounded bg-red-500 px-2 py-0.5 text-xs font-bold text-white'>
                          -{product.discountPercent}%
                        </span>
                      )}
                  </div>
                  <h3 className='mb-2 line-clamp-2 text-sm font-semibold text-foreground transition-colors group-hover:text-rose-600 dark:group-hover:text-rose-400'>
                    {product.name}
                  </h3>
                  <div className='mb-1 flex items-center gap-1'>
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-muted-foreground/25'}`}
                      >
                        ★
                      </span>
                    ))}
                    <span className='ml-1 text-xs text-muted-foreground'>
                      {product.rating > 0 ? product.rating.toFixed(1) : '—'}
                    </span>
                  </div>
                  <div className='flex items-baseline gap-2'>
                    <span className='text-base font-bold text-rose-600 dark:text-rose-400'>
                      {product.dailyPrice.toLocaleString('vi-VN')}₫
                    </span>
                    <span className='text-xs text-muted-foreground'>/ngày</span>
                  </div>
                  {product.oldDailyPrice != null &&
                    product.oldDailyPrice > product.dailyPrice && (
                      <span className='text-xs text-muted-foreground line-through'>
                        {product.oldDailyPrice.toLocaleString('vi-VN')}₫
                      </span>
                    )}
                </Link>
              </div>
            ))}
          </Slider>
        </div>
      )}
    </div>
  );
}
