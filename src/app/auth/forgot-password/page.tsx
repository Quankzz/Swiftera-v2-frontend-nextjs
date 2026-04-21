'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AuthActionCard } from '@/components/auth/AuthActionCard';
import { useAuth } from '@/hooks/useAuth';
import { parseErrorForForm } from '@/api/apiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const inputClassName =
  'h-auto border-none bg-zinc-100 px-4 py-2.5 text-[13px] text-zinc-800 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-[var(--auth-focus-ring,#0ea5e9)/30] dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-400 dark:focus-visible:ring-[var(--auth-focus-ring-dark,#38bdf8)/40]';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string }>({});
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setFieldErrors({});
    setSuccess('');

    try {
      setIsSubmitting(true);
      await forgotPassword(email);
      setSuccess('Đã gửi hướng dẫn đặt lại mật khẩu. Kiểm tra email của bạn.');
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      const { fieldErrors: mappedFieldErrors, formMessage } = parseErrorForForm(
        err,
        'Không thể gửi yêu cầu đặt lại mật khẩu',
      );

      setFieldErrors({ email: mappedFieldErrors.email });
      if (formMessage) {
        setError(formMessage);
        toast.error(formMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthActionCard
      title="Quên mật khẩu"
      description="Nhập email đã đăng ký tài khoản để nhận liên kết đặt lại mật khẩu qua email."
      footerLinks={[
        { href: '/auth/login', label: 'Quay lại đăng nhập' },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Email đã đăng ký"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setFieldErrors({ email: undefined });
          }}
          required
          className={`${inputClassName}${
            fieldErrors.email ? ' ring-1 ring-red-400' : ''
          }`}
        />
        {fieldErrors.email && (
          <p className="text-sm text-red-500">{fieldErrors.email}</p>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-emerald-600">{success}</p>}

        <Button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="h-auto w-full bg-[var(--theme-primary-start,#0ea5e9)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--theme-primary-end,#0369a1)]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Gửi liên kết
            </>
          ) : (
            'Gửi liên kết đặt lại'
          )}
        </Button>
      </form>
    </AuthActionCard>
  );
}
