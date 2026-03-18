'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  QrCode,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MOCK_CURRENT_STAFF,
  MOCK_HUB_INFO,
  MOCK_STATS,
} from '@/data/mockDashboard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const NAV_ITEMS = [
  {
    label: 'Tổng quan',
    href: '/dashboard',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    label: 'Đơn hàng',
    href: '/dashboard/orders',
    icon: ShoppingBag,
    badge: MOCK_STATS.pending_orders + MOCK_STATS.overdue_orders,
  },
  {
    label: 'Sản phẩm',
    href: '/dashboard/products',
    icon: Package,
    badge: null,
  },
  {
    label: 'Quét QR',
    href: '/dashboard/scanner',
    icon: QrCode,
    badge: null,
    highlight: true,
  },
  {
    label: 'Hợp đồng',
    href: '/dashboard/contracts',
    icon: FileText,
    badge: null,
  },
];

interface DashboardSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function SidebarContent({
  collapsed,
  onCollapse,
  onMobileClose,
  isMobileDrawer,
}: {
  collapsed: boolean;
  onCollapse?: () => void;
  onMobileClose?: () => void;
  isMobileDrawer?: boolean;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border/20 bg-[#0f1117] text-white transition-all duration-300',
        !isMobileDrawer && (collapsed ? 'w-16' : 'w-60'),
        isMobileDrawer && 'w-64',
      )}
    >
      {/* Desktop collapse toggle */}
      {!isMobileDrawer && onCollapse && (
        <button
          onClick={onCollapse}
          className="absolute -right-3 top-6 z-10 flex size-6 items-center justify-center rounded-full border border-border/30 bg-[#1a1d27] text-white shadow-md hover:bg-[#2a2d3a] transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="size-3" />
          ) : (
            <ChevronLeft className="size-3" />
          )}
        </button>
      )}

      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border/15 px-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal-500 text-white font-bold text-sm">
            S
          </div>
          {(!collapsed || isMobileDrawer) && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold tracking-tight text-white">
                Swiftera
              </p>
              <p className="text-[10px] text-teal-400 truncate">Staff Portal</p>
            </div>
          )}
        </div>
        {isMobileDrawer && onMobileClose && (
          <button
            onClick={onMobileClose}
            className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Hub info */}
      {(!collapsed || isMobileDrawer) && (
        <div className="border-b border-border/15 px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
            Hub hiện tại
          </p>
          <p className="text-xs font-medium text-slate-200 truncate">
            {MOCK_HUB_INFO.name}
          </p>
          <p className="text-[10px] text-slate-500 truncate">
            {MOCK_HUB_INFO.open_hours}
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={isMobileDrawer ? onMobileClose : undefined}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-teal-500/15 text-teal-400'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white',
                item.highlight &&
                  !isActive &&
                  'border border-teal-500/30 bg-teal-500/5 text-teal-400 hover:bg-teal-500/10',
                collapsed && !isMobileDrawer && 'justify-center px-2',
              )}
            >
              <item.icon
                className={cn(
                  'size-4 shrink-0',
                  isActive
                    ? 'text-teal-400'
                    : 'text-slate-500 group-hover:text-white',
                  item.highlight && !isActive && 'text-teal-400',
                )}
              />
              {(!collapsed || isMobileDrawer) && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== null && item.badge > 0 && (
                    <Badge
                      variant="destructive"
                      className="h-4 min-w-4 px-1 text-[10px]"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: notifications + settings + staff */}
      <div className="border-t border-border/15 p-2 space-y-0.5">
        <Link
          href="/dashboard/settings"
          onClick={isMobileDrawer ? onMobileClose : undefined}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-colors',
            collapsed && !isMobileDrawer && 'justify-center',
          )}
        >
          <Settings className="size-4 shrink-0" />
          {(!collapsed || isMobileDrawer) && <span>Cài đặt</span>}
        </Link>

        {/* Staff info */}
        <div
          className={cn(
            'mt-1 flex items-center gap-3 rounded-lg px-3 py-2',
            collapsed && !isMobileDrawer && 'justify-center',
          )}
        >
          <div className="relative shrink-0">
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
            <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-400 ring-1 ring-[#0f1117]" />
          </div>
          {(!collapsed || isMobileDrawer) && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {MOCK_CURRENT_STAFF.full_name}
              </p>
              <p className="text-[10px] text-slate-500 truncate capitalize">
                {MOCK_CURRENT_STAFF.role === 'MANAGER'
                  ? 'Quản lý'
                  : 'Nhân viên'}
              </p>
            </div>
          )}
          {(!collapsed || isMobileDrawer) && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-slate-500 hover:text-red-400"
            >
              <LogOut className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}

export function DashboardSidebar({
  mobileOpen = false,
  onMobileClose,
}: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop sidebar — hidden on mobile */}
      <div className="relative hidden lg:flex">
        <SidebarContent
          collapsed={collapsed}
          onCollapse={() => setCollapsed((c) => !c)}
        />
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile slide-in drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-full lg:hidden transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <SidebarContent
          collapsed={false}
          onMobileClose={onMobileClose}
          isMobileDrawer
        />
      </div>

      {/* Mobile bottom navigation bar */}
      <nav className="fixed bottom-0 inset-x-0 z-30 flex h-16 items-stretch border-t border-border/20 bg-[#0f1117] lg:hidden">
        {NAV_ITEMS.map((item) => (
          <MobileNavItem key={item.href} item={item} />
        ))}
      </nav>
    </>
  );
}

function MobileNavItem({ item }: { item: (typeof NAV_ITEMS)[number] }) {
  const pathname = usePathname();
  const isActive =
    item.href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      className={cn(
        'relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
        isActive ? 'text-teal-400' : 'text-slate-500',
        item.highlight && !isActive && 'text-teal-400',
      )}
    >
      <div className="relative">
        <item.icon className="size-5" />
        {item.badge !== null && item.badge > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex size-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
            {item.badge > 9 ? '9+' : item.badge}
          </span>
        )}
      </div>
      <span>{item.label}</span>
      {isActive && (
        <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-teal-500" />
      )}
    </Link>
  );
}
