'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AuthActionCard } from '@/components/auth/AuthActionCard';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const inputClassName =
  'h-auto border-none bg-zinc-100 px-4 py-2.5 text-[13px] text-zinc-800 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-[#fe1451]/30 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-400 dark:focus-visible:ring-[#fe2560]/40';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const { resetPassword, isLoading } = useAuth();
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (!token) {
      setError('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
      return;
    }

    try {
      setIsSubmitting(true);
      await resetPassword({
        token,
        newPassword: password,
        confirmPassword,
      });
      setSuccess('Đặt lại mật khẩu thành công. Bạn có thể đăng nhập lại.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể đặt lại mật khẩu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthActionCard
      title="Đặt lại mật khẩu"
      description="Nhập mật khẩu mới để hoàn tất quá trình đặt lại mật khẩu."
      footerLinks={[
        { href: '/auth/login', label: 'Đăng nhập' },
        { href: '/auth/forgot-password', label: 'Gửi lại yêu cầu' },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!token && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
            Không tìm thấy `token` trong URL. Hãy mở lại link từ email.
          </p>
        )}
        <Input
          type="password"
          placeholder="Mật khẩu mới"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className={inputClassName}
        />
        <PasswordStrength password={password} />
        <Input
          type="password"
          placeholder="Xác nhận mật khẩu mới"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          className={cn(
            inputClassName,
            confirmPassword && password !== confirmPassword && 'ring-1 ring-red-400',
          )}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-emerald-600">{success}</p>}

        <Button
          type="submit"
          disabled={isSubmitting || isLoading || !token}
          className="h-auto w-full bg-[#fe1451] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#ba264d]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Đang cập nhật
            </>
          ) : (
            'Đặt lại mật khẩu'
          )}
        </Button>
      </form>
    </AuthActionCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
