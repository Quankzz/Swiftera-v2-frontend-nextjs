'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AuthActionCard } from '@/components/auth/AuthActionCard';
import { useAuth } from '@/hooks/useAuth';
import { parseErrorForForm } from '@/api/apiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const inputClassName =
  'h-auto border-none bg-zinc-100 px-4 py-2.5 text-[13px] text-zinc-800 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-[#fe1451]/30 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-400 dark:focus-visible:ring-[#fe2560]/40';

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const { verifyEmail, isLoading } = useAuth();
  const initialEmail = useMemo(() => searchParams.get('email') ?? '', [searchParams]);
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; code?: string }>({});
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setFieldErrors({});
    setSuccess('');

    try {
      setIsSubmitting(true);
      await verifyEmail({ email, code });
      setSuccess('Xác thực email thành công. Bạn có thể đăng nhập.');
    } catch (err) {
      const { fieldErrors: mappedFieldErrors, formMessage } = parseErrorForForm(
        err,
        'Không thể xác thực email',
      );

      setFieldErrors({
        email: mappedFieldErrors.email,
        code: mappedFieldErrors.code,
      });

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
      title="Xác thực email"
      description="Nhập email và mã xác thực được gửi từ hệ thống."
      footerLinks={[
        { href: '/auth/login', label: 'Đăng nhập' },
        { href: '/auth/resend-verification', label: 'Gửi lại mã' },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setFieldErrors((prev) => ({ ...prev, email: undefined }));
          }}
          required
          className={`${inputClassName}${
            fieldErrors.email ? ' ring-1 ring-red-400' : ''
          }`}
        />
        {fieldErrors.email && (
          <p className="text-sm text-red-500">{fieldErrors.email}</p>
        )}
        <Input
          type="text"
          placeholder="Mã xác thực"
          value={code}
          onChange={(event) => {
            setCode(event.target.value);
            setFieldErrors((prev) => ({ ...prev, code: undefined }));
          }}
          required
          className={`${inputClassName}${
            fieldErrors.code ? ' ring-1 ring-red-400' : ''
          }`}
        />
        {fieldErrors.code && (
          <p className="text-sm text-red-500">{fieldErrors.code}</p>
        )}

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
              Đang xác thực
            </>
          ) : (
            'Xác thực email'
          )}
        </Button>
      </form>
    </AuthActionCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}
