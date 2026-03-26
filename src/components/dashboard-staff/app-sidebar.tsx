'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation'; // Thêm useSearchParams
import {
  LayoutDashboard,
  ShoppingBag,
  Settings,
  LifeBuoy,
  Zap,
  ChevronRight,
  Clock,
  Truck,
  Package,
  RotateCcw,
  CheckCircle2,
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
  SidebarSeparator,
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
import { cn } from '@/lib/utils';

const ORDER_WORKFLOW_TABS = [
  {
    title: 'Chờ xác nhận',
    url: '/staff-dashboard/orders?status=PENDING',
    statuses: ['PENDING'] as const,
    dotClass: 'bg-amber-400',
    urgency: true,
    icon: Clock,
  },
  {
    title: 'Đang giao hàng',
    url: '/staff-dashboard/orders?status=DELIVERING',
    statuses: ['DELIVERING'] as const,
    dotClass: 'bg-info animate-pulse',
    urgency: false,
    icon: Truck,
  },
  {
    title: 'Đang thuê',
    url: '/staff-dashboard/orders?status=ACTIVE',
    statuses: ['ACTIVE'] as const,
    dotClass: 'bg-success',
    urgency: false,
    icon: Package,
  },
  {
    title: 'Cần thu hồi',
    url: '/staff-dashboard/orders?status=RETURNING',
    statuses: ['RETURNING'] as const,
    dotClass: 'bg-destructive animate-pulse',
    urgency: true,
    icon: RotateCcw,
  },
  {
    title: 'Đã quá hạn',
    url: '/staff-dashboard/orders?status=OVERDUE',
    statuses: ['OVERDUE'] as const,
    dotClass: 'bg-destructive animate-pulse',
    urgency: true,
    icon: RotateCcw,
  },
  {
    title: 'Đã hoàn thành',
    url: '/staff-dashboard/orders?status=COMPLETED',
    statuses: ['COMPLETED'] as const,
    dotClass: 'bg-success',
    urgency: false,
    icon: CheckCircle2,
  },
] as const;

const SECONDARY_ITEMS = [
  { title: 'Hỗ trợ', url: '#', icon: LifeBuoy },
  { title: 'Cài đặt', url: '#', icon: Settings },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const searchParams = useSearchParams(); // Lấy query params trên URL
  const currentStatus = searchParams.get('status');

  const isDashboardActive = pathname === '/dashboard';
  const isOrdersActive =
    pathname === '/staff-dashboard/orders' ||
    pathname.startsWith('/staff-dashboard/orders/');

  // Controlled open state — avoids the Base UI "uncontrolled → defaultOpen changed" warning
  const [ordersOpen, setOrdersOpen] = React.useState(isOrdersActive);
  React.useEffect(() => {
    if (isOrdersActive) setOrdersOpen(true);
  }, [isOrdersActive]);

  const orderCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    MOCK_ORDERS.forEach((o) => {
      counts[o.status] = (counts[o.status] ?? 0) + 1;
    });
    return counts;
  }, []);

  const urgentTotal =
    (orderCounts['RETURNING'] ?? 0) +
    (orderCounts['OVERDUE'] ?? 0) +
    (orderCounts['PENDING'] ?? 0);

  const totalOrders = Object.values(orderCounts).reduce((a, b) => a + b, 0);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-linear-to-br from-theme-primary-start to-theme-primary-end text-white shadow-md">
                <Zap className="size-4" />
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-bold text-sidebar-foreground tracking-tight">
                  Swiftera
                </span>
                <span className="truncate text-[11px] text-sidebar-foreground/55 font-medium">
                  {MOCK_HUB_INFO.name}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold uppercase tracking-widest text-sidebar-foreground/40 px-4">
            Nhân viên
          </SidebarGroupLabel>
          <SidebarMenu>
            {/* Tổng quan */}
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link href="/dashboard" />}
                isActive={isDashboardActive}
                tooltip="Tổng quan"
                className={cn(
                  'gap-3 transition-colors',
                  isDashboardActive &&
                    'bg-sidebar-accent text-sidebar-accent-foreground font-semibold',
                )}
              >
                <LayoutDashboard className="size-4" />
                <span className="text-[16px] font-bold">Tổng quan</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Đơn hàng — collapsible */}
            <Collapsible
              open={ordersOpen}
              onOpenChange={setOrdersOpen}
              render={<SidebarMenuItem />}
            >
              <SidebarMenuButton
                render={<Link href="/staff-dashboard/orders" />}
                isActive={isOrdersActive && !currentStatus}
                tooltip="Đơn hàng"
                className={cn(
                  'gap-3 transition-colors',
                  isOrdersActive &&
                    !currentStatus &&
                    'bg-sidebar-accent text-sidebar-accent-foreground font-semibold',
                )}
              >
                <ShoppingBag className="size-4" />
                <span className="text-[16px] font-bold">Đơn hàng</span>
                {urgentTotal > 0 && (
                  <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white tabular-nums">
                    {urgentTotal}
                  </span>
                )}
              </SidebarMenuButton>
              <SidebarMenuAction
                render={<CollapsibleTrigger />}
                className={cn(
                  'aria-expanded:rotate-90 transition-transform duration-200',
                  urgentTotal > 0 ? 'right-4' : '',
                )}
              >
                <ChevronRight className="size-6" />
                <span className="sr-only">Mở rộng</span>
              </SidebarMenuAction>
              <CollapsibleContent>
                <SidebarMenuSub className="ml-4 mt-0.5 w-full">
                  {ORDER_WORKFLOW_TABS.map((tab) => {
                    const count = tab.statuses.reduce(
                      (s, st) => s + (orderCounts[st] ?? 0),
                      0,
                    );
                    // Check xem sub-tab này có phải là tab đang xem không
                    const isTabActive =
                      pathname === '/staff-dashboard/orders' &&
                      currentStatus === tab.statuses[0];

                    return (
                      <SidebarMenuSubItem key={tab.title}>
                        <SidebarMenuSubButton
                          render={<Link href={tab.url} />}
                          isActive={isTabActive}
                          className={cn(
                            'py-4 transition-colors',
                            isTabActive &&
                              'bg-sidebar-accent text-sidebar-accent-foreground font-semibold',
                          )}
                        >
                          <span
                            className={cn(
                              'size-1.5 shrink-0 rounded-full',
                              tab.dotClass,
                            )}
                          />
                          <span className="flex-1 truncate text-sm">
                            {tab.title}
                          </span>
                          {count > 0 && (
                            <span
                              className={cn(
                                'mr-4 min-w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold tabular-nums shrink-0',
                                tab.urgency
                                  ? 'bg-destructive text-white'
                                  : isTabActive
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'bg-sidebar-accent text-sidebar-foreground/60',
                              )}
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
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="px-3 py-0">
          <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3 space-y-2">
            <p className="text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-widest">
              Hôm nay
            </p>
            <div className="grid grid-cols-2 gap-2">
              <QuickStat label="Tổng đơn" value={totalOrders} />
              <QuickStat
                label="Cần xử lý"
                value={urgentTotal}
                urgent={urgentTotal > 0}
              />
            </div>
          </div>
        </SidebarGroup>

        {/* ── Support ──────────────────────────────────────────────── */}
        <SidebarGroup className="mt-auto">
          <SidebarSeparator className="mb-2" />
          <SidebarMenu>
            {SECONDARY_ITEMS.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  render={<Link href={item.url} />}
                  tooltip={item.title}
                  className="gap-3 text-sidebar-foreground/55 hover:text-sidebar-foreground"
                >
                  <item.icon className="size-4" />
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
            role: MOCK_CURRENT_STAFF.role,
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}

function QuickStat({
  label,
  value,
  urgent,
}: {
  label: string;
  value: number;
  urgent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-sidebar-foreground/50 font-medium">
        {label}
      </span>
      <span
        className={cn(
          'text-base font-bold tabular-nums leading-tight',
          urgent && value > 0 ? 'text-destructive' : 'text-sidebar-foreground',
        )}
      >
        {value}
      </span>
    </div>
  );
}
