'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { AuthActionCard } from '@/components/auth/AuthActionCard';
import { authApi } from '@/api/authApi';
import { getApiErrorMessage, getApiSuccessMessage } from '@/app/profile/utils';

function VerifyActiveAccountContent() {
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
        'Liên kết không hợp lệ hoặc thiếu token. Vui lòng kiểm tra lại email.',
      );
      return;
    }

    let cancelled = false;

    const verifyToken = async () => {
      setStatus('loading');
      try {
        const res = await authApi.verifyActiveAccount({ token: token.trim() });
        if (cancelled) return;
        setMessage(
          getApiSuccessMessage(
            res.data,
            'Xác thực tài khoản thành công. Bạn có thể đăng nhập.',
          ),
        );
        setStatus('success');
      } catch (error) {
        if (cancelled) return;
        setMessage(getApiErrorMessage(error, 'Không thể xác thực tài khoản.'));
        setStatus('error');
      }
    };

    void verifyToken();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AuthActionCard
      title='Kích hoạt tài khoản'
      description='Hệ thống đang xác thực liên kết kích hoạt từ email của bạn.'
      footerLinks={[{ href: '/auth/login', label: 'Đăng nhập' }]}
    >
      <div className='space-y-4 text-center'>
        {status === 'loading' && (
          <div className='flex flex-col items-center gap-3 py-6 text-zinc-600 dark:text-zinc-400'>
            <Loader2 className='size-10 animate-spin text-[#fe1451]' />
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
            <p className='text-sm text-zinc-700 dark:text-zinc-300'>
              {message}
            </p>
            <Link
              href='/auth/login'
              className='inline-flex h-auto w-full items-center justify-center rounded-lg bg-[#fe1451] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#ba264d]'
            >
              Đăng nhập ngay
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
              Liên kết có thể đã hết hạn. Bạn có thể yêu cầu gửi lại email xác
              thực.
            </p>
            <Link
              href='/auth/resend-verification'
              className='inline-flex w-full items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800'
            >
              Gửi lại email xác thực
            </Link>
          </div>
        )}
      </div>
    </AuthActionCard>
  );
}

function VerifyActiveAccountFallback() {
  return (
    <AuthActionCard
      title='Kích hoạt tài khoản'
      description='Đang tải...'
      footerLinks={[{ href: '/auth/login', label: 'Đăng nhập' }]}
    >
      <div className='flex justify-center py-8'>
        <Loader2 className='size-8 animate-spin text-[#fe1451]' />
      </div>
    </AuthActionCard>
  );
}

export default function VerifyActiveAccountPage() {
  return (
    <Suspense fallback={<VerifyActiveAccountFallback />}>
      <VerifyActiveAccountContent />
    </Suspense>
  );
}
