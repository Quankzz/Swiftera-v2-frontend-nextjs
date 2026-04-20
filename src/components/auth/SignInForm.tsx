'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { parseErrorForForm } from '@/api/apiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { normalizeRedirectPath } from '@/lib/auth-redirect';
import { toast } from 'sonner';

const inputClassName =
  'my-2 h-auto border-none bg-zinc-100 px-4 py-2.5 text-[13px] text-zinc-800 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-[#fe1451]/30 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-400 dark:focus-visible:ring-[#fe2560]/40';

type SignInField = 'email' | 'password';

function PasswordInput({
  value,
  onChange,
  placeholder,
  required,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean;
  className?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative my-2 w-full">
      <Input
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={className}
      />
      <button
        type="button"
        onClick={() => setShowPassword((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff className="size-4" />
        ) : (
          <Eye className="size-4" />
        )}
      </button>
    </div>
  );
}

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<SignInField, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');
    setFieldErrors({});

    try {
      setIsSubmitting(true);
      const result = await login({ email, password });
      const roles = result?.data?.userSecured?.rolesSecured ?? [];
      const isStaff = roles.some((r) => r.name === 'STAFF');

      const requestedRedirect = normalizeRedirectPath(
        searchParams.get('redirect'),
      );
      const destination = requestedRedirect ?? (isStaff ? '/staff-dashboard' : '/');

      router.push(destination);
      router.refresh();
    } catch (err) {
      const { fieldErrors: mappedFieldErrors, formMessage } = parseErrorForForm(
        err,
        'Đăng nhập thất bại',
      );

      setFieldErrors({
        email: mappedFieldErrors.email,
        password: mappedFieldErrors.password,
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
    <form
      onSubmit={handleLogin}
      className="flex h-full w-full flex-col items-center justify-center bg-white px-5 py-6 sm:px-10 sm:py-0 dark:bg-zinc-900"
    >
      <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-100">
        Đăng nhập
      </h1>
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setFieldErrors((prev) => ({ ...prev, email: undefined }));
        }}
        required
        className={`${inputClassName}${
          fieldErrors.email ? ' ring-1 ring-red-400' : ''
        }`}
      />
      {fieldErrors.email && <p className="mt-0.5 text-xs text-red-500">{fieldErrors.email}</p>}
      <PasswordInput
        value={password}
        onChange={(value) => {
          setPassword(value);
          setFieldErrors((prev) => ({ ...prev, password: undefined }));
        }}
        placeholder="Mật khẩu"
        required
        className={`${inputClassName}${
          fieldErrors.password ? ' ring-1 ring-red-400' : ''
        }`}
      />
      {fieldErrors.password && (
        <p className="mt-0.5 text-xs text-red-500">{fieldErrors.password}</p>
      )}
      <Link
        href="/auth/forgot-password"
        className="my-3 text-[13px] text-zinc-600 no-underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        Quên mật khẩu?
      </Link>
      <p className="text-center text-[11px] text-zinc-500 dark:text-zinc-400">
        Chưa xác thực email?{' '}
        <Link
          href="/auth/resend-verification"
          className="text-[#fe1451] hover:underline"
        >
          Gửi lại mã xác thực
        </Link>
      </p>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      <Button
        type="submit"
        disabled={isSubmitting || isLoading}
        className="mt-2.5 h-auto w-full bg-[#fe1451] px-11 py-2.5 text-xs font-semibold uppercase tracking-wider text-white sm:w-auto hover:bg-[#ba264d]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Đang đăng nhập
          </>
        ) : (
          'Đăng nhập'
        )}
      </Button>
    </form>
  );
}
