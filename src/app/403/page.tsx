'use client';

import Link from 'next/link';
import { ShieldOff, Home, ArrowLeft } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-linear-to-br from-slate-50 via-red-50/30 to-slate-100 px-4 dark:from-surface-base dark:via-red-950/10 dark:to-surface-base'>
      {/* Decorative blur blobs */}
      <div className='pointer-events-none absolute -left-40 -top-40 size-128 rounded-full bg-red-200/30 blur-3xl dark:bg-red-900/15' />
      <div className='pointer-events-none absolute -bottom-40 -right-40 size-128 rounded-full bg-orange-200/20 blur-3xl dark:bg-orange-900/10' />

      <div className='relative z-10 flex w-full max-w-md flex-col items-center text-center'>
        {/* Icon badge */}
        <div className='mb-6 flex size-24 items-center justify-center rounded-3xl border border-red-200/60 bg-white/80 shadow-xl shadow-red-500/10 backdrop-blur-sm dark:border-red-800/40 dark:bg-surface-card/80'>
          <ShieldOff
            className='size-12 text-red-500 dark:text-red-400'
            strokeWidth={1.5}
          />
        </div>

        {/* Status code */}
        <p className='text-[6rem] font-black leading-none tracking-tighter text-red-500/20 dark:text-red-400/15 select-none'>
          403
        </p>

        {/* Title */}
        <h1 className='-mt-4 text-2xl font-black tracking-tight text-foreground sm:text-3xl'>
          Truy cập bị từ chối
        </h1>

        {/* Subtitle */}
        <p className='mt-3 max-w-sm text-sm text-muted-foreground sm:text-base'>
          Bạn không có quyền truy cập vào khu vực này. Trang này chỉ dành cho
          người dùng có vai trò phù hợp.
        </p>

        {/* Divider */}
        <div className='my-6 h-px w-full max-w-xs bg-linear-to-r from-transparent via-border to-transparent' />

        {/* Actions */}
        <div className='flex flex-wrap justify-center gap-3'>
          <Link
            href='/'
            className='inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-500/25 transition-all hover:bg-red-600 hover:shadow-red-500/40 active:scale-95 dark:bg-red-600 dark:hover:bg-red-500'
          >
            <Home className='size-4' />
            Trang chủ
          </Link>
          <button
            type='button'
            onClick={() => window.history.back()}
            className='inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-muted/60 active:scale-95'
          >
            <ArrowLeft className='size-4' />
            Quay lại
          </button>
        </div>

        {/* Help text */}
        <p className='mt-8 text-xs text-muted-foreground/70'>
          Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ quản trị viên.
        </p>
      </div>
    </div>
  );
}
