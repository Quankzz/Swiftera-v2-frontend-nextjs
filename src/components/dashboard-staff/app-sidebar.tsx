'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Settings,
  LifeBuoy,
  Zap,
  ChevronRight,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { NavUser } from '@/components/dashboard-staff/nav-user';
import {
  MOCK_CURRENT_STAFF,
  MOCK_HUB_INFO,
  MOCK_ORDERS,
} from '@/data/mockDashboard';

// ─── Order workflow sub-tabs (only what staff needs to act on) ───────────────
const ORDER_WORKFLOW_TABS = [
  {
    title: 'Chờ xác nhận',
    url: '/dashboard/orders?status=PENDING',
    status: 'PENDING',
    dotClass: 'bg-amber-400',
    urgency: true,
  },
  {
    title: 'Đang giao hàng',
    url: '/dashboard/orders?status=DELIVERING',
    status: 'DELIVERING',
    dotClass: 'bg-sky-400',
    urgency: false,
  },
  {
    title: 'Đang thuê',
    url: '/dashboard/orders?status=ACTIVE',
    status: 'ACTIVE',
    dotClass: 'bg-emerald-500',
    urgency: false,
  },
  {
    title: 'Cần thu hồi',
    url: '/dashboard/orders?status=RETURNING',
    status: ['RETURNING', 'OVERDUE'],
    dotClass: 'bg-destructive',
    urgency: true,
  },
] as const;

const SECONDARY_ITEMS = [
  { title: 'Hỗ trợ', url: '#', icon: LifeBuoy },
  { title: 'Cài đặt', url: '#', icon: Settings },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const isOrdersActive =
    pathname === '/dashboard/orders' ||
    pathname.startsWith('/dashboard/orders/');

  // Pre-compute per-status count from mock data
  const orderCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    MOCK_ORDERS.forEach((o) => {
      counts[o.status] = (counts[o.status] ?? 0) + 1;
    });
    return counts;
  }, []);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-linear-to-br from-theme-primary-start to-theme-primary-end text-white shadow-md ambient-glow">
                <Zap className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-sidebar-foreground">
                  Swiftera
                </span>
                <span className="truncate text-xs text-sidebar-foreground/60">
                  {MOCK_HUB_INFO.name}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Nhân viên portal</SidebarGroupLabel>
          <SidebarMenu>
            {/* Tổng quan */}
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link href="/dashboard" />}
                isActive={pathname === '/dashboard'}
                tooltip="Tổng quan"
              >
                <LayoutDashboard />
                <span>Tổng quan</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Đơn hàng — collapsible with workflow tabs */}
            <Collapsible
              defaultOpen={isOrdersActive}
              render={<SidebarMenuItem />}
            >
              <SidebarMenuButton
                render={<Link href="/dashboard/orders" />}
                isActive={isOrdersActive}
                tooltip="Đơn hàng"
              >
                <ShoppingBag />
                <span>Đơn hàng</span>
              </SidebarMenuButton>
              <SidebarMenuAction
                render={<CollapsibleTrigger />}
                className="aria-expanded:rotate-90 transition-transform duration-200"
              >
                <ChevronRight className="size-3.5" />
                <span className="sr-only">Mở rộng</span>
              </SidebarMenuAction>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {ORDER_WORKFLOW_TABS.map((tab) => {
                    const count = Array.isArray(tab.status)
                      ? tab.status.reduce(
                          (s, st) => s + (orderCounts[st] ?? 0),
                          0,
                        )
                      : (orderCounts[tab.status as string] ?? 0);
                    return (
                      <SidebarMenuSubItem key={tab.title}>
                        <SidebarMenuSubButton render={<Link href={tab.url} />}>
                          <span
                            className={`size-2 shrink-0 rounded-full ${tab.dotClass}`}
                          />
                          <span className="flex-1 truncate">{tab.title}</span>
                          {count > 0 && (
                            <span
                              className={`ml-auto min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center text-[11px] font-bold tabular-nums ${
                                tab.urgency
                                  ? 'bg-destructive text-white'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {count}
                            </span>
                          )}
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    );
                  })}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>

            {/* Sản phẩm — removed; managed by admin */}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Hỗ trợ</SidebarGroupLabel>
          <SidebarMenu>
            {SECONDARY_ITEMS.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  render={<Link href={item.url} />}
                  tooltip={item.title}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: MOCK_CURRENT_STAFF.full_name,
            email: MOCK_CURRENT_STAFF.email,
            avatar: MOCK_CURRENT_STAFF.avatar_url ?? '',
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
