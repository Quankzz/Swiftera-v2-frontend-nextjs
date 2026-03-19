'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  ChevronRight,
  Heart,
  Menu,
  Search,
  ShoppingCart,
  UserRound,
} from 'lucide-react';
import { topLevelCategories } from '@/data/categories';
import { cn } from '@/lib/utils';
import logo from '../../public/logo.png';

export function Header() {
  const HOVER_BRIDGE_HEIGHT = 10;

  const sortedCategories = useMemo(
    () => [...topLevelCategories].sort((a, b) => a.sortOrder - b.sortOrder),
    [],
  );

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(
    null,
  );

  const hoveredCategoryData = useMemo(
    () => sortedCategories.find((c) => c.categoryId === hoveredCategoryId),
    [hoveredCategoryId, sortedCategories],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <header
        className={cn(
          'top-0 w-full bg-white transition-colors duration-300 shadow-sm',
          isSearchOpen
            ? 'z-50 border-transparent'
            : 'z-40 border-b border-border/20 backdrop-blur',
        )}
      >
        {isSearchOpen && (
          <div
            className='fixed inset-0 z-40 h-screen w-screen bg-black/40 backdrop-blur-xs'
            onClick={() => setIsSearchOpen(false)}
          />
        )}
        <div className='mx-auto max-w-full px-4 py-3 lg:px-18'>
          <div className='flex items-center gap-4 lg:gap-6'>
            <div className='flex items-center gap-3 relative z-30'>
              <Button variant='ghost' size='icon' className='lg:hidden'>
                <Menu className='size-5' />
              </Button>
              {/* <Link href='/' className='flex items-center gap-2'>
                <span className='flex size-9 items-center justify-center rounded-full bg-linear-to-r from-theme-primary-start to-theme-primary-end text-white shadow-md'>
                  <span className='text-lg font-extrabold'>S</span>
                </span>
                <span className='text-2xl font-extrabold tracking-tight text-foreground'>
                  Swiftera
                </span>
              </Link> */}
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
            <div></div>

            <div className='relative hidden flex-1 lg:flex z-50'>
              <div
                className={cn(
                  'flex h-12 w-full max-w-2xl cursor-text items-center rounded-full border border-border/60 bg-white px-4 shadow-sm transition-all',
                )}
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className='mr-3 size-5 text-text-sub' />
                <input
                  type='text'
                  placeholder='Search for streaming devices, phones, consoles...'
                  className='w-full border-none bg-transparent text-sm text-text-main placeholder:text-text-sub focus:outline-none'
                  readOnly={!isSearchOpen}
                />
              </div>

              {isSearchOpen && (
                <div className='absolute -top-2 left-0 z-50 p-2 w-full rounded-3xl bg-white shadow-2xl'>
                  <div className='flex h-12 items-center gap-3 border-2 border-theme-primary-start rounded-full px-4'>
                    <Search className='size-5 text-text-sub' />
                    <input
                      type='text'
                      autoFocus
                      placeholder='Search for streaming devices, phones, consoles...'
                      className='flex-1 border-none bg-transparent text-sm text-text-main placeholder:text-text-sub focus:outline-none'
                    />
                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSearchOpen(false);
                      }}
                      className='flex size-8 items-center justify-center rounded-full hover:bg-gray-100'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='18'
                        height='18'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='text-text-sub'
                      >
                        <path d='M18 6 6 18' />
                        <path d='m6 6 12 12' />
                      </svg>
                    </button>
                  </div>

                  <div className='p-6'>
                    <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
                      {sortedCategories.slice(0, 8).map((category) => {
                        return (
                          <button
                            type='button'
                            key={category.categoryId}
                            className='group flex flex-col items-center justify-center gap-3 rounded-2xl bg-gray-50/50 p-4 transition-colors hover:bg-gray-100'
                          >
                            {category.image && (
                              <div className='relative h-20 w-20 overflow-hidden mix-blend-multiply'>
                                <Image
                                  src={category.image}
                                  alt={category.name}
                                  fill
                                  className='object-contain aspect-square'
                                />
                              </div>
                            )}
                            <span className='text-sm font-medium text-text-main'>
                              {category.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className='relative z-30 ml-auto flex items-center gap-2 lg:gap-3'>
              <Button variant='ghost' size='icon' aria-label='Wishlist'>
                <Heart className='size-5 text-text-main' />
              </Button>
              <Button variant='ghost' size='icon' aria-label='Account'>
                <UserRound className='size-5 text-text-main' />
              </Button>
              <Button variant='ghost' size='icon' aria-label='Cart'>
                <ShoppingCart className='size-5 text-text-main' />
              </Button>
              <Button
                variant='secondary'
                size='icon'
                className='hidden rounded-full bg-foreground text-white hover:bg-foreground/90 lg:inline-flex'
                aria-label='More actions'
              >
                <Menu className='size-5' />
              </Button>
            </div>
          </div>

          <div
            className='relative hidden lg:block'
            onMouseLeave={() => setHoveredCategoryId(null)}
          >
            <div className='relative z-30 mt-3 hidden flex-wrap items-center gap-6 text-sm font-semibold text-text-main lg:flex'>
              {sortedCategories.map((category) => (
                <div key={category.categoryId}>
                  <Link
                    href={`/${category.slug}`}
                    onMouseEnter={() =>
                      setHoveredCategoryId(category.categoryId)
                    }
                    className={cn(
                      `flex items-center gap-2 rounded-full ${category.sortOrder === 1 ? 'pr-3' : 'px-3'} py-2 transition-colors shrink-0`,
                      hoveredCategoryId === category.categoryId
                        ? 'text-theme-primary-start'
                        : 'hover:text-theme-primary-start',
                    )}
                  >
                    {category.name}
                  </Link>
                </div>
              ))}
            </div>

            <div
              className='absolute left-0 top-full w-full'
              style={{ height: HOVER_BRIDGE_HEIGHT }}
              aria-hidden
            />

            {/* Global Full-Width Mega Menu Dropdown */}
            {hoveredCategoryData &&
            (hoveredCategoryData.children?.length ||
              hoveredCategoryData.brands?.length) ? (
              <div
                className='absolute left-1/2 w-screen -translate-x-1/2 border-t border-border/40 bg-white shadow-xl animate-in fade-in slide-in-from-top-1 z-50 cursor-default'
                style={{ top: `calc(100% + ${HOVER_BRIDGE_HEIGHT}px)` }}
                onMouseEnter={() =>
                  setHoveredCategoryId(hoveredCategoryData.categoryId)
                }
              >
                <div className='mx-auto max-w-full px-4 py-4 lg:px-18 flex gap-32'>
                  {hoveredCategoryData.children &&
                    hoveredCategoryData.children.length > 0 && (
                      <div className='w-70 shrink-0'>
                        <h3 className='text-lg font-bold text-text-main mb-6'>
                          {hoveredCategoryData.name}
                        </h3>
                        <ul className='space-y-2'>
                          {hoveredCategoryData.children.map((child) => (
                            <li
                              key={child.categoryId}
                              className='group/child relative'
                            >
                              <Link
                                href={`/${child.slug}`}
                                className='flex items-center justify-between py-2 text-text-main hover:text-theme-primary-start font-medium transition-colors'
                              >
                                {child.name}
                                {child.children &&
                                  child.children.length > 0 && (
                                    <ChevronRight className='size-5 text-text-sub group-hover/child:text-theme-primary-start transition-colors' />
                                  )}
                              </Link>

                              {/* Sub-menu level 3 */}
                              {child.children && child.children.length > 0 && (
                                <div className='absolute left-full top-0 pl-8 hidden group-hover/child:block z-50'>
                                  <div className='w-64 rounded-2xl bg-white shadow-xl border border-gray-100 p-4'>
                                    <ul className='space-y-1.5'>
                                      {child.children.map((subChild) => (
                                        <li key={subChild.categoryId}>
                                          <Link
                                            href={`/${subChild.slug}`}
                                            className='block px-4 py-2.5 rounded-xl hover:bg-rose-50/50 text-text-main hover:text-theme-primary-start text-sm font-medium transition-colors'
                                          >
                                            {subChild.name}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {hoveredCategoryData.brands &&
                    hoveredCategoryData.brands.length > 0 && (
                      <div className='w-70 shrink-0'>
                        <h3 className='text-lg font-bold text-color-text-main mb-6'>
                          Brands
                        </h3>
                        <ul className='space-y-2'>
                          {hoveredCategoryData.brands.map((brand, index) => (
                            <li key={index}>
                              <Link
                                href={`/brands/${brand.toLowerCase()}`}
                                className='block py-2 text-text-main hover:text-theme-primary-start font-medium transition-colors'
                              >
                                {brand}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>
    </>
  );
}
