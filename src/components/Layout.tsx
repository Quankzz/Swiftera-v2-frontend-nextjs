'use client';

import Link from 'next/link';
import { Header } from './Header';
import { Footer } from './Footer';
import { MainLayout } from '@/layouts/MainLayout';
import { MapPinned, Phone } from 'lucide-react';
import { useCartSync } from '@/hooks/useCartSync';

type LayoutProps = {
  children: React.ReactNode;
  stickyHeader?: boolean;
};

export function Layout({ children, stickyHeader = false }: LayoutProps) {
  useCartSync();

  return (
    <MainLayout>
      <Header stickyHeader={stickyHeader} />
      <main className="min-h-screen flex-1">{children}</main>
      <Footer />

      {/* ── Floating action buttons ── */}
      <div className="fixed right-4 bottom-8 z-50 hidden flex-col gap-3 sm:flex">
        {/* Nút Gọi ngay */}
        <div className="group relative flex items-center justify-end">
          {/* Tooltip */}
          <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-gray-900/90 dark:bg-white/90 dark:text-gray-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg backdrop-blur-sm transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2">
            Gọi ngay
          </span>
          <a
            href="tel:19001234"
            aria-label="Gọi ngay"
            className="flex size-12 items-center justify-center rounded-full bg-theme-primary-start text-white shadow-lg shadow-theme-primary-start/30 ring-2 ring-white dark:ring-white/20 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-theme-primary-start/40 active:scale-95"
          >
            <Phone className="size-5" />
          </a>
        </div>

        {/* Nút Bản đồ */}
        <div className="group relative flex items-center justify-end">
          {/* Tooltip */}
          <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-gray-900/90 dark:bg-white/90 dark:text-gray-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg backdrop-blur-sm transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2">
            Bản đồ
          </span>
          <Link
            href="./map"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Bản đồ"
            className="flex size-12 items-center justify-center rounded-full bg-theme-primary-start text-white shadow-lg shadow-theme-primary-start/30 ring-2 ring-white dark:ring-white/20 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-theme-primary-start/40 active:scale-95"
          >
            <MapPinned className="size-5" />
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
