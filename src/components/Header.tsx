'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  ChevronRight,
  Heart,
  LayoutDashboard,
  LogOut,
  LogIn,
  Menu,
  Moon,
  Search,
  ShoppingCart,
  Sun,
  UserRound,
  FileText,
  Settings,
} from 'lucide-react';
import { topLevelCategories } from '@/data/categories';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/theme-context';
import logo from '../../public/logo.png';

export function Header() {
  const HOVER_BRIDGE_HEIGHT = 10;
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  const sortedCategories = useMemo(
    () => [...topLevelCategories].sort((a, b) => a.sortOrder - b.sortOrder),
    [],
  );

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(
    null,
  );

  const hoveredCategoryData = useMemo(
    () => sortedCategories.find((c) => c.categoryId === hoveredCategoryId),
    [hoveredCategoryId, sortedCategories],
  );

  const avatarUrl = useMemo(() => {
    if (!user) {
      return '';
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.firstName || '',
    )}+${encodeURIComponent(user.lastName || '')}&background=random`;
  }, [user]);

  const userDisplayName = useMemo(() => {
    if (!user) {
      return 'Khách hàng';
    }

    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Khách hàng';
  }, [user]);

  const isAdminUser = useMemo(
    () => user?.rolesSecured?.some((role) => role.name === 'ADMIN') ?? false,
    [user],
  );

  const userInitials = useMemo(() => {
    if (!user) {
      return 'KH';
    }

    const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.trim();
    return initials || 'KH';
  }, [user]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    const onClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, []);

  const handleLogout = useCallback(async () => {
    setIsUserMenuOpen(false);
    await logout();
    router.push('/');
    router.refresh();
  }, [logout, router]);

  return (
    <>
      <header
        className={cn(
          'top-0 w-full bg-white dark:bg-surface-base transition-colors duration-300 shadow-sm dark:shadow-black/30',
          isSearchOpen
            ? 'z-50 border-transparent'
            : 'z-40 border-b border-border/20 dark:border-white/5 backdrop-blur',
        )}
      >
        {isSearchOpen && (
          <div
            className='fixed inset-0 z-40 h-screen w-screen bg-black/40 backdrop-blur-xs'
            onClick={() => setIsSearchOpen(false)}
          />
        )}
        <div className='mx-auto max-w-full px-4 py-3 lg:px-18'>
          <div className='flex items-center gap-4 lg:gap-6'>
            <div className='flex items-center gap-3 relative z-30'>
              <Button
                variant='ghost'
                size='icon'
                className='lg:hidden dark:hover:bg-white/10'
              >
                <Menu className='size-5' />
              </Button>
              <Link href='/' className='flex items-center gap-2'>
                <Image
                  src={logo}
                  alt='logo'
                  width={150}
                  height={40}
                  className='object-contain dark:brightness-[1.15]'
                />
              </Link>
            </div>
            <div></div>

            <div className='relative hidden flex-1 lg:flex z-50'>
              <div
                className={cn(
                  'flex h-12 w-full max-w-2xl cursor-text items-center rounded-full border border-border/60 dark:border-white/10 bg-white dark:bg-white/5 px-4 shadow-sm transition-all',
                )}
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className='mr-3 size-5 text-text-sub' />
                <input
                  type='text'
                  placeholder='Tìm kiếm thiết bị, điện thoại, máy tính...'
                  className='w-full border-none bg-transparent text-sm text-text-main placeholder:text-text-sub focus:outline-none'
                  readOnly={!isSearchOpen}
                />
              </div>

              {isSearchOpen && (
                <div className='absolute -top-2 left-0 z-50 p-2 w-full rounded-3xl bg-white dark:bg-surface-card shadow-2xl dark:shadow-black/60'>
                  <div className='flex h-12 items-center gap-3 border-2 border-theme-primary-start rounded-full px-4'>
                    <Search className='size-5 text-text-sub' />
                    <input
                      type='text'
                      autoFocus
                      placeholder='Tìm kiếm thiết bị, điện thoại, máy tính...'
                      className='flex-1 border-none bg-transparent text-sm text-text-main placeholder:text-text-sub focus:outline-none'
                    />
                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSearchOpen(false);
                      }}
                      className='flex size-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='18'
                        height='18'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='text-text-sub'
                      >
                        <path d='M18 6 6 18' />
                        <path d='m6 6 12 12' />
                      </svg>
                    </button>
                  </div>

                  <div className='p-6'>
                    <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
                      {sortedCategories.slice(0, 8).map((category) => {
                        return (
                          <button
                            type='button'
                            key={category.categoryId}
                            className='group flex flex-col items-center justify-center gap-3 rounded-2xl bg-gray-50/50 dark:bg-white/5 p-4 transition-colors hover:bg-gray-100 dark:hover:bg-white/10'
                          >
                            {category.image && (
                              <div className='relative h-20 w-20 overflow-hidden mix-blend-multiply dark:mix-blend-normal'>
                                <Image
                                  src={category.image}
                                  alt={category.name}
                                  fill
                                  className='object-contain aspect-square'
                                />
                              </div>
                            )}
                            <span className='text-sm font-medium text-text-main'>
                              {category.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div
              className={cn(
                'relative ml-auto flex items-center gap-2 lg:gap-3',
                isSearchOpen ? 'z-30' : 'z-50',
              )}
            >
              <Button
                variant='ghost'
                size='icon'
                aria-label='Wishlist'
                className='dark:hover:bg-white/10'
              >
                <Heart className='size-5 text-text-main' />
              </Button>

              

              {/* Dark / Light mode toggle */}
              <Button
                variant='ghost'
                size='icon'
                aria-label='Chuyển chế độ sáng/tối'
                onClick={toggleTheme}
                className='dark:hover:bg-white/10'
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className='size-5 text-text-main' />
                ) : (
                  <Moon className='size-5 text-text-main' />
                )}
              </Button>

              <Link href='/cart'>
                <Button
                  variant='ghost'
                  size='icon'
                  aria-label='Cart'
                  className='dark:hover:bg-white/10'
                >
                  <ShoppingCart className='size-5 text-text-main' />
                </Button>
              </Link>
              {!isAuthenticated && (
                <Link href='/auth/login'>
                  <Button
                    variant='ghost'
                    size='icon'
                    aria-label='Đi tới trang đăng nhập'
                    className='dark:hover:bg-white/10'
                  >
                    <LogIn className='size-5 text-text-main' />
                  </Button>
                </Link>
              )}
{/* User dropdown */}
<div ref={userMenuRef} className='relative'>
                <Button
                  variant='ghost'
                  size='icon'
                  aria-label='Tài khoản'
                  onClick={() => setIsUserMenuOpen((v) => !v)}
                  className={cn(
                    'dark:hover:bg-white/10',
                    isUserMenuOpen ? 'bg-gray-100 dark:bg-white/10' : '',
                  )}
                >
                  {isAuthenticated && avatarUrl ? (
                    <Avatar size='default' className='size-8'>
                      <AvatarImage src={avatarUrl} alt={userDisplayName} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <UserRound className='size-5 text-text-main' />
                  )}
                </Button>

                {isUserMenuOpen && (
                  <div className='absolute right-0 top-full mt-2 w-56 rounded-2xl border border-gray-100 dark:border-white/8 bg-white dark:bg-surface-card shadow-xl dark:shadow-black/50 py-1 z-50 animate-in fade-in slide-in-from-top-1'>
                    {/* User info header */}
                    <div className='px-4 py-3 border-b border-gray-100 dark:border-white/8'>
                      <p className='text-sm font-semibold text-text-main'>
                        {userDisplayName}
                      </p>
                      <p className='text-xs text-text-sub truncate'>
                        {user?.email || 'guest@swiftera.com'}
                      </p>
                    </div>

                    <div className='py-1'>
                      {isAuthenticated ? (
                        <>
                          <Link
                            href='/profile'
                            onClick={() => setIsUserMenuOpen(false)}
                            className='flex items-center gap-3 px-4 py-2.5 text-sm text-text-main hover:bg-gray-50 dark:hover:bg-white/8 hover:text-theme-primary-start transition-colors'
                          >
                            <UserRound
                              size={15}
                              className='text-text-sub shrink-0'
                            />
                            Thông tin cá nhân
                          </Link>
                          <Link
                            href='/rental-orders'
                            onClick={() => setIsUserMenuOpen(false)}
                            className='flex items-center gap-3 px-4 py-2.5 text-sm text-text-main hover:bg-gray-50 dark:hover:bg-white/8 hover:text-theme-primary-start transition-colors'
                          >
                            <FileText
                              size={15}
                              className='text-text-sub shrink-0'
                            />
                            Đơn thuê của tôi
                          </Link>
                          {isAdminUser && (
                            <Link
                              href='/dashboard'
                              onClick={() => setIsUserMenuOpen(false)}
                              className='flex items-center gap-3 px-4 py-2.5 text-sm text-text-main hover:bg-gray-50 dark:hover:bg-white/8 hover:text-theme-primary-start transition-colors'
                            >
                              <LayoutDashboard
                                size={15}
                                className='text-text-sub shrink-0'
                              />
                              Trang quản trị
                            </Link>
                          )}
                        </>
                      ) : (
                        <>
                          <Link
                            href='/auth/login'
                            onClick={() => setIsUserMenuOpen(false)}
                            className='flex items-center gap-3 px-4 py-2.5 text-sm text-text-main hover:bg-gray-50 dark:hover:bg-white/8 hover:text-theme-primary-start transition-colors'
                          >
                            <LogIn size={15} className='text-text-sub shrink-0' />
                            Đăng nhập
                          </Link>
                          <Link
                            href='/auth/register'
                            onClick={() => setIsUserMenuOpen(false)}
                            className='flex items-center gap-3 px-4 py-2.5 text-sm text-text-main hover:bg-gray-50 dark:hover:bg-white/8 hover:text-theme-primary-start transition-colors'
                          >
                            <Settings
                              size={15}
                              className='text-text-sub shrink-0'
                            />
                            Tạo tài khoản
                          </Link>
                        </>
                      )}
                    </div>

                    {isAuthenticated && (
                      <div className='border-t border-gray-100 dark:border-white/8 py-1'>
                        <button
                          onClick={() => {
                            void handleLogout();
                          }}
                          className='flex w-full items-center gap-3 px-4 py-2.5 text-sm text-theme-primary-start hover:bg-red-50 dark:hover:bg-theme-primary-start/10 transition-colors'
                        >
                          <LogOut size={15} className='shrink-0' />
                          Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            className='relative hidden lg:block'
            onMouseLeave={() => setHoveredCategoryId(null)}
          >
            <div className='relative z-30 mt-3 hidden flex-wrap items-center gap-6 text-sm font-semibold text-text-main lg:flex'>
              {sortedCategories.map((category) => (
                <div key={category.categoryId}>
                  <Link
                    href={`/${category.slug}`}
                    onMouseEnter={() =>
                      setHoveredCategoryId(category.categoryId)
                    }
                    className={cn(
                      `flex items-center gap-2 rounded-full ${category.sortOrder === 1 ? 'pr-3' : 'px-3'} py-2 transition-colors shrink-0`,
                      hoveredCategoryId === category.categoryId
                        ? 'text-theme-primary-start'
                        : 'hover:text-theme-primary-start',
                    )}
                  >
                    {category.name}
                  </Link>
                </div>
              ))}
            </div>

            <div
              className='absolute left-0 top-full w-full'
              style={{ height: HOVER_BRIDGE_HEIGHT }}
              aria-hidden
            />

            {/* Global Full-Width Mega Menu Dropdown */}
            {hoveredCategoryData &&
            (hoveredCategoryData.children?.length ||
              hoveredCategoryData.brands?.length) ? (
              <div
                className='absolute left-1/2 w-screen -translate-x-1/2 border-t border-border/40 dark:border-white/5 bg-white dark:bg-surface-card shadow-xl dark:shadow-black/50 animate-in fade-in slide-in-from-top-1 z-50 cursor-default'
                style={{ top: `calc(100% + ${HOVER_BRIDGE_HEIGHT}px)` }}
                onMouseEnter={() =>
                  setHoveredCategoryId(hoveredCategoryData.categoryId)
                }
              >
                <div className='mx-auto max-w-full px-4 py-4 lg:px-18 flex gap-32'>
                  {hoveredCategoryData.children &&
                    hoveredCategoryData.children.length > 0 && (
                      <div className='w-70 shrink-0'>
                        <h3 className='text-lg font-bold text-text-main mb-6'>
                          {hoveredCategoryData.name}
                        </h3>
                        <ul className='space-y-2'>
                          {hoveredCategoryData.children.map((child) => (
                            <li
                              key={child.categoryId}
                              className='group/child relative'
                            >
                              <Link
                                href={`/${child.slug}`}
                                className='flex items-center justify-between py-2 text-text-main hover:text-theme-primary-start font-medium transition-colors'
                              >
                                {child.name}
                                {child.children &&
                                  child.children.length > 0 && (
                                    <ChevronRight className='size-5 text-text-sub group-hover/child:text-theme-primary-start transition-colors' />
                                  )}
                              </Link>

                              {/* Sub-menu level 3 */}
                              {child.children && child.children.length > 0 && (
                                <div className='absolute left-full top-0 pl-8 hidden group-hover/child:block z-50'>
                                  <div className='w-64 rounded-2xl bg-white dark:bg-[#1e1e26] shadow-xl dark:shadow-black/50 border border-gray-100 dark:border-white/8 p-4'>
                                    <ul className='space-y-1.5'>
                                      {child.children.map((subChild) => (
                                        <li key={subChild.categoryId}>
                                          <Link
                                            href={`/${subChild.slug}`}
                                            className='block px-4 py-2.5 rounded-xl hover:bg-rose-50/50 dark:hover:bg-theme-primary-start/10 text-text-main hover:text-theme-primary-start text-sm font-medium transition-colors'
                                          >
                                            {subChild.name}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {hoveredCategoryData.brands &&
                    hoveredCategoryData.brands.length > 0 && (
                      <div className='w-70 shrink-0'>
                        <h3 className='text-lg font-bold text-text-main mb-6'>
                          Brands
                        </h3>
                        <ul className='space-y-2'>
                          {hoveredCategoryData.brands.map((brand, index) => (
                            <li key={index}>
                              <Link
                                href={`/brands/${brand.toLowerCase()}`}
                                className='block py-2 text-text-main hover:text-theme-primary-start font-medium transition-colors'
                              >
                                {brand}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>
    </>
  );
}
