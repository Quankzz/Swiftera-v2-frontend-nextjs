'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const inputClassName =
  'my-2 h-auto border-none bg-zinc-100 px-4 py-2.5 text-[13px] text-zinc-800 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-[#fe1451]/30 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-400 dark:focus-visible:ring-[#fe2560]/40';

export function SignInForm() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');

    try {
      setIsSubmitting(true);
      await login({ email, password });
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="flex h-full w-full flex-col items-center justify-center bg-white px-5 py-6 sm:px-10 sm:py-0 dark:bg-zinc-900"
    >
      <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-100">Đăng nhập</h1>
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className={inputClassName}
      />
      <Input
        type="password"
        placeholder="Mật khẩu"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className={inputClassName}
      />
      <Link
        href="/auth/forgot-password"
        className="my-3 text-[13px] text-zinc-600 no-underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        Quên mật khẩu?
      </Link>
      <p className="text-center text-[11px] text-zinc-500 dark:text-zinc-400">
        Chưa xác thực email?{' '}
        <Link href="/auth/resend-verification" className="text-[#fe1451] hover:underline">
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
