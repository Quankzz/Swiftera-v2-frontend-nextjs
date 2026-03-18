'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Bell, Sun, Moon, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/theme-context';
import { useState } from 'react';
import { MOCK_CURRENT_STAFF, MOCK_STATS } from '@/data/mockDashboard';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Tổng quan',
  '/dashboard/orders': 'Quản lý đơn hàng',
  '/dashboard/products': 'Quản lý sản phẩm',
  '/dashboard/scanner': 'Quét mã QR',
  '/dashboard/contracts': 'Hợp đồng',
  '/dashboard/contracts/new': 'Tạo hợp đồng mới',
};

function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // Fix hydration
  if (typeof window !== 'undefined' && !mounted) setMounted(true);
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
  );
}

interface DashboardHeaderProps {
  onMenuOpen?: () => void;
}

export function DashboardHeader({ onMenuOpen }: DashboardHeaderProps) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? 'Dashboard';

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/20 bg-background/80 px-4 sm:px-6 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          onClick={onMenuOpen}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>
        <div>
          <h1 className="text-sm font-semibold text-foreground sm:text-base">
            {title}
          </h1>
          <p className="hidden text-xs text-muted-foreground capitalize sm:block">
            {today}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Overdue warning badge */}
        {MOCK_STATS.overdue_orders > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 rounded-md bg-red-500/10 border border-red-500/20 px-2.5 py-1 text-xs font-medium text-red-500">
            <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="hidden md:inline">
              {MOCK_STATS.overdue_orders} đơn quá hạn
            </span>
            <span className="md:hidden">{MOCK_STATS.overdue_orders}!</span>
          </div>
        )}

        <ThemeToggle />

        {/* Notification bell */}
        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell className="size-4" />
          {MOCK_STATS.pending_orders > 0 && (
            <span className="absolute right-1 top-1 flex size-3.5 items-center justify-center rounded-full bg-teal-500 text-[9px] font-bold text-white">
              {MOCK_STATS.pending_orders}
            </span>
          )}
        </Button>

        {/* Staff avatar */}
        {MOCK_CURRENT_STAFF.avatar_url ? (
          <Image
            src={MOCK_CURRENT_STAFF.avatar_url}
            alt={MOCK_CURRENT_STAFF.full_name}
            width={28}
            height={28}
            className="size-7 rounded-full object-cover ring-2 ring-teal-500/30"
          />
        ) : (
          <div className="flex size-7 items-center justify-center rounded-full bg-teal-500/20 text-teal-400 text-xs font-bold">
            {MOCK_CURRENT_STAFF.full_name.charAt(0)}
          </div>
        )}
      </div>
    </header>
  );
}
