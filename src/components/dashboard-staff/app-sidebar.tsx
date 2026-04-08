'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { useAuthStore } from '@/stores/auth-store';
import { logout as logoutApi } from '@/api/auth';
import { cn } from '@/lib/utils';

// ── Giao hàng: PAID → PREPARING → DELIVERING → DELIVERED ─────────────────────
const DELIVERY_WORKFLOW_TABS = [
  {
    title: 'Chờ xác nhận',
    url: '/staff-dashboard/orders?status=PAID',
    status: 'PAID',
    dotClass: 'bg-amber-400',
    urgency: true,
    icon: Clock,
  },
  {
    title: 'Đang chuẩn bị',
    url: '/staff-dashboard/orders?status=PREPARING',
    status: 'PREPARING',
    dotClass: 'bg-blue-400 animate-pulse',
    urgency: false,
    icon: Package,
  },
  {
    title: 'Đang giao',
    url: '/staff-dashboard/orders?status=DELIVERING',
    status: 'DELIVERING',
    dotClass: 'bg-info animate-pulse',
    urgency: false,
    icon: Truck,
  },
  {
    title: 'Đã giao',
    url: '/staff-dashboard/orders?status=DELIVERED',
    status: 'DELIVERED',
    dotClass: 'bg-teal-500',
    urgency: false,
    icon: CheckCircle2,
  },
] as const;

// ── Thu hồi: PENDING_PICKUP → PICKING_UP → PICKED_UP → COMPLETED ──────────────
const PICKUP_WORKFLOW_TABS = [
  {
    title: 'Chờ thu hồi',
    url: '/staff-dashboard/orders?status=PENDING_PICKUP',
    status: 'PENDING_PICKUP',
    dotClass: 'bg-orange-400 animate-pulse',
    urgency: true,
    icon: Clock,
  },
  {
    title: 'Đang thu hồi',
    url: '/staff-dashboard/orders?status=PICKING_UP',
    status: 'PICKING_UP',
    dotClass: 'bg-purple-400 animate-pulse',
    urgency: false,
    icon: RotateCcw,
  },
  {
    title: 'Đã lấy hàng',
    url: '/staff-dashboard/orders?status=PICKED_UP',
    status: 'PICKED_UP',
    dotClass: 'bg-indigo-500',
    urgency: false,
    icon: Package,
  },
  {
    title: 'Hoàn thành',
    url: '/staff-dashboard/orders?status=COMPLETED',
    status: 'COMPLETED',
    dotClass: 'bg-success',
    urgency: false,
    icon: CheckCircle2,
  },
] as const;

const SECONDARY_ITEMS = [
  { title: 'Hỗ trợ', url: '#', icon: LifeBuoy },
  { title: 'Cài đặt', url: '#', icon: Settings },
];

const DEFAULT_ORDERS_URL = '/staff-dashboard/orders?status=PAID,PENDING_PICKUP';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status');
  const { user } = useAuthStore();
  console.log(user);
  const staffName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ')
    : '';
  const staffEmail = user?.email ?? '';
  const staffAvatar =
    user?.avatarUrl ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(staffName)}&background=fe1451&color=fff`;
  const hubDisplayName = user?.hubId ?? ''; // will be enriched once hub API populates store

  const isDashboardActive = pathname === '/staff-dashboard';
  const isOrdersActive =
    pathname === '/staff-dashboard/orders' ||
    pathname.startsWith('/staff-dashboard/orders/');
  const isOrdersOverviewActive =
    isOrdersActive &&
    (!currentStatus || currentStatus === 'PAID,PENDING_PICKUP');

  // Controlled open state — avoids the Base UI "uncontrolled → defaultOpen changed" warning
  const [ordersOpen, setOrdersOpen] = React.useState(isOrdersActive);
  React.useEffect(() => {
    if (isOrdersActive) setOrdersOpen(true);
  }, [isOrdersActive]);

  const orderCounts = React.useMemo(() => {
    // Order counts are derived from the orders API via the page components.
    // The sidebar shows aggregate counts; these will be populated in a
    // future iteration via a shared orders context/store.
    return {} as Record<string, number>;
  }, []);

  const urgentTotal =
    (orderCounts['PAID'] ?? 0) + (orderCounts['PENDING_PICKUP'] ?? 0);

  const totalOrders = Object.values(orderCounts).reduce((a, b) => a + b, 0);

  const handleLogout = React.useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Clear local auth state even if backend logout fails.
    } finally {
      useAuthStore.getState().clearAuth();
      router.replace('/auth/login');
    }
  }, [router]);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/staff-dashboard" />}
            >
              <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-linear-to-br from-theme-primary-start to-theme-primary-end text-white shadow-md">
                <Zap className="size-4" />
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-bold text-sidebar-foreground tracking-tight">
                  {staffName}
                </span>
                <span className="truncate text-[11px] text-sidebar-foreground/55 font-medium">
                  {hubDisplayName}
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
                render={<Link href="/staff-dashboard" />}
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
                render={<Link href={DEFAULT_ORDERS_URL} />}
                isActive={isOrdersOverviewActive}
                tooltip="Đơn hàng"
                className={cn(
                  'gap-3 transition-colors',
                  isOrdersOverviewActive &&
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
                  {/* ── Giao hàng ── */}
                  <div className="px-2 pt-2 pb-0.5 text-[9px] font-black uppercase tracking-widest text-sidebar-foreground/35 flex items-center gap-1">
                    <Truck className="size-3" />
                    Giao hàng
                  </div>
                  {DELIVERY_WORKFLOW_TABS.map((tab) => {
                    const count = orderCounts[tab.status] ?? 0;
                    const isTabActive =
                      pathname === '/staff-dashboard/orders' &&
                      currentStatus === tab.status;
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

                  {/* ── Thu hồi ── */}
                  <div className="px-2 pt-3 pb-0.5 text-[9px] font-black uppercase tracking-widest text-sidebar-foreground/35 flex items-center gap-1">
                    <RotateCcw className="size-3" />
                    Thu hồi
                  </div>
                  {PICKUP_WORKFLOW_TABS.map((tab) => {
                    const count = orderCounts[tab.status] ?? 0;
                    const isTabActive =
                      pathname === '/staff-dashboard/orders' &&
                      currentStatus === tab.status;
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
            name: staffName,
            email: staffEmail,
            avatar: staffAvatar,
            role: 'STAFF',
          }}
          onLogout={handleLogout}
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
