'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5">
      <path
        fill="currentColor"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5">
      <path
        fill="currentColor"
        d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5">
      <path
        fill="currentColor"
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      />
    </svg>
  );
}

const socialIconComponents = [GoogleIcon, FacebookIcon, GithubIcon, LinkedInIcon];

type AuthContainerProps = {
  initialMode?: 'signin' | 'signup';
};

export function AuthContainer({ initialMode = 'signin' }: AuthContainerProps) {
  const [isActive, setIsActive] = useState(initialMode === 'signup');
  const router = useRouter();
  const { login } = useAuth();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerError, setRegisterError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      await login(loginEmail, loginPassword);
      router.push('/');
    } catch {
      setLoginError('Đăng nhập thất bại');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    try {
      // TODO: Gọi API đăng ký
      router.push('/auth/login');
    } catch {
      setRegisterError('Đăng ký thất bại');
    }
  };

  const switchToSignUp = () => {
    setIsActive(true);
    window.history.replaceState(null, '', '/auth/register');
  };

  const switchToSignIn = () => {
    setIsActive(false);
    window.history.replaceState(null, '', '/auth/login');
  };

  const inputClassName =
    'my-2 h-auto border-none bg-zinc-100 px-4 py-2.5 text-[13px] focus-visible:ring-1 focus-visible:ring-[#512da8]/30';

  const socialIcons = (
    <div className="my-5 flex gap-1.5">
      {socialIconComponents.map((Icon, i) => (
        <Button
          key={i}
          type="button"
          variant="outline"
          size="icon"
          className="size-10 rounded-[20%] border-zinc-300 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
        >
          <Icon />
        </Button>
      ))}
    </div>
  );

  return (
    <div className="relative min-h-[480px] w-[768px] max-w-full overflow-hidden rounded-[30px] bg-white shadow-[0_5px_15px_rgba(0,0,0,0.35)]">
      {/* Sign Up Form */}
      <div
        className={cn(
          'absolute top-0 left-0 z-1 h-full w-1/2 opacity-0 transition-all duration-600 ease-in-out',
          isActive && 'z-5 translate-x-full opacity-100 animate-auth-move'
        )}
      >
        <form
          onSubmit={handleRegister}
          className="flex h-full flex-col items-center justify-center bg-white px-10"
        >
          <h1 className="text-2xl font-bold text-zinc-900">Tạo tài khoản</h1>
          {socialIcons}
          <span className="text-xs text-zinc-500">
            hoặc sử dụng email để đăng ký
          </span>
          <Input
            type="text"
            placeholder="Họ và tên"
            value={registerName}
            onChange={(e) => setRegisterName(e.target.value)}
            className={inputClassName}
          />
          <Input
            type="email"
            placeholder="Email"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
            required
            className={inputClassName}
          />
          <Input
            type="password"
            placeholder="Mật khẩu"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            required
            className={inputClassName}
          />
          {registerError && (
            <p className="mt-1 text-xs text-red-500">{registerError}</p>
          )}
          <Button
            type="submit"
            className="mt-2.5 h-auto bg-[#512da8] px-11 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#5c6bc0]"
          >
            Đăng ký
          </Button>
        </form>
      </div>

      {/* Sign In Form */}
      <div
        className={cn(
          'absolute top-0 left-0 z-2 h-full w-1/2 transition-all duration-600 ease-in-out',
          isActive && 'translate-x-full'
        )}
      >
        <form
          onSubmit={handleLogin}
          className="flex h-full flex-col items-center justify-center bg-white px-10"
        >
          <h1 className="text-2xl font-bold text-zinc-900">Đăng nhập</h1>
          {socialIcons}
          <span className="text-xs text-zinc-500">
            hoặc sử dụng email và mật khẩu
          </span>
          <Input
            type="email"
            placeholder="Email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            required
            className={inputClassName}
          />
          <Input
            type="password"
            placeholder="Mật khẩu"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
            className={inputClassName}
          />
          <a
            href="#"
            className="my-3 text-[13px] text-zinc-600 no-underline hover:text-zinc-900"
          >
            Quên mật khẩu?
          </a>
          {loginError && (
            <p className="mt-1 text-xs text-red-500">{loginError}</p>
          )}
          <Button
            type="submit"
            className="mt-2.5 h-auto bg-[#512da8] px-11 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#5c6bc0]"
          >
            Đăng nhập
          </Button>
        </form>
      </div>

      {/* Toggle Container */}
      <div
        className={cn(
          'absolute top-0 left-1/2 z-1000 h-full w-1/2 overflow-hidden transition-all duration-600 ease-in-out',
          isActive
            ? '-translate-x-full rounded-[0_150px_100px_0]'
            : 'rounded-[150px_0_0_100px]'
        )}
      >
        <div
          className={cn(
            'relative -left-full h-full w-[200%] bg-linear-to-r from-[#5c6bc0] to-[#512da8] text-white transition-all duration-600 ease-in-out',
            isActive && 'translate-x-1/2'
          )}
        >
          {/* Toggle Left Panel - "Welcome Back" */}
          <div
            className={cn(
              'absolute top-0 flex h-full w-1/2 flex-col items-center justify-center px-8 text-center transition-all duration-600 ease-in-out',
              isActive ? 'translate-x-0' : '-translate-x-[200%]'
            )}
          >
            <h1 className="text-2xl font-bold">Chào mừng trở lại!</h1>
            <p className="my-5 text-sm leading-5 tracking-wide">
              Nhập thông tin cá nhân để sử dụng tất cả tính năng
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={switchToSignIn}
              className="h-auto border-white bg-transparent px-11 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-white/10 hover:text-white"
            >
              Đăng nhập
            </Button>
          </div>

          {/* Toggle Right Panel - "Hello Friend" */}
          <div
            className={cn(
              'absolute top-0 right-0 flex h-full w-1/2 flex-col items-center justify-center px-8 text-center transition-all duration-600 ease-in-out',
              isActive && 'translate-x-[200%]'
            )}
          >
            <h1 className="text-2xl font-bold">Xin chào!</h1>
            <p className="my-5 text-sm leading-5 tracking-wide">
              Đăng ký với thông tin cá nhân để sử dụng tất cả tính năng
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={switchToSignUp}
              className="h-auto border-white bg-transparent px-11 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-white/10 hover:text-white"
            >
              Đăng ký
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
