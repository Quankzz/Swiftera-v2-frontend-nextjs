'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateReview } from '@/hooks/api/use-reviews';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Star, CheckCircle } from 'lucide-react';

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className='flex items-center gap-1' role='group' aria-label='Chọn số sao đánh giá'>
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < value;
        return (
          <button
            key={i}
            type='button'
            onClick={() => onChange(i + 1)}
            className='rounded transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer'
            aria-label={`${i + 1} sao`}
          >
            <svg
              viewBox='0 0 24 24'
              fill={filled ? 'currentColor' : 'none'}
              stroke='currentColor'
              strokeWidth={1.5}
              className={cn(
                'size-7',
                filled
                  ? 'text-amber-400 drop-shadow-sm'
                  : 'text-muted-foreground/30',
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

interface WriteReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  orderId: string;
  /** Called after successful submission and the success animation completes */
  onSuccess?: () => void;
}

export function WriteReviewDialog({
  open,
  onOpenChange,
  productId,
  productName,
  orderId,
  onSuccess,
}: WriteReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const createReview = useCreateReview({
    onSuccess: () => {
      toast.success('Đánh giá của bạn đã được gửi!');
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setRating(0);
        setContent('');
        onOpenChange(false);
        onSuccess?.();
      }, 2200);
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Không thể gửi đánh giá. Vui lòng thử lại.');
    },
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
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
    },
    [rating, content, createReview, orderId, productId],
  );

  const handleClose = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        setTimeout(() => {
          setShowSuccess(false);
          setRating(0);
          setContent('');
        }, 300);
      }
      onOpenChange(isOpen);
    },
    [onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-w-md gap-0 overflow-hidden p-0'>
        {showSuccess ? (
          /* ── Success State ── */
          <div className='flex flex-col items-center gap-4 px-8 py-12 text-center'>
            <div className='flex size-16 items-center justify-center rounded-full bg-blue-500/10'>
              <CheckCircle className='size-8 text-blue-500' />
            </div>
            <div>
              <h3 className='text-xl font-bold text-foreground'>Cảm ơn bạn đã đánh giá!</h3>
              <p className='mt-2 text-sm text-muted-foreground'>
                Đánh giá của bạn giúp cộng đồng thuê thiết bị tại Swiftera lựa chọn tốt hơn.
              </p>
            </div>
          </div>
        ) : (
          /* ── Form State ── */
          <form onSubmit={(e) => void handleSubmit(e)}>
            <DialogHeader className='border-b border-border/60 px-6 py-5'>
              <DialogTitle className='text-lg font-bold text-foreground'>
                Viết đánh giá sản phẩm
              </DialogTitle>
              <p className='mt-1 text-sm text-muted-foreground line-clamp-1'>
                {productName}
              </p>
            </DialogHeader>

            <div className='space-y-5 px-6 py-5'>
              {/* Star rating */}
              <div className='flex flex-col gap-2'>
                <label className='text-sm font-semibold text-foreground'>
                  Đánh giá của bạn <span className='text-red-500'>*</span>
                </label>
                <StarPicker value={rating} onChange={setRating} />
                {rating > 0 && (
                  <p className='text-xs text-muted-foreground'>
                    Bạn đã chọn {rating} / 5 sao
                  </p>
                )}
              </div>

              {/* Content */}
              <div className='flex flex-col gap-2'>
                <label htmlFor='review-content' className='text-sm font-semibold text-foreground'>
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
            </div>

            <div className='flex items-center justify-end gap-2 border-t border-border/60 px-6 py-4'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => handleClose(false)}
                className='rounded-xl'
              >
                Hủy
              </Button>
              <Button
                type='submit'
                size='sm'
                disabled={rating === 0 || createReview.isPending}
                className='rounded-xl bg-blue-600 hover:bg-blue-700'
              >
                {createReview.isPending ? (
                  <span className='mr-1.5 inline-block size-4 animate-spin rounded-full border-2 border-white/40 border-t-white' />
                ) : null}
                {createReview.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
