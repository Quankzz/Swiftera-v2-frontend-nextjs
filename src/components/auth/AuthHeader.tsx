'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/theme-context';
import { Button } from '@/components/ui/button';

function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="size-8" />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      aria-label={resolvedTheme === 'dark' ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
  );
}

export function AuthHeader() {
  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-black/5 bg-white/30 backdrop-blur-md dark:border-white/10 dark:bg-zinc-950/30">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="group flex items-center gap-2 text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <Home className="size-5 sm:hidden" />
          <ArrowLeft className="hidden size-4 transition-transform group-hover:-translate-x-1 sm:block" />
          <span className="hidden text-sm font-medium sm:inline">Trang chủ</span>
        </Link>

        <Link
          href="/"
          className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100"
        >
          Swiftera
        </Link>

        <ThemeToggle />
      </nav>
    </header>
  );
}
