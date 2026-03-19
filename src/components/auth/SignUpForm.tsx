import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SocialIcons } from './SocialIcons';

const inputClassName =
  'my-2 h-auto border-none bg-zinc-100 px-4 py-2.5 text-[13px] focus-visible:ring-1 focus-visible:ring-[#512da8]/30';

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      // TODO: Gọi API đăng ký
      router.push('/auth/login');
    } catch {
      setError('Đăng ký thất bại');
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      className="flex h-full flex-col items-center justify-center bg-white px-10"
    >
      <h1 className="text-2xl font-bold text-zinc-900">Tạo tài khoản</h1>
      <SocialIcons />
      <span className="text-xs text-zinc-500">
        hoặc sử dụng email để đăng ký
      </span>
      <Input
        type="text"
        placeholder="Họ và tên"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={inputClassName}
      />
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
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      <Button
        type="submit"
        className="mt-2.5 h-auto bg-[#512da8] px-11 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#5c6bc0]"
      >
        Đăng ký
      </Button>
    </form>
  );
}
