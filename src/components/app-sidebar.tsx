'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  QrCode,
  MapPin,
  Settings,
  LifeBuoy,
  Zap,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { NavUser } from '@/components/nav-user';
import { MOCK_CURRENT_STAFF, MOCK_HUB_INFO } from '@/data/mockDashboard';

const NAV_ITEMS = [
  { title: 'Tổng quan', url: '/dashboard', icon: LayoutDashboard, exact: true },
  {
    title: 'Đơn hàng',
    url: '/dashboard/orders',
    icon: ShoppingBag,
    exact: false,
  },
  {
    title: 'Sản phẩm',
    url: '/dashboard/products',
    icon: Package,
    exact: false,
  },
  {
    title: 'Quét mã QR',
    url: '/dashboard/scanner',
    icon: QrCode,
    exact: false,
  },
  { title: 'Bản đồ giao hàng', url: '/map', icon: MapPin, exact: false },
] as const;

const SECONDARY_ITEMS = [
  { title: 'Hỗ trợ', url: '#', icon: LifeBuoy },
  { title: 'Cài đặt', url: '#', icon: Settings },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
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
            {NAV_ITEMS.map((item) => {
              const isActive = item.exact
                ? pathname === item.url
                : pathname === item.url || pathname.startsWith(item.url + '/');
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={isActive}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
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
