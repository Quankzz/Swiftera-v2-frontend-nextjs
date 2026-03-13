import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className='border-t border-border/15 bg-background pt-20 pb-10 px-6'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-20 grid gap-12 md:grid-cols-12'>
          <div className='md:col-span-5'>
            <span className='mb-6 block text-2xl font-extrabold tracking-tight text-foreground'>
              Swiftera
            </span>
            <p className='max-w-sm leading-relaxed text-muted-foreground'>
              The kinetic platform for high-performance product rentals.
              Empowering your creative and professional journey without the
              weight of ownership.
            </p>
          </div>

          <div className='md:col-span-2'>
            <p className='mb-6 font-bold'>Explore</p>
            <ul className='space-y-4 text-sm text-muted-foreground'>
              <li>
                <Link
                  href='/categories'
                  className='transition-colors hover:text-teal-600 dark:hover:text-teal-400'
                >
                  Featured Items
                </Link>
              </li>
              <li>
                <Link
                  href='/pricing'
                  className='transition-colors hover:text-teal-600 dark:hover:text-teal-400'
                >
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link
                  href='/fleet'
                  className='transition-colors hover:text-teal-600 dark:hover:text-teal-400'
                >
                  Rental Fleet
                </Link>
              </li>
            </ul>
          </div>

          <div className='md:col-span-2'>
            <p className='mb-6 font-bold'>Company</p>
            <ul className='space-y-4 text-sm text-muted-foreground'>
              <li>
                <Link
                  href='/about'
                  className='transition-colors hover:text-teal-600 dark:hover:text-teal-400'
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href='/contact'
                  className='transition-colors hover:text-teal-600 dark:hover:text-teal-400'
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href='/careers'
                  className='transition-colors hover:text-teal-600 dark:hover:text-teal-400'
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          <div className='md:col-span-3'>
            <p className='mb-6 font-bold'>Newsletter</p>
            <div className='flex rounded-xl bg-muted p-1'>
              <Input
                type='email'
                placeholder='Email'
                className='flex-1 border-none bg-transparent focus-visible:ring-0'
              />
              <Button
                size='icon'
                className='shrink-0 rounded-lg bg-foreground text-background hover:bg-foreground/80'
              >
                <ArrowRight className='size-4' />
              </Button>
            </div>
          </div>
        </div>

        <div className='flex flex-col items-center justify-between gap-6 border-t border-border/10 pt-8 md:flex-row'>
          <p className='text-xs text-muted-foreground'>
            © {new Date().getFullYear()} Swiftera Inc. All rights reserved.
          </p>
          <div className='flex gap-8 text-xs font-bold text-muted-foreground'>
            <Link
              href='/terms'
              className='transition-colors hover:text-foreground'
            >
              Terms of Service
            </Link>
            <Link
              href='/privacy'
              className='transition-colors hover:text-foreground'
            >
              Privacy Policy
            </Link>
            <Link
              href='/cookies'
              className='transition-colors hover:text-foreground'
            >
              Cookie Settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
