'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Heart,
  Moon,
  Sun,
  ShoppingCart,
  LogIn,
  UserRound,
  LogOut,
  FileText,
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/theme-context';
import { useCartQuery } from '@/hooks/api/use-cart';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import logo from '../../../public/logo.png';

export function MapHeader() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  const { data: cartData } = useCartQuery();
  const cartCount = useMemo(
    () => cartData?.cartLines?.reduce((sum, l) => sum + l.quantity, 0) ?? 0,
    [cartData],
  );

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const userDisplayName = useMemo(() => {
    if (!user) return 'Khách hàng';
    return (
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Khách hàng'
    );
  }, [user]);

  const userInitials = useMemo(() => {
    if (!user) return 'KH';
    return (
      `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.trim() || 'KH'
    );
  }, [user]);

  const avatarUrl = useMemo(() => {
    if (!user) return '';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || '')}+${encodeURIComponent(user.lastName || '')}&background=random`;
  }, [user]);

  const isAdminUser = useMemo(
    () => user?.rolesSecured?.some((role) => role.name === 'ADMIN') ?? false,
    [user],
  );

  const handleLogout = useCallback(async () => {
    setIsUserMenuOpen(false);
    await logout();
  }, [logout]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-40 h-14 flex items-center px-4 lg:px-6 bg-white/90 dark:bg-surface-base/90 backdrop-blur-md border-b border-border/20 dark:border-white/5 shadow-sm">
      {/* Logo */}
      <Link href="/" className="flex items-center shrink-0">
        <Image
          src={logo}
          alt="Swiftera"
          width={120}
          height={32}
          className="object-contain dark:brightness-[1.15]"
        />
      </Link>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-0.5">
        {/* Wishlist */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Wishlist"
          className="dark:hover:bg-white/10"
        >
          <Heart className="size-5 text-text-main" />
        </Button>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Chuyển chế độ sáng/tối"
          onClick={toggleTheme}
          className="dark:hover:bg-white/10"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="size-5 text-text-main" />
          ) : (
            <Moon className="size-5 text-text-main" />
          )}
        </Button>

        {/* Cart */}
        <Link href="/cart">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Giỏ hàng${cartCount > 0 ? `, ${cartCount} sản phẩm` : ''}`}
            className="relative dark:hover:bg-white/10"
          >
            <ShoppingCart className="size-5 text-text-main" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Button>
        </Link>

        {/* Login / User */}
        {!isAuthenticated ? (
          <Link href="/auth/login">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Đến trang đăng nhập"
              className="dark:hover:bg-white/10"
            >
              <LogIn className="size-5 text-text-main" />
            </Button>
          </Link>
        ) : (
          <div ref={userMenuRef} className="relative">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Tài khoản"
              onClick={() => setIsUserMenuOpen((v) => !v)}
              className={cn(
                'dark:hover:bg-white/10',
                isUserMenuOpen ? 'bg-gray-100 dark:bg-white/10' : '',
              )}
            >
              <Avatar size="default" className="size-8">
                <AvatarImage src={avatarUrl} alt={userDisplayName} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </Button>

            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-gray-100 dark:border-white/8 bg-white dark:bg-surface-card shadow-xl dark:shadow-black/50 py-1 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-white/8">
                  <p className="text-sm font-semibold text-text-main">
                    {userDisplayName}
                  </p>
                  <p className="text-xs text-text-sub truncate">
                    {user?.email || ''}
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    href="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-main hover:bg-gray-50 dark:hover:bg-white/8 hover:text-theme-primary-start transition-colors"
                  >
                    <UserRound size={15} className="text-text-sub shrink-0" />
                    Thông tin cá nhân
                  </Link>
                  <Link
                    href="/rental-orders"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-main hover:bg-gray-50 dark:hover:bg-white/8 hover:text-theme-primary-start transition-colors"
                  >
                    <FileText size={15} className="text-text-sub shrink-0" />
                    Đơn thuê của tôi
                  </Link>
                  {isAdminUser && (
                    <Link
                      href="/dashboard"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-main hover:bg-gray-50 dark:hover:bg-white/8 hover:text-theme-primary-start transition-colors"
                    >
                      <LayoutDashboard
                        size={15}
                        className="text-text-sub shrink-0"
                      />
                      Trang quản trị
                    </Link>
                  )}
                </div>

                <div className="border-t border-gray-100 dark:border-white/8 py-1">
                  <button
                    onClick={() => void handleLogout()}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-theme-primary-start hover:bg-red-50 dark:hover:bg-theme-primary-start/10 transition-colors"
                  >
                    <LogOut size={15} className="shrink-0" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
