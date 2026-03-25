'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import {
  Moon,
  Sun,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  X,
} from 'lucide-react';
import { useTheme } from '@/context/theme-context';
import { Button } from '@/components/ui/button';

const PAGE_TITLES: Record<string, { title: string; description: string }> = {
  '/dashboard': { title: 'Tổng quan', description: 'Xem tổng quan hệ thống' },
  '/dashboard/users': {
    title: 'Quản lý người dùng',
    description: 'Xem, thêm mới, sửa hoặc xóa người dùng',
  },
  '/dashboard/products': {
    title: 'Quản lý sản phẩm',
    description: 'Xem, thêm mới, sửa hoặc xóa sản phẩm cho thuê',
  },
  '/dashboard/roles': {
    title: 'Quản lý vai trò',
    description: 'Xem, thêm mới, sửa và phân quyền cho vai trò',
  },
  '/dashboard/permissions': {
    title: 'Cấu hình phân quyền',
    description: 'Quản lý các quyền API của hệ thống',
  },
};

const ADMIN = { name: 'Admin', email: 'admin@swiftera.com', initials: 'AD' };

const NOTIFICATIONS = [
  { text: 'Người dùng mới đăng ký', time: '2 phút trước' },
  { text: 'Yêu cầu phê duyệt vai trò', time: '15 phút trước' },
  { text: 'Hệ thống cập nhật thành công', time: '1 giờ trước' },
];

function useOutsideClick(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void,
) {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

export function DashboardHeader() {
  const pathname = usePathname();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useOutsideClick(
    notifRef,
    useCallback(() => setNotifOpen(false), []),
  );
  useOutsideClick(
    profileRef,
    useCallback(() => setProfileOpen(false), []),
  );

  const page = PAGE_TITLES[pathname] ?? { title: 'Dashboard', description: '' };

  return (
    <header className='sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 dark:border-white/8 bg-white/90 dark:bg-[#0f0f11]/95 px-4 backdrop-blur shrink-0'>
      {/* Left — page title */}
      {/* <div className='hidden sm:flex flex-col min-w-0'>
        <h1 className='text-sm font-semibold text-text-main leading-none truncate'>
          {page.title}
        </h1>
        {page.description && (
          <p className='text-xs text-text-sub mt-0.5 truncate'>
            {page.description}
          </p>
        )}
      </div> */}

      {/* Right — actions */}
      <div className='flex items-center gap-1 ml-auto'>
        {/* Theme toggle */}
        <Button
          variant='ghost'
          size='icon'
          onClick={toggleTheme}
          className='h-8 w-8 text-text-sub hover:text-text-main'
          title={
            resolvedTheme === 'dark' ? 'Chuyển sang sáng' : 'Chuyển sang tối'
          }
        >
          {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </Button>

        {/* Notifications */}
        <div ref={notifRef} className='relative'>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className='relative flex h-8 w-8 items-center justify-center rounded-md text-text-sub hover:text-text-main hover:bg-gray-100 dark:hover:bg-white/8 transition-colors'
          >
            <Bell size={16} />
            <span className='absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-theme-primary-start text-[9px] flex items-center justify-center text-white font-bold'>
              {NOTIFICATIONS.length}
            </span>
          </button>

          {notifOpen && (
            <div className='absolute right-0 top-10 w-76 rounded-xl border border-gray-200 dark:border-white/8 bg-white dark:bg-[#1a1a1f] shadow-lg dark:shadow-black/30 overflow-hidden z-50'>
              <div className='flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/8'>
                <span className='text-sm font-semibold text-text-main'>
                  Thông báo
                </span>
                <button
                  onClick={() => setNotifOpen(false)}
                  className='text-text-sub hover:text-text-main'
                >
                  <X size={14} />
                </button>
              </div>
              <div className='divide-y divide-gray-50 dark:divide-white/5'>
                {NOTIFICATIONS.map((n, i) => (
                  <div
                    key={i}
                    className='px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/8 cursor-pointer transition-colors'
                  >
                    <p className='text-sm text-text-main'>{n.text}</p>
                    <p className='text-xs text-text-sub mt-0.5'>{n.time}</p>
                  </div>
                ))}
              </div>
              <div className='px-4 py-2 border-t border-gray-100 dark:border-white/8 text-center'>
                <button className='text-sm text-theme-primary-start hover:underline'>
                  Xem tất cả thông báo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div ref={profileRef} className='relative'>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className='flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors'
          >
            <div className='h-7 w-7 rounded-full bg-theme-primary-start/15 flex items-center justify-center'>
              <span className='text-xs font-bold text-theme-primary-start'>
                {ADMIN.initials}
              </span>
            </div>
            <div className='hidden sm:flex flex-col items-start'>
              <span className='text-xs font-semibold text-text-main leading-none'>
                {ADMIN.name}
              </span>
              <span className='text-[10px] text-text-sub leading-none mt-0.5'>
                {ADMIN.email}
              </span>
            </div>
            <ChevronDown size={14} className='text-text-sub' />
          </button>

          {profileOpen && (
            <div className='absolute right-0 top-10 w-52 rounded-xl border border-gray-200 dark:border-white/8 bg-white dark:bg-[#1a1a1f] shadow-lg dark:shadow-black/30 overflow-hidden z-50'>
              <div className='px-4 py-3 border-b border-gray-100 dark:border-white/8'>
                <p className='text-sm font-semibold text-text-main'>
                  {ADMIN.name}
                </p>
                <p className='text-xs text-text-sub'>{ADMIN.email}</p>
              </div>
              <div className='p-1'>
                <button className='flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-main hover:bg-gray-50 dark:hover:bg-white/8 transition-colors'>
                  <User size={14} className='text-text-sub' /> Hồ sơ cá nhân
                </button>
                <button className='flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-main hover:bg-gray-50 dark:hover:bg-white/8 transition-colors'>
                  <Settings size={14} className='text-text-sub' /> Cài đặt
                </button>
                <div className='my-1 h-px bg-gray-100 dark:bg-white/8' />
                <button className='flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-theme-primary-start hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors'>
                  <LogOut size={14} /> Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
