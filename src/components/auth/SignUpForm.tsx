'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { PasswordStrength } from './PasswordStrength';

const inputClassName =
  'my-1.5 h-auto border-none bg-zinc-100 px-4 py-2 text-[13px] text-zinc-800 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-[#fe1451]/30 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-400 dark:focus-visible:ring-[#fe2560]/40';

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
    <div className="relative my-1.5 w-full">
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

export function SignUpForm() {
  const { register, isLoading } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] =
    useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    try {
      setIsSubmitting(true);
      await register({
        email,
        phoneNumber,
        password,
        confirmPassword,
        firstName,
        lastName,
      });
      setIsVerificationDialogOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleRegister}
        className='flex h-full w-full flex-col items-center justify-center overflow-y-auto bg-white px-5 py-6 sm:px-10 sm:py-0 dark:bg-zinc-900'
      >
        <h1 className='text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-100'>
          Tạo tài khoản
        </h1>
        <div className='mt-1 flex w-full flex-col gap-0 sm:flex-row sm:gap-2'>
          <Input
            type='text'
            placeholder='Họ'
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className={inputClassName}
          />
          <Input
            type='text'
            placeholder='Tên'
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className={inputClassName}
          />
        </div>
        <Input
          type='email'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClassName}
        />
        <Input
          type='tel'
          placeholder='Số điện thoại'
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
          className={inputClassName}
        />
        <PasswordInput
          value={password}
          onChange={setPassword}
          placeholder='Mật khẩu'
          required
          className={inputClassName}
        />
        <PasswordStrength password={password} />
        <div className="relative my-1.5 w-full">
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder='Xác nhận mật khẩu'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={cn(
              inputClassName,
              confirmPassword &&
                password !== confirmPassword &&
                'ring-1 ring-red-400',
            )}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {confirmPassword && password !== confirmPassword && (
          <p className='mt-0.5 self-start text-[11px] text-red-500'>
            Mật khẩu không khớp
          </p>
        )}
        {error && <p className='mt-1 text-xs text-red-500'>{error}</p>}
        <Button
          type='submit'
          disabled={isSubmitting || isLoading}
          className='mt-2 h-auto w-full bg-[#fe1451] px-11 py-2.5 text-xs font-semibold uppercase tracking-wider text-white sm:w-auto hover:bg-[#ba264d]'
        >
          {isSubmitting ? (
            <>
              <Loader2 className='size-4 animate-spin' />
              Đang đăng ký
            </>
          ) : (
            'Đăng ký'
          )}
        </Button>
      </form>

      <Dialog
        open={isVerificationDialogOpen}
        onOpenChange={setIsVerificationDialogOpen}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Đăng ký thành công</DialogTitle>
            <DialogDescription>
              Chúng tôi đã gửi email xác thực đến{' '}
              <span className='font-medium'>{email}</span>. Vui lòng kiểm tra
              hộp thư và nhấn vào liên kết kích hoạt tài khoản.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Link
              href={`/auth/resend-verification?email=${encodeURIComponent(email)}`}
              className='inline-flex h-9 items-center justify-center rounded-md bg-[#fe1451] px-4 text-sm font-medium text-white transition-colors hover:bg-[#ba264d]'
            >
              Gửi lại email xác thực
            </Link>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsVerificationDialogOpen(false)}
            >
              Tôi đã hiểu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
