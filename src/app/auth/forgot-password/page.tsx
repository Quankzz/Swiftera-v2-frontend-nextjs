'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AuthActionCard } from '@/components/auth/AuthActionCard';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const inputClassName =
  'h-auto border-none bg-zinc-100 px-4 py-2.5 text-[13px] text-zinc-800 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-[#fe1451]/30 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-400 dark:focus-visible:ring-[#fe2560]/40';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      setIsSubmitting(true);
      await forgotPassword(email);
      setSuccess('Đã gửi hướng dẫn đặt lại mật khẩu. Kiểm tra email của bạn.');
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi yêu cầu đặt lại mật khẩu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthActionCard
      title="Quên mật khẩu"
      description="Nhập email để nhận hướng dẫn hoặc mã đặt lại mật khẩu."
      footerLinks={[
        { href: '/auth/login', label: 'Quay lại đăng nhập' },
        { href: '/auth/resend-verification', label: 'Gửi lại mail xác thực' },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className={inputClassName}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-emerald-600">{success}</p>}

        <Button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="h-auto w-full bg-[#fe1451] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#ba264d]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Đang gửi
            </>
          ) : (
            'Gửi yêu cầu'
          )}
        </Button>

        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          Nếu backend yêu cầu mã OTP, bạn có thể nhập ở trang{' '}
          <Link href="/auth/reset-password" className="text-[#fe1451] hover:underline">
            đặt lại mật khẩu
          </Link>
          .
        </p>
      </form>
    </AuthActionCard>
  );
}
