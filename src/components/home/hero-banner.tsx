'use client';

import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroSlide {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  accent?: string;
  /** Tag hiển thị ở floating card nhỏ bên phải */
  tag?: string;
  /** Giá from để hiển thị */
  priceFrom?: string;
}

interface HeroBannerProps {
  slides: HeroSlide[];
}

/** Counter tăng dần từ 0 đến target */
function useCount(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

const STATS = [
  { value: 500, suffix: 'K+', label: 'Khách hàng' },
  { value: 120, suffix: '+', label: 'Thương hiệu' },
  { value: 48, suffix: 'h', label: 'Giao hàng' },
  { value: 99, suffix: '%', label: 'Hài lòng' },
];

function StatItem({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  const count = useCount(value);
  return (
    <div className='flex flex-col items-start'>
      <span className='text-2xl font-black tabular-nums text-white lg:text-3xl'>
        {count.toLocaleString()}
        <span className='text-theme-primary-start'>{suffix}</span>
      </span>
      <span className='text-xs font-medium text-white/50 uppercase tracking-widest'>
        {label}
      </span>
    </div>
  );
}

export function HeroBanner({ slides }: HeroBannerProps) {
  const safeSlides = useMemo(() => slides.filter(Boolean), [slides]);
  const [index, setIndex] = useState(0);
  const current = safeSlides[index] ?? safeSlides[0];

  // Auto-advance
  useEffect(() => {
    if (safeSlides.length <= 1) return;
    const t = setTimeout(
      () => setIndex((i) => (i + 1) % safeSlides.length),
      5000,
    );
    return () => clearTimeout(t);
  }, [index, safeSlides.length]);

  if (!current) return null;

  return (
    <section
      className='relative overflow-hidden rounded-2xl bg-[#0a0a0a]'
      style={{ minHeight: '520px' }}
    >
      {/* ── Decorative geometry ── */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 z-0 overflow-hidden'
      >
        {/* Large circle top-right */}
        <div className='absolute -right-24 -top-24 size-96 rounded-full border border-white/5' />
        <div className='absolute -right-16 -top-16 size-72 rounded-full border border-white/5' />
        {/* Accent blob */}
        <div className='absolute right-1/3 top-0 h-px w-48 bg-linear-to-r from-transparent via-theme-primary-start to-transparent opacity-60' />
        {/* Bottom-left glow */}
        <div className='absolute -bottom-32 -left-32 size-80 rounded-full bg-theme-primary-start/8 blur-3xl' />
        {/* Grid dots pattern */}
        <svg
          className='absolute inset-0 h-full w-full opacity-[0.04]'
          xmlns='http://www.w3.org/2000/svg'
        >
          <defs>
            <pattern
              id='dots'
              x='0'
              y='0'
              width='24'
              height='24'
              patternUnits='userSpaceOnUse'
            >
              <circle cx='1' cy='1' r='1' fill='white' />
            </pattern>
          </defs>
          <rect width='100%' height='100%' fill='url(#dots)' />
        </svg>
      </div>

      {/* ── Main grid ── */}
      <div
        className='relative z-10 grid h-full items-stretch lg:grid-cols-[1fr_420px]'
        style={{ minHeight: '520px' }}
      >
        {/* ═══ LEFT PANEL ═══ */}
        <div className='flex flex-col justify-between gap-6 px-8 py-10 lg:px-14 lg:py-14'>
          {/* Top row: accent tag + slide counter */}
          <div className='flex items-center justify-between'>
            {current.accent && (
              <span className='inline-flex items-center gap-2 rounded-full bg-theme-primary-start/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-theme-primary-start ring-1 ring-theme-primary-start/30'>
                <span className='size-1.5 animate-pulse rounded-full bg-theme-primary-start' />
                {current.accent}
              </span>
            )}
            <span className='ml-auto font-mono text-xs text-white/25 tabular-nums'>
              {String(index + 1).padStart(2, '0')} /{' '}
              {String(safeSlides.length).padStart(2, '0')}
            </span>
          </div>

          {/* Hero text */}
          <div className='flex-1 flex flex-col justify-center'>
            <h1 className='text-[clamp(2.4rem,5vw,4rem)] font-black leading-[1.08] tracking-tight text-white'>
              {current.title}
            </h1>
            <h2
              className='text-[clamp(2.4rem,5vw,4rem)] font-black leading-[1.08] tracking-tight'
              style={{
                background:
                  'linear-gradient(95deg, var(--theme-primary-start) 0%, #ff8fa3 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {current.subtitle}
            </h2>
            <p className='mt-5 max-w-md text-sm leading-relaxed text-white/55 lg:text-base'>
              {current.description}
            </p>

            {/* CTAs */}
            <div className='mt-8 flex flex-wrap items-center gap-3'>
              <button className='group flex items-center gap-2 rounded-xl bg-theme-primary-start px-6 py-3 text-sm font-bold text-white shadow-lg shadow-theme-primary-start/30 transition-all hover:shadow-theme-primary-start/50 hover:brightness-110 active:scale-95'>
                Thuê ngay
                <ArrowRight className='size-4 transition-transform group-hover:translate-x-0.5' />
              </button>
              <button className='rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 active:scale-95'>
                Xem ưu đãi
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className='grid grid-cols-4 gap-4 border-t border-white/8 pt-6'>
            {STATS.map((s) => (
              <StatItem key={s.label} {...s} />
            ))}
          </div>
        </div>

        {/* ═══ RIGHT PANEL ═══ */}
        <div className='relative hidden overflow-hidden border-l border-white/6 bg-white/2 lg:flex lg:flex-col'>
          {/* Slide image — fills the panel */}
          <div className='absolute inset-0'>
            {current.image && (
              <Image
                key={current.image}
                src={current.image}
                alt={current.title}
                fill
                sizes='420px'
                className='object-cover opacity-60 transition-opacity duration-700'
                priority
              />
            )}
            {/* vignette */}
            <div className='absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/40' />
            <div className='absolute inset-0 bg-linear-to-l from-transparent to-[#0a0a0a]/30' />
          </div>

          {/* Floating price card — bottom-left of panel */}
          <div className='absolute bottom-8 left-6 right-6 z-10 rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl'>
            <div className='flex items-end justify-between gap-3'>
              <div>
                <p className='text-[11px] uppercase tracking-widest text-white/40'>
                  Giá thuê từ
                </p>
                <p className='mt-0.5 text-2xl font-black text-white'>
                  {current.priceFrom ?? '65.000 ₫'}
                  <span className='ml-1 text-xs font-normal text-white/40'>
                    / ngày
                  </span>
                </p>
              </div>
              <button className='shrink-0 rounded-xl bg-theme-primary-start px-4 py-2.5 text-xs font-bold text-white transition hover:brightness-110'>
                Đặt thuê
              </button>
            </div>
          </div>

          {/* Slide dots — top-right of panel */}
          <div className='absolute right-4 top-4 z-10 flex flex-col gap-2'>
            {safeSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Slide ${i + 1}`}
                className={cn(
                  'rounded-full transition-all duration-300',
                  i === index
                    ? 'h-6 w-1.5 bg-theme-primary-start'
                    : 'h-1.5 w-1.5 bg-white/25 hover:bg-white/50',
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile slide dots */}
      <div className='relative z-10 flex justify-center gap-1.5 pb-4 lg:hidden'>
        {safeSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === index ? 'w-6 bg-theme-primary-start' : 'w-1.5 bg-white/25',
            )}
          />
        ))}
      </div>
    </section>
  );
}
