"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Users,
  ShieldAlert,
  Package,
  LayoutDashboard,
  Menu,
  X,
  ShoppingBag,
  Layers,
  MessageSquare,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Ticket,
  Warehouse,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import logo from "../../../../public/logo.png";

const NAV_GROUPS = [
  {
    label: "Quản trị hệ thống",
    items: [
      { title: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
      { title: "Người dùng", href: "/dashboard/users", icon: Users },
      { title: "Vai trò", href: "/dashboard/roles", icon: Package },
      {
        title: "Phân quyền",
        href: "/dashboard/permissions",
        icon: ShieldAlert,
      },
    ],
  },
  {
    label: "Quản lý sản phẩm",
    items: [
      { title: "Sản phẩm", href: "/dashboard/products", icon: ShoppingBag },
      { title: "Danh mục", href: "/dashboard/categories", icon: Layers },
      {
        title: "Đơn thuê",
        href: "/dashboard/rental-orders",
        icon: ClipboardList,
      },
      {
        title: "Voucher",
        href: "/dashboard/vouchers",
        icon: Ticket,
      },
      {
        title: "Hub",
        href: "/dashboard/hubs",
        icon: Warehouse,
      },
      {
        title: "Phản hồi",
        href: "/dashboard/contact-tickets",
        icon: MessageSquare,
      },
      {
        title: "Chính sách",
        href: "/dashboard/policies",
        icon: ShieldCheck,
      },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-surface-card rounded-md shadow-md dark:shadow-black/30 text-text-main"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:sticky top-0 left-0 h-screen bg-white dark:bg-surface-base border-r border-gray-200 dark:border-white/8 z-40",
          "transform transition-all duration-200 ease-in-out flex flex-col",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          collapsed ? "w-20" : "w-64",
        )}
      >
        {/* Logo + collapse button */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-white/8 shrink-0">
          {!collapsed && (
            <Link href="/" className="flex items-center">
              <Image
                src={logo}
                alt="logo"
                width={130}
                height={36}
                className="object-contain"
              />
            </Link>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className={cn(
              "hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors shrink-0",
              collapsed ? "mx-auto" : "-mr-1",
            )}
            title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-3">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {/* Group card with border */}
              <div className="rounded-xl border border-gray-200 dark:border-white/8 overflow-hidden">
                {/* Group label */}
                {!collapsed && (
                  <div className="px-3 pt-2.5 pb-1.5 bg-gray-50 dark:bg-white/3 border-b border-gray-100 dark:border-white/6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      {group.label}
                    </p>
                  </div>
                )}

                {/* Items */}
                <nav className="p-1.5 space-y-0.5">
                  {group.items.map((item) => {
                    const isActive =
                      item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname === item.href ||
                          pathname?.startsWith(`${item.href}/`);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        title={collapsed ? item.title : undefined}
                        className={cn(
                          "flex items-center rounded-lg text-sm font-medium transition-colors",
                          collapsed
                            ? "justify-center px-0 py-2.5"
                            : "gap-3 px-3 py-2.5",
                          isActive
                            ? "bg-theme-primary-start/10 text-theme-primary-start"
                            : "text-text-main hover:bg-gray-100 dark:hover:bg-white/8 hover:text-text-main",
                        )}
                      >
                        <Icon
                          size={16}
                          className={cn(
                            "shrink-0",
                            isActive
                              ? "text-theme-primary-start"
                              : "text-text-sub",
                          )}
                        />
                        {!collapsed && item.title}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          ))}
        </div>

        {/* User footer */}
        <div className="p-3 border-t border-gray-200 dark:border-white/8 shrink-0">
          {collapsed ? (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-theme-primary-start/20 flex items-center justify-center text-theme-primary-start font-bold text-sm">
                A
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-1">
              <div className="w-8 h-8 rounded-full bg-theme-primary-start/20 flex items-center justify-center text-theme-primary-start font-bold text-sm shrink-0">
                A
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-main truncate">
                  Admin
                </p>
                <p className="text-xs text-text-sub truncate">
                  admin@swiftera.com
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
