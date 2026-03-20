'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTheme } from '@/context/theme-context';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Menu, ShoppingCart } from 'lucide-react';
import { useRentalCartStore } from '@/stores/rental-cart-store';

function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className='size-8' />;
  }

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={toggleTheme}
      aria-label={
        resolvedTheme === 'dark' ? 'Chuyển sang sáng' : 'Chuyển sang tối'
      }
    >
      {resolvedTheme === 'dark' ? (
        <Sun className='size-4' />
      ) : (
        <Moon className='size-4' />
      )}
    </Button>
  );
}

function CartLink() {
  const qty = useRentalCartStore((s) => s.lines.reduce((acc, l) => acc + l.quantity, 0));

  return (
    <Button variant='ghost' size='icon' className='relative' render={<Link href='/cart' />} aria-label='Giỏ hàng'>
      <ShoppingCart className='size-5' />
      {qty > 0 && (
        <span className='absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-600 px-1 text-[10px] font-bold text-white dark:bg-teal-500'>
          {qty > 99 ? '99+' : qty}
        </span>
      )}
    </Button>
  );
}

export function Header() {
  return (
    <header className='glass-nav fixed top-0 z-50 w-full border-b border-border/15'>
      <nav className='mx-auto flex h-20 max-w-7xl items-center justify-between px-6'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='icon' className='md:hidden'>
            <Menu className='size-5' />
          </Button>
          <Link
            href='/'
            className='text-2xl font-extrabold tracking-tight text-foreground'
          >
            Swiftera
          </Link>
        </div>

        <div className='hidden gap-10 md:flex'>
          <Link
            href='/categories/tech'
            className='text-sm font-medium transition-colors hover:text-teal-600 dark:hover:text-teal-400'
          >
            Tech
          </Link>
          <Link
            href='/categories/office'
            className='text-sm font-medium transition-colors hover:text-teal-600 dark:hover:text-teal-400'
          >
            Office
          </Link>
          <Link
            href='/categories/gear'
            className='text-sm font-medium transition-colors hover:text-teal-600 dark:hover:text-teal-400'
          >
            Gear
          </Link>
          <Link
            href='/categories/leisure'
            className='text-sm font-medium transition-colors hover:text-teal-600 dark:hover:text-teal-400'
          >
            Leisure
          </Link>
        </div>

        <div className='flex items-center gap-2'>
          <CartLink />
          <ThemeToggle />
          <Button
            variant='secondary'
            className='rounded-full px-6 font-semibold'
            render={<Link href='/auth/login' />}
          >
            Log In
          </Button>
        </div>
      </nav>
    </header>
  );
}
