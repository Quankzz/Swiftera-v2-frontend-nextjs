import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { SocialIcons } from './SocialIcons';
import { PasswordStrength } from './PasswordStrength';

const inputClassName =
  'my-1.5 h-auto border-none bg-zinc-100 px-4 py-2 text-[13px] text-zinc-800 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-[#fe1451]/30 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-400 dark:focus-visible:ring-[#fe2560]/40';

export function SignUpForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

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
      // TODO: Gọi API đăng ký với payload:
      // { email, phoneNumber, password, confirmPassword, firstName, lastName }
      router.push('/auth/login');
    } catch {
      setError('Đăng ký thất bại');
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      className="flex h-full w-full flex-col items-center justify-center overflow-y-auto bg-white px-5 py-6 sm:px-10 sm:py-0 dark:bg-zinc-900"
    >
      <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-100">
        Tạo tài khoản
      </h1>
      <div className="mt-1 flex w-full flex-col gap-0 sm:flex-row sm:gap-2">
        <Input
          type="text"
          placeholder="Họ"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          className={inputClassName}
        />
        <Input
          type="text"
          placeholder="Tên"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          className={inputClassName}
        />
      </div>
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className={inputClassName}
      />
      <Input
        type="tel"
        placeholder="Số điện thoại"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
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
      <PasswordStrength password={password} />
      <Input
        type="password"
        placeholder="Xác nhận mật khẩu"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        className={cn(
          inputClassName,
          confirmPassword && password !== confirmPassword && 'ring-1 ring-red-400'
        )}
      />
      {confirmPassword && password !== confirmPassword && (
        <p className="mt-0.5 self-start text-[11px] text-red-500">Mật khẩu không khớp</p>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      <Button
        type="submit"
        className="mt-2 h-auto w-full bg-[#fe1451] px-11 py-2.5 text-xs font-semibold uppercase tracking-wider text-white sm:w-auto hover:bg-[#ba264d]"
      >
        Đăng ký
      </Button>
    </form>
  );
}
