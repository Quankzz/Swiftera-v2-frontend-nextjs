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

function ResendVerificationForm() {
  const searchParams = useSearchParams();
  const { resendVerificationEmail, isLoading } = useAuth();
  const initialEmail = useMemo(() => searchParams.get('email') ?? '', [searchParams]);
  const [email, setEmail] = useState(initialEmail);
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
      await resendVerificationEmail(email);
      setSuccess('Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư.');
    } catch (err) {
      const { fieldErrors: mappedFieldErrors, formMessage } = parseErrorForForm(
        err,
        'Không thể gửi lại email xác thực',
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
      title="Gửi lại email xác thực"
      description="Dùng khi tài khoản chưa được kích hoạt hoặc chưa nhận được mail."
      footerLinks={[
        { href: '/auth/login', label: 'Quay lại đăng nhập' },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
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
          className="h-auto w-full bg-[#fe1451] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#ba264d]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Đang gửi lại
            </>
          ) : (
            'Gửi lại email'
          )}
        </Button>
      </form>
    </AuthActionCard>
  );
}

export default function ResendVerificationPage() {
  return (
    <Suspense fallback={null}>
      <ResendVerificationForm />
    </Suspense>
  );
}
