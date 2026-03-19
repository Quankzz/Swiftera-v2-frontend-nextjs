import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SocialIcons } from './SocialIcons';

const inputClassName =
  'my-2 h-auto border-none bg-zinc-100 px-4 py-2.5 text-[13px] focus-visible:ring-1 focus-visible:ring-[#512da8]/30';

export function SignInForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      router.push('/');
    } catch {
      setError('Đăng nhập thất bại');
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="flex h-full flex-col items-center justify-center bg-white px-10"
    >
      <h1 className="text-2xl font-bold text-zinc-900">Đăng nhập</h1>
      <SocialIcons />
      <span className="text-xs text-zinc-500">
        hoặc sử dụng email và mật khẩu
      </span>
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
      <a
        href="#"
        className="my-3 text-[13px] text-zinc-600 no-underline hover:text-zinc-900"
      >
        Quên mật khẩu?
      </a>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      <Button
        type="submit"
        className="mt-2.5 h-auto bg-[#512da8] px-11 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#5c6bc0]"
      >
        Đăng nhập
      </Button>
    </form>
  );
}
