'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { useState } from 'react';
import logo from '../../../../public/logo.png';

const navItems = [
  {
    title: 'Tổng quan',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Người dùng',
    href: '/dashboard/users',
    icon: Users,
  },
  {
    title: 'Sản phẩm',
    href: '/dashboard/products',
    icon: ShoppingBag,
  },
  {
    title: 'Danh mục',
    href: '/dashboard/categories',
    icon: Layers,
  },
  {
    title: 'Phản hồi',
    href: '/dashboard/contact-tickets',
    icon: MessageSquare,
  },
  {
    title: 'Vai trò',
    href: '/dashboard/roles',
    icon: Package,
  },
  {
    title: 'Phân quyền',
    href: '/dashboard/permissions',
    icon: ShieldAlert,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        className='md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-[#1a1a1f] rounded-md shadow-md dark:shadow-black/30 text-text-main'
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          className='md:hidden fixed inset-0 bg-black/50 z-40'
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-[#0f0f11] border-r border-gray-200 dark:border-white/8 z-40
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}
      >
        <div className='flex items-center h-16 px-6 border-b border-gray-200 dark:border-white/8'>
          {/* <span className='text-xl font-bold text-theme-primary-start'>
            Swiftera Panel
          </span> */}

          <Link href='/' className='flex items-center gap-2'>
            <Image
              src={logo}
              alt='logo'
              width={150}
              height={40}
              className='object-contain'
            />
          </Link>
        </div>

        <div className='p-4 flex-1 overflow-y-auto'>
          <div className='text-xs font-semibold text-text-sub uppercase tracking-wider mb-4 mt-2 px-2'>
            Quản trị hệ thống
          </div>
          <nav className='space-y-1'>
            {navItems.map((item) => {
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname === item.href ||
                    pathname?.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                    ${
                      isActive
                        ? 'bg-theme-primary-start/10 text-theme-primary-start'
                        : 'text-text-main hover:bg-gray-100 dark:hover:bg-white/8'
                    }
                  `}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 ${isActive ? 'text-theme-primary-start' : 'text-text-sub'}`}
                  />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className='p-4 border-t border-gray-200 dark:border-white/8'>
          <div className='flex items-center gap-3 px-2'>
            <div className='w-8 h-8 rounded-full bg-theme-primary-start/20 flex items-center justify-center text-theme-primary-start font-bold'>
              A
            </div>
            <div>
              <p className='text-sm font-medium text-text-main'>Admin</p>
              <p className='text-xs text-text-sub'>admin@swiftera.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
