'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  ShoppingBag,
  ArrowRight,
  Copy,
  Check,
  Clock,
  RefreshCw,
  Headphones,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* ─── Confetti particle (CSS-only, no external lib) ─────────────────────── */

const CONFETTI_COLORS = [
  'bg-rose-400',
  'bg-orange-400',
  'bg-amber-400',
  'bg-emerald-400',
  'bg-sky-400',
  'bg-violet-400',
  'bg-pink-400',
];

type ConfettiParticle = {
  color: string;
  left: string;
  delay: string;
  duration: string;
  size: string;
  rotate: string;
};

function Confetti() {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 32 }, (_, i) => ({
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        left: `${Math.random() * 100}%`,
        delay: `${(Math.random() * 1.2).toFixed(2)}s`,
        duration: `${(1.8 + Math.random() * 1.4).toFixed(2)}s`,
        size: Math.random() > 0.5 ? 'size-2' : 'size-1.5',
        rotate: Math.random() > 0.5 ? 'rotate-45' : 'rotate-12',
      })),
    );
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className='pointer-events-none fixed inset-0 z-50 overflow-hidden'>
      {particles.map((p, i) => (
        <span
          key={i}
          className={cn(
            'absolute top-0 rounded-sm opacity-0',
            p.color,
            p.size,
            p.rotate,
          )}
          style={{
            left: p.left,
            animationName: 'confetti-fall',
            animationDuration: p.duration,
            animationDelay: p.delay,
            animationFillMode: 'forwards',
            animationTimingFunction: 'ease-in',
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          80%  { opacity: 0.9; }
          100% { transform: translateY(100dvh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ─── Countdown hook ─────────────────────────────────────────────────────── */

function useCountdown(seconds: number, active: boolean) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (!active) return;
    if (remaining <= 0) return;
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, active]);
  return remaining;
}

/* ─── Copy to clipboard ──────────────────────────────────────────────────── */

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    void navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      type='button'
      onClick={handleCopy}
      className='ml-1 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
      aria-label='Sao chép mã giao dịch'
    >
      {copied ? (
        <Check className='size-3 text-emerald-500' />
      ) : (
        <Copy className='size-3' />
      )}
      {copied ? 'Đã sao chép' : 'Sao chép'}
    </button>
  );
}

/* ─── Main result content ─────────────────────────────────────────────────── */

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success') === 'true';
  const txnRef = searchParams.get('txnRef') ?? '';
  const responseCode = searchParams.get('vnp_ResponseCode') ?? '';
  const cancelRef = useRef(false);

  const countdown = useCountdown(6, success);
  const [showConfetti, setShowConfetti] = useState(success);

  useEffect(() => {
    if (!success) return;
    // Tắt confetti sau 3 giây
    const t = setTimeout(() => {
      if (!cancelRef.current) setShowConfetti(false);
    }, 3000);
    return () => {
      cancelRef.current = true;
      clearTimeout(t);
    };
  }, [success]);

  // Auto-redirect sau 6 giây nếu thành công
  useEffect(() => {
    if (!success || countdown > 0) return;
    window.location.href = '/rental-orders';
  }, [success, countdown]);

  const fmt = new Intl.NumberFormat('vi-VN');

  return (
    <>
      {success && showConfetti && <Confetti />}

      <div className='relative min-h-screen overflow-x-hidden bg-white dark:bg-surface-base'>
        {/* Background decoration */}
        <div
          className={cn(
            'pointer-events-none absolute inset-0 opacity-30 dark:opacity-10',
            success
              ? 'bg-[radial-gradient(ellipse_at_top,#fecdd3_0%,transparent_65%)]'
              : 'bg-[radial-gradient(ellipse_at_top,#fecaca_0%,transparent_65%)]',
          )}
        />

        <div className='relative mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 py-16'>
          {/* Card */}
          <div className='w-full overflow-hidden rounded-3xl border border-border/60 bg-card/95 shadow-2xl shadow-black/5 backdrop-blur-sm dark:bg-card/80'>
            {/* Status strip */}
            <div
              className={cn(
                'h-1.5 w-full',
                success
                  ? 'bg-linear-to-r from-emerald-400 via-green-400 to-emerald-500'
                  : 'bg-linear-to-r from-red-400 via-rose-400 to-red-500',
              )}
            />

            <div className='px-6 py-8 sm:px-8'>
              {/* Icon */}
              <div className='mb-6 flex flex-col items-center gap-4'>
                <div
                  className={cn(
                    'flex size-20 items-center justify-center rounded-full',
                    success
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400',
                  )}
                  style={{
                    animation:
                      'icon-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
                  }}
                >
                  {success ? (
                    <CheckCircle2 className='size-10' strokeWidth={1.8} />
                  ) : (
                    <XCircle className='size-10' strokeWidth={1.8} />
                  )}
                </div>

                <div className='text-center'>
                  <h1 className='text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl'>
                    {success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
                  </h1>
                  <p className='mt-1.5 text-sm text-muted-foreground'>
                    {success
                      ? 'Đơn thuê của bạn đã được xác nhận và đang được xử lý.'
                      : 'Giao dịch không được hoàn tất. Vui lòng thử lại hoặc liên hệ hỗ trợ.'}
                  </p>
                </div>
              </div>

              {/* Transaction details */}
              {txnRef && (
                <div className='mb-6 rounded-2xl border border-border/60 bg-muted/30 p-4 dark:bg-muted/20'>
                  <div className='flex items-center justify-between gap-2'>
                    <span className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                      Mã giao dịch
                    </span>
                    <CopyButton value={txnRef} />
                  </div>
                  <p className='mt-1 font-mono text-base font-semibold tracking-wider text-foreground'>
                    {txnRef}
                  </p>

                  {/* VNPay response code nếu thất bại */}
                  {!success && responseCode && (
                    <p className='mt-2 text-xs text-red-500 dark:text-red-400'>
                      Mã lỗi VNPay: {responseCode}
                    </p>
                  )}
                </div>
              )}

              {/* Success: countdown redirect */}
              {success && (
                <div className='mb-5 flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-2.5 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300'>
                  <Clock className='size-4 shrink-0' />
                  <span>
                    Tự động chuyển đến đơn hàng sau{' '}
                    <span className='font-bold tabular-nums'>{countdown}s</span>
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className='space-y-3'>
                {success ? (
                  <>
                    <Button
                      className='h-12 w-full gap-2 rounded-xl bg-rose-600 text-base font-bold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600'
                      render={<Link href='/rental-orders' />}
                    >
                      Xem đơn hàng của tôi
                      <ArrowRight className='size-4' />
                    </Button>
                    <Button
                      variant='outline'
                      className='h-11 w-full gap-2 rounded-xl border-border/60'
                      render={<Link href='/' />}
                    >
                      <ShoppingBag className='size-4' />
                      Tiếp tục mua sắm
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant='outline'
                      className='h-12 w-full gap-2 rounded-xl border-rose-500/30 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30'
                      render={<Link href='/rental-orders' />}
                    >
                      <RefreshCw className='size-4' />
                      Xem lại đơn hàng &amp; thử thanh toán lại
                    </Button>
                    <Button
                      variant='outline'
                      className='h-11 w-full gap-2 rounded-xl border-border/60'
                      render={<Link href='/cart' />}
                    >
                      <ShoppingBag className='size-4' />
                      Quay lại giỏ hàng
                    </Button>
                    <Button
                      variant='ghost'
                      className='h-10 w-full gap-2 rounded-xl text-sm text-muted-foreground hover:text-foreground'
                      render={<Link href='/feedback' />}
                    >
                      <Headphones className='size-4' />
                      Liên hệ hỗ trợ
                    </Button>
                  </>
                )}
              </div>

              {/* Footer note */}
              <p className='mt-5 text-center text-xs text-muted-foreground/70'>
                {success
                  ? 'Giữ mã giao dịch để tra cứu khi cần. Đơn hàng sẽ được xử lý trong vòng 24 giờ.'
                  : 'Nếu tiền đã bị trừ nhưng thanh toán thất bại, vui lòng liên hệ hỗ trợ kèm mã giao dịch.'}
              </p>
            </div>
          </div>

          {/* Go home link */}
          <Link
            href='/'
            className='mt-6 text-sm text-muted-foreground transition-colors hover:text-foreground'
          >
            ← Về trang chủ
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes icon-pop {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </>
  );
}

/* ─── Page export (requires Suspense for useSearchParams) ─────────────────── */

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center'>
          <div className='size-8 animate-spin rounded-full border-4 border-rose-600/30 border-t-rose-600' />
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
