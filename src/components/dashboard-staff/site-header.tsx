'use client';

import { usePathname } from 'next/navigation';
import { Bell, Sun, Moon } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSidebar } from '@/components/ui/sidebar';
import { useTheme } from '@/context/theme-context';
import { PanelLeftIcon } from 'lucide-react';
import { MOCK_STATS } from '@/data/mockDashboard';
import { useState, useEffect } from 'react';

const PAGE_TITLES: Record<
  string,
  { label: string; parent?: string; parentUrl?: string }
> = {
  '/dashboard': { label: 'Tổng quan' },
  '/dashboard/orders': {
    label: 'Đơn hàng',
    parent: 'Dashboard',
    parentUrl: '/dashboard',
  },
  '/dashboard/products': {
    label: 'Sản phẩm',
    parent: 'Dashboard',
    parentUrl: '/dashboard',
  },
  '/dashboard/contracts': {
    label: 'Hợp đồng',
    parent: 'Dashboard',
    parentUrl: '/dashboard',
  },
  '/dashboard/contracts/new': {
    label: 'Tạo hợp đồng mới',
    parent: 'Dashboard',
    parentUrl: '/dashboard',
  },
};

function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8" aria-hidden="true" disabled>
        <div className="size-4 animate-pulse rounded-full bg-muted" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
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

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();

  // Match dynamic routes like /dashboard/orders/[id]
  const orderDetailMatch = pathname.match(/^\/dashboard\/orders\/(.+)$/);
  const pageInfo = orderDetailMatch
    ? {
        label: `Đơn #${orderDetailMatch[1].toUpperCase().slice(0, 10)}`,
        parent: 'Đơn hàng',
        parentUrl: '/dashboard/orders',
      }
    : (PAGE_TITLES[pathname] ?? { label: 'Dashboard' });

  return (
    <header className="sticky top-0 z-50 flex w-full h-16 shrink-0 items-center justify-between border-b border-border/40 bg-background/70 px-2 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.2)] transition-all">
      <div className="flex w-full items-center gap-2 px-2">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <PanelLeftIcon className="size-4" />
        </Button>
        <Separator
          orientation="vertical"
          className="mr-2 data-vertical:h-4 data-vertical:self-auto"
        />

        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            {pageInfo.parent && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href={pageInfo.parentUrl ?? '/dashboard'}>
                    {pageInfo.parent}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage>{pageInfo.label}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-2">
          {MOCK_STATS.overdue_orders > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-md bg-destructive/10 border border-destructive/20 px-2.5 py-1 text-xs font-medium text-destructive">
              <span className="size-1.5 rounded-full bg-destructive animate-pulse" />
              <span>{MOCK_STATS.overdue_orders} đơn quá hạn</span>
            </div>
          )}
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="relative h-8 w-8">
            <Bell className="size-4" />
            {MOCK_STATS.pending_orders > 0 && (
              <span className="absolute right-1 top-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                {MOCK_STATS.pending_orders}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
