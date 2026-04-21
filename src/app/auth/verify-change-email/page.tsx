'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { AuthActionCard } from '@/components/auth/AuthActionCard';
import { userApi } from '@/api/userProfileApi';
import { getApiErrorMessage, getApiSuccessMessage } from '@/app/profile/utils';

function VerifyChangeEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token?.trim()) {
      setStatus('error');
      setMessage(
        'Liên kết không hợp lệ hoặc thiếu mã xác thực. Hãy mở lại đường link trong email.',
      );
      return;
    }

    let cancelled = false;

    const run = async () => {
      setStatus('loading');
      try {
        const res = await userApi.verifyChangeEmail({ token: token.trim() });
        if (cancelled) return;
        setMessage(
          getApiSuccessMessage(
            res.data,
            'Xác thực đổi email thành công.',
          ),
        );
        setStatus('success');
      } catch (err) {
        if (cancelled) return;
        setMessage(
          getApiErrorMessage(err, 'Không thể xác thực đổi email.'),
        );
        setStatus('error');
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AuthActionCard
      title='Xác thực đổi email'
      description='Liên kết được gửi tới email mới của bạn sau khi yêu cầu đổi địa chỉ.'
      footerLinks={[
        { href: '/auth/login', label: 'Đăng nhập' },
        { href: '/profile', label: 'Trang cá nhân' },
      ]}
    >
      <div className='space-y-4 text-center'>
        {status === 'loading' && (
          <div className='flex flex-col items-center gap-3 py-6 text-zinc-600 dark:text-zinc-400'>
            <Loader2 className='size-10 animate-spin text-[[var(--theme-primary-start,#0ea5e9)]]' />
            <p className='text-sm'>Đang xác thực, vui lòng đợi...</p>
          </div>
        )}

        {status === 'success' && (
          <div className='space-y-4 py-2'>
            <div className='flex justify-center'>
              <div className='rounded-full bg-emerald-100 p-3 dark:bg-emerald-500/20'>
                <CheckCircle2 className='size-10 text-emerald-600 dark:text-emerald-400' />
              </div>
            </div>
            <p className='text-sm text-zinc-700 dark:text-zinc-300'>{message}</p>
            <Link
              href='/auth/login'
              className='inline-flex h-auto w-full items-center justify-center rounded-lg bg-[[var(--theme-primary-start,#0ea5e9)]] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[[var(--theme-primary-end,#0369a1)]]'
            >
              Đăng nhập với email mới
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className='space-y-4 py-2'>
            <div className='flex justify-center'>
              <div className='rounded-full bg-red-100 p-3 dark:bg-red-500/20'>
                <XCircle className='size-10 text-red-600 dark:text-red-400' />
              </div>
            </div>
            <p className='text-sm text-red-600 dark:text-red-400'>{message}</p>
            <p className='text-xs text-zinc-500 dark:text-zinc-400'>
              Nếu bạn chưa đăng nhập, hãy đăng nhập rồi mở lại liên kết trong
              email, hoặc gửi lại yêu cầu đổi email từ trang cá nhân.
            </p>
            <Link
              href='/auth/login'
              className='inline-flex w-full items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800'
            >
              Đăng nhập
            </Link>
          </div>
        )}
      </div>
    </AuthActionCard>
  );
}

function VerifyChangeEmailFallback() {
  return (
    <AuthActionCard
      title='Xác thực đổi email'
      description='Đang tải...'
      footerLinks={[{ href: '/auth/login', label: 'Đăng nhập' }]}
    >
      <div className='flex justify-center py-8'>
        <Loader2 className='size-8 animate-spin text-[[var(--theme-primary-start,#0ea5e9)]]' />
      </div>
    </AuthActionCard>
  );
}

export default function VerifyChangeEmailPage() {
  return (
    <Suspense fallback={<VerifyChangeEmailFallback />}>
      <VerifyChangeEmailContent />
    </Suspense>
  );
}
