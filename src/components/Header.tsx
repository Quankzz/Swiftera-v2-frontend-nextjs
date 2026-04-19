'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/theme-context';
import { useCartQuery } from '@/hooks/api/use-cart';
import { useCartAnimationStore } from '@/stores/cart-animation-store';
import logo from '../../public/logo.png';
import { useHeaderSearch } from '@/features/products/hooks/use-header-search';
import { useCategoryTreeQuery } from '@/features/categories/hooks/use-category-tree';
import { HeaderSearchDropdown } from '@/components/header/HeaderSearchDropdown';
import {
  ChevronRight,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Search,
  ShoppingCart,
  Sun,
  UserRound,
  FileText,
  User,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Cart fly overlay – rendered inside Header so store is shared       */
/* ------------------------------------------------------------------ */
function CartFlyOverlayInner() {
  const flyingItems = useCartAnimationStore((s) => s.flyingItems);
  const cartRect = useCartAnimationStore((s) => s.cartRect);
  const removeFlyingItem = useCartAnimationStore((s) => s.removeFlyingItem);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !cartRect || flyingItems.length === 0) return null;

  return createPortal(
    <>
      {flyingItems.map((item) => {
        const startX = item.fromRect.left;
        const startY = item.fromRect.top;
        const endX =
          cartRect.left + cartRect.width / 2 - item.fromRect.width / 2;
        const endY =
          cartRect.top + cartRect.height / 2 - item.fromRect.height / 2;
        const dx = endX - startX;
        const dy = endY - startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const duration = Math.min(950, Math.max(520, dist * 0.8));

        return (
          <div
            key={item.id}
            className="pointer-events-none fixed z-9999"
            style={
              {
                left: startX,
                top: startY,
                width: item.fromRect.width,
                height: item.fromRect.height,
                '--dx': `${dx}px`,
                '--dy': `${dy}px`,
                '--dur': `${duration}ms`,
              } as React.CSSProperties
            }
            onAnimationEnd={() => removeFlyingItem(item.id)}
          >
            <style>{`
              @keyframes flyToCart {
                0%   { transform: translate(0,0) scale(1) rotate(0deg); opacity: 1; }
                30%  { transform: translate(calc(var(--dx)*0.25), calc(var(--dy)*0.25)) scale(0.85) rotate(-8deg); opacity: 1; }
                60%  { transform: translate(calc(var(--dx)*0.65), calc(var(--dy)*0.65)) scale(0.45) rotate(-18deg); opacity: 0.9; }
                85%  { transform: translate(calc(var(--dx)*0.92), calc(var(--dy)*0.92)) scale(0.15) rotate(12deg); opacity: 0.45; }
                100% { transform: translate(var(--dx), var(--dy)) scale(0.04) rotate(20deg); opacity: 0; }
              }
            `}</style>
            <div
              className="w-full h-full rounded-xl shadow-2xl shadow-rose-500/50 overflow-hidden"
              style={{
                animation: `flyToCart var(--dur) cubic-bezier(0.16, 1, 0.3, 1) forwards`,
              }}
            >
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full bg-rose-100 flex items-center justify-center rounded-xl">
                  <ShoppingCart className="size-6 text-rose-500" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>,
    document.body,
  );
}

/* ------------------------------------------------------------------ */
/*  Header                                                            */
/* ------------------------------------------------------------------ */
interface HeaderProps {
  stickyHeader?: boolean;
  showSearchAndCategories?: boolean;
}

export function Header({
  stickyHeader = false,
  showSearchAndCategories = true,
}: HeaderProps) {
  const HOVER_BRIDGE_HEIGHT = 10;
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  // Hydration-safe: chỉ render icon sau khi mount để tránh mismatch server/client
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Real API data for search ────────────────────────────────────────────────
  const search = useHeaderSearch();
  const { data: categoryTree = [] } = useCategoryTreeQuery();

  // Cart quantity từ API (optimistic update được xử lý trong useAddToCart)
  const { data: cartData } = useCartQuery();
  const cartCount = useMemo(
    () => cartData?.cartLines?.reduce((sum, l) => sum + l.quantity, 0) ?? 0,
    [cartData],
  );

  // Fly animation state
  const flyingItems = useCartAnimationStore((s) => s.flyingItems);
  const setCartRect = useCartAnimationStore((s) => s.setCartRect);
  const isFlying = flyingItems.length > 0;

  const sortedCategories = useMemo(
    () =>
      [...categoryTree]
        .filter((c) => c.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [categoryTree],
  );

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(
    null,
  );
  const cartBtnRef = useRef<HTMLButtonElement>(null);
  const hideTimeoutRef = useRef<number | null>(null);

  const scheduleHide = useCallback(() => {
    if (hideTimeoutRef.current) window.clearTimeout(hideTimeoutRef.current);
    // small delay to allow moving pointer to submenu
    hideTimeoutRef.current = window.setTimeout(() => {
      setHoveredCategoryId(null);
      hideTimeoutRef.current = null;
    }, 180) as unknown as number;
  }, []);

  const cancelHide = useCallback(() => {
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const hoveredCategoryData = useMemo(
    () => sortedCategories.find((c) => c.categoryId === hoveredCategoryId),
    [hoveredCategoryId, sortedCategories],
  );

  const avatarUrl = useMemo(() => {
    if (!user) return '';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.firstName || '',
    )}+${encodeURIComponent(user.lastName || '')}&background=random`;
  }, [user]);

  const userDisplayName = useMemo(() => {
    if (!user) return 'Khách hàng';
    return (
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Khách hàng'
    );
  }, [user]);

  const isAdminUser = useMemo(
    () => user?.rolesSecured?.some((role) => role.name === 'ADMIN') ?? false,
    [user],
  );

  const isStaffUser = useMemo(
    () => user?.rolesSecured?.some((role) => role.name === 'STAFF') ?? false,
    [user],
  );

  const userInitials = useMemo(() => {
    if (!user) return 'KH';
    const initials =
      `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.trim();
    return initials || 'KH';
  }, [user]);

  // Track cart icon rect for fly animation
  useEffect(() => {
    function updateRect() {
      if (cartBtnRef.current) {
        setCartRect(cartBtnRef.current.getBoundingClientRect());
      }
    }
    updateRect();
    window.addEventListener('scroll', updateRect, { passive: true });
    window.addEventListener('resize', updateRect);
    return () => {
      window.removeEventListener('scroll', updateRect);
      window.removeEventListener('resize', updateRect);
    };
  }, [setCartRect]);

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

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
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
      <CartFlyOverlayInner />

      <header
        className={cn(
          'relative top-0 w-full bg-white dark:bg-surface-base',
          stickyHeader && 'sticky',
          isSearchOpen
            ? 'z-50 border-transparent'
            : 'z-40 border-b border-border/20 dark:border-white/5 backdrop-blur shadow-sm dark:shadow-black/30',
        )}
        style={{
          transform: isFlying ? 'translateY(-100%)' : 'translateY(0)',
          boxShadow: isFlying
            ? '0 8px 32px -4px rgba(254,20,81,0.18)'
            : '0 1px 3px rgba(0,0,0,0.1)',
          transition: isFlying
            ? 'transform 380ms cubic-bezier(0.4,0,0.2,1) 80ms, box-shadow 380ms 80ms'
            : 'transform 500ms cubic-bezier(0.4,0,0.2,1) 700ms, box-shadow 500ms 700ms',
        }}
      >
        {showSearchAndCategories && isSearchOpen && (
          <div
            className="fixed inset-0 z-40 h-screen w-full bg-black/40 backdrop-blur-xs"
            onClick={() => setIsSearchOpen(false)}
          />
        )}
        <div className="mx-auto max-w-full px-4 py-3 lg:px-18">
          <div className="flex items-center gap-4 lg:gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3 relative z-30">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden dark:hover:bg-white/10"
              >
                <Menu className="size-5" />
              </Button>
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src={logo}
                  alt="logo"
                  width={150}
                  height={40}
                  className="object-contain dark:brightness-[1.15]"
                />
              </Link>
            </div>
            <div></div>

            {/* Search */}
            {showSearchAndCategories && (
              <div className="relative hidden flex-1 lg:flex z-50">
                <div
                  className="flex h-12 w-full max-w-2xl cursor-text items-center rounded-full border border-border/60 dark:border-white/10 bg-white dark:bg-white/5 px-4 shadow-sm transition-all"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="mr-3 size-5 text-text-sub" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm thiết bị, điện thoại, máy tính..."
                    className="w-full border-none bg-transparent text-sm text-text-main placeholder:text-text-sub focus:outline-none"
                    readOnly={!isSearchOpen}
                  />
                </div>

                {isSearchOpen && (
                  <div className="absolute -top-2 left-0 z-50 p-2 w-full rounded-3xl bg-white dark:bg-surface-card shadow-2xl dark:shadow-black/60">
                    <div className="flex h-12 items-center gap-3 border-2 border-theme-primary-start rounded-full px-4">
                      <Search className="size-5 text-text-sub" />
                      <input
                        type="text"
                        autoFocus
                        value={search.inputValue}
                        onChange={(e) => search.setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && search.inputValue.trim()) {
                            setIsSearchOpen(false);
                            const q = search.inputValue.trim();
                            search.setInputValue('');
                            router.push(`/catalog?q=${encodeURIComponent(q)}`);
                          }
                        }}
                        placeholder="Tìm kiếm thiết bị, điện thoại, máy tính..."
                        className="flex-1 border-none bg-transparent text-sm text-text-main placeholder:text-text-sub focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          search.setInputValue('');
                          setIsSearchOpen(false);
                        }}
                        className="flex size-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-text-sub"
                        >
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Dynamic dropdown content */}
                    <HeaderSearchDropdown
                      categories={categoryTree}
                      query={search.inputValue}
                      isQueryActive={search.isQueryActive}
                      results={search.results}
                      totalElements={search.totalElements}
                      isLoading={search.isLoading}
                      isEmpty={search.isEmpty}
                      onViewAll={() => {
                        setIsSearchOpen(false);
                        search.setInputValue('');
                        router.push(
                          `/catalog?q=${encodeURIComponent(search.debouncedQuery)}`,
                        );
                      }}
                      onCategoryClick={(categoryId) => {
                        setIsSearchOpen(false);
                        search.setInputValue('');
                        router.push(`/catalog?categoryId=${categoryId}`);
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Right actions */}
            <div
              className={cn(
                'relative ml-auto flex items-center gap-2 lg:gap-3',
                isSearchOpen ? 'z-30' : 'z-50',
              )}
            >
              <Button
                variant="ghost"
                size="icon"
                aria-label="Chuyển chế độ sáng/tối"
                onClick={toggleTheme}
                className="dark:hover:bg-white/10"
                suppressHydrationWarning
              >
                {/* Render placeholder trên server; sau mount mới show icon đúng */}
                {!mounted ? (
                  <span className="size-5" aria-hidden />
                ) : resolvedTheme === 'dark' ? (
                  <Sun className="size-5 text-text-main" />
                ) : (
                  <Moon className="size-5 text-text-main" />
                )}
              </Button>

              {/* Cart button with badge */}
              <Link href="/cart">
                <Button
                  ref={cartBtnRef}
                  variant="ghost"
                  size="icon"
                  aria-label={`Giỏ hàng${cartCount > 0 ? `, ${cartCount} sản phẩm` : ''}`}
                  className={cn(
                    'relative dark:hover:bg-white/10 transition-all duration-300',
                    isFlying && 'animate-cartBounce',
                  )}
                >
                  <ShoppingCart
                    className={cn(
                      'size-5 text-text-main transition-colors',
                      isFlying && 'text-rose-500',
                    )}
                  />
                  {cartCount > 0 && (
                    <span
                      className={cn(
                        'absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center transition-all duration-300',
                        isFlying
                          ? 'bg-green-500 text-white scale-125'
                          : 'bg-rose-500 text-white',
                      )}
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* User icon - opens login/register dropdown when guest */}
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
                  {isAuthenticated && avatarUrl ? (
                    <Avatar size="default" className="size-8">
                      <AvatarImage src={avatarUrl} alt={userDisplayName} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <User className="size-5 text-text-main" />
                  )}
                </Button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-gray-100 dark:border-white/8 bg-white dark:bg-surface-card shadow-xl dark:shadow-black/50 py-1 z-50 animate-in fade-in slide-in-from-top-1">
                    {!isAuthenticated ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-white/8">
                          <p className="text-sm font-semibold text-text-main">
                            Khách hàng
                          </p>
                          <p className="text-xs text-text-sub">
                            Vui lòng đăng nhập để tiếp tục
                          </p>
                        </div>
                        <div className="py-1">
                          <Link
                            href="/auth/login"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-main hover:bg-gray-50 dark:hover:bg-white/8 hover:text-theme-primary-start transition-colors"
                          >
                            <LogIn size={15} className="text-text-sub shrink-0" />
                            Đăng nhập
                          </Link>
                          <Link
                            href="/auth/register"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-main hover:bg-gray-50 dark:hover:bg-white/8 hover:text-theme-primary-start transition-colors"
                          >
                            <User size={15} className="text-text-sub shrink-0" />
                            Đăng ký
                          </Link>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-white/8">
                          <p className="text-sm font-semibold text-text-main">
                            {userDisplayName}
                          </p>
                          <p className="text-xs text-text-sub truncate">
                            {user?.email || 'guest@swiftera.com'}
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
                              <LayoutDashboard size={15} className="text-text-sub shrink-0" />
                              Trang quản trị
                            </Link>
                          )}
                          {isStaffUser && (
                            <Link
                              href="/staff-dashboard"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-main hover:bg-gray-50 dark:hover:bg-white/8 hover:text-theme-primary-start transition-colors"
                            >
                              <LayoutDashboard size={15} className="text-text-sub shrink-0" />
                              Kiểm đơn
                            </Link>
                          )}
                        </div>

                        <div className="border-t border-gray-100 dark:border-white/8 py-1">
                          <button
                            onClick={() => {
                              void handleLogout();
                            }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-theme-primary-start hover:bg-red-50 dark:hover:bg-theme-primary-start/10 transition-colors"
                          >
                            <LogOut size={15} className="shrink-0" />
                            Đăng xuất
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Nav categories */}
          {showSearchAndCategories && (
            <div className="hidden lg:block" onMouseEnter={cancelHide} onMouseLeave={scheduleHide}>
              <div className="relative z-30 mt-3 hidden flex-wrap items-center gap-6 text-sm font-semibold text-text-main lg:flex">
                {sortedCategories.map((category) => (
                  <div key={category.categoryId}>
                    <Link
                      href={`/catalog?categoryId=${category.categoryId}`}
                      onMouseEnter={() => {
                        cancelHide();
                        setHoveredCategoryId(category.categoryId);
                      }}
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
                className="absolute left-0 top-full w-full"
                style={{ height: HOVER_BRIDGE_HEIGHT }}
                aria-hidden
              />

              {/* Global Full-Width Mega Menu Dropdown */}
                {hoveredCategoryData && hoveredCategoryData.children?.length ? (
                <div
                  className="absolute top-full px-4 lg:px-18 left-0 w-full border-t border-border/40 dark:border-white/5 bg-white dark:bg-surface-card shadow-xl dark:shadow-black/50 animate-in fade-in slide-in-from-top-1 z-50 cursor-default"
                  onMouseEnter={() => {
                    cancelHide();
                    setHoveredCategoryId(hoveredCategoryData.categoryId);
                  }}
                >
                  <div className="px-4 w-full max-w-full py-4 flex gap-32">
                    {hoveredCategoryData.children &&
                      hoveredCategoryData.children.length > 0 && (
                        <div className="w-70 shrink-0">
                          <h3 className="text-lg font-bold text-text-main mb-6">
                            {hoveredCategoryData.name.charAt(0).toUpperCase() +
                              hoveredCategoryData.name.slice(1)}
                          </h3>
                          <ul className="space-y-2">
                            {hoveredCategoryData.children.map((child) => (
                              <li
                                key={child.categoryId}
                                className="group/child relative"
                              >
                                <Link
                                  href={`/catalog?categoryId=${hoveredCategoryData.categoryId}&subcategoryId=${child.categoryId}`}
                                  className="flex items-center justify-between py-2 text-text-main hover:text-theme-primary-start font-medium transition-colors"
                                >
                                  {child.name}
                                  {child.children &&
                                    child.children.length > 0 && (
                                      <ChevronRight className="size-5 text-text-sub group-hover/child:text-theme-primary-start transition-colors" />
                                    )}
                                </Link>
                                {child.children && child.children.length > 0 && (
                                  <div className="absolute left-full top-0 pl-8 hidden group-hover/child:block z-50">
                                    <div className="w-64 rounded-2xl bg-white dark:bg-[#1e1e26] shadow-xl dark:shadow-black/50 border border-gray-100 dark:border-white/8 p-4">
                                      <ul className="space-y-1.5">
                                        {child.children.map((subChild) => (
                                          <li key={subChild.categoryId}>
                                            <Link
                                              href={`/catalog?categoryId=${hoveredCategoryData.categoryId}&subcategoryId=${subChild.categoryId}`}
                                              className="block px-4 py-2.5 rounded-xl hover:bg-rose-50/50 dark:hover:bg-theme-primary-start/10 text-text-main hover:text-theme-primary-start text-sm font-medium transition-colors"
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
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <style>{`
          @keyframes cartBounce {
            0%   { transform: scale(1); }
            30%  { transform: scale(1.4); }
            55%  { transform: scale(0.9); }
            75%  { transform: scale(1.15); }
            90%  { transform: scale(0.97); }
            100% { transform: scale(1); }
          }
        `}</style>
      </header>
    </>
  );
}
