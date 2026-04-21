'use client';

import { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  ShieldCheck,
  Truck,
  ArrowRight,
  Smartphone,
} from 'lucide-react';
import { useCategoryTreeQuery } from '@/features/categories/hooks/use-category-tree';

// ─── TYPES ──────────────────────────────────────────────────────────────────
export interface CategoryNode {
  isActive: boolean;
  imageUrl?: string | null;
  sortOrder: number;
  name: string;
  slug?: string;
}

export interface SlideData {
  title: string;
  description: string;
  image: string;
  categorySlug?: string;
}

// ─── VALUE PROPS ─────────────────────────────────────────────────────────────
const VALUE_PROPS = [
  {
    icon: Smartphone,
    label: 'Giá thuê theo ngày',
    detail: 'Chỉ từ 120K/ngày — không phí mua đứt',
  },
  {
    icon: ShieldCheck,
    label: 'Cọc minh bạch',
    detail: 'Cọc bằng 30-50% giá trị thiết bị, hoàn đủ khi trả',
  },
  {
    icon: Truck,
    label: 'Giao & thu hồi tận nơi',
    detail: 'Swiftera lo giao máy đến và thu lại khi hết hạn',
  },
];

// ─── FALLBACK SLIDE ───────────────────────────────────────────────────────────
const FALLBACK_SLIDE: SlideData = {
  title: 'Thuê thiết bị công nghệ',
  description:
    'MacBook, camera, drone, thiết bị gaming — thuê theo ngày, cọc minh bạch, giao tận nơi.',
  image: '',
};

// ─── PARTICLES (lazy) ──────────────────────────────────────────────────────────
const ParticlesBg = dynamic(() => import('@/components/ui/particles-bg'), {
  ssr: false,
});

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function HeroBanner() {
  const { data = [], isLoading } = useCategoryTreeQuery();
  const categoryTree = data as CategoryNode[];

  const slides: SlideData[] = useMemo(() => {
    const roots = categoryTree
      .filter((c) => c.isActive && c.imageUrl)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    if (roots.length === 0) return [FALLBACK_SLIDE];

    return roots.slice(0, 5).map((node) => ({
      title: node.name,
      description:
        'Thuê theo ngày, cọc minh bạch, giao tận nơi trên toàn quốc.',
      image: node.imageUrl ?? '',
      categorySlug: (node as { slug?: string }).slug,
    }));
  }, [categoryTree]);

  const [index, setIndex] = useState(0);
  const current = slides[index];

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (!isLoading && slides.length === 0) return null;

  return (
    <section className='relative overflow-hidden bg-background'>
      {/* Particle atmosphere */}
      <div className='absolute inset-0 z-0 opacity-40 dark:opacity-40'>
        <ParticlesBg particleCount={80} speed={0.02} particleBaseSize={60} />
      </div>

      {/* Ambient glow blobs */}
      <div className='pointer-events-none absolute -left-32 top-1/2 -translate-y-1/2 z-0 h-125 w-125 rounded-full bg-rose-500/6 blur-[120px]' />
      <div className='pointer-events-none absolute -right-24 top-1/3 -translate-y-1/2 z-0 h-100 w-100 rounded-full bg-rose-600/5 blur-[100px]' />

      {/* ── MAIN HERO AREA ──────────────────────────────────────── */}
      <div className='relative z-10 mx-auto max-w-7xl px-4 py-14 sm:py-20 lg:py-24'>
        <div className='grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center'>
          {/* ── LEFT: Copy ─────────────────────────────────── */}
          <div className='flex flex-col'>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className='mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-400'
            >
              <span className='relative flex size-2'>
                <span className='absolute inline-flex size-full animate-ping rounded-full bg-rose-400 opacity-75' />
                <span className='relative inline-flex size-2 rounded-full bg-rose-400' />
              </span>
              Cho thuê thiết bị công nghệ cao cấp
            </motion.div>

            {/* Headline */}
            <AnimatePresence mode='wait'>
              <motion.div
                key={current?.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <h1 className='text-4xl font-black leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]'>
                  {current?.title}
                  <br />
                  <span className='bg-linear-to-r from-rose-400 via-rose-500 to-pink-400 bg-clip-text text-transparent'>
                    với giá thuê theo ngày
                  </span>
                </h1>

                <p className='mt-5 max-w-lg text-base leading-relaxed text-foreground/60 sm:text-lg'>
                  {current?.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className='mt-8 flex flex-wrap items-center gap-3'
            >
              <Link
                href='/catalog'
                className='group inline-flex items-center gap-2 rounded-full bg-rose-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/25 transition-all hover:bg-rose-500 hover:shadow-rose-500/40 active:scale-[0.97]'
              >
                Khám phá thiết bị
                <ArrowRight
                  size={16}
                  className='transition-transform group-hover:translate-x-0.5'
                />
              </Link>
              <Link
                href='/catalog'
                className='inline-flex items-center gap-2 rounded-full border border-foreground/15 px-7 py-3.5 text-sm font-medium text-foreground/80 transition-all hover:border-foreground/30 hover:bg-foreground/5 active:scale-[0.97]'
              >
                Xem bảng giá
              </Link>
            </motion.div>

            {/* Value propositions */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className='mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1 lg:gap-4'
            >
              {VALUE_PROPS.map(({ icon: Icon, label, detail }) => (
                <div
                  key={label}
                  className='flex items-start gap-3 rounded-xl border border-foreground/10 bg-foreground/3 p-3'
                >
                  <div className='mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/15'>
                    <Icon className='size-4 text-rose-500 dark:text-rose-400' strokeWidth={2} />
                  </div>
                  <div>
                    <p className='text-sm font-semibold text-foreground/80'>{label}</p>
                    <p className='text-xs text-foreground/40'>{detail}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── RIGHT: Image showcase ────────────────────────── */}
          <div className='hidden lg:block'>
            <div className='relative'>
              {/* Outer glow ring */}
              <div className='absolute inset-0 rounded-3xl bg-linear-to-br from-rose-600/10 via-transparent to-pink-600/10 blur-3xl' />

              {/* Main image card */}
              <div className='relative aspect-4/3 overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/4 shadow-2xl dark:shadow-black/50'>
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={current?.image || 'default'}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className='absolute inset-0'
                  >
                    {current?.image ? (
                      <Image
                        src={current.image}
                        alt={current.title || 'Swiftera'}
                        fill
                        className='object-cover'
                        priority
                      />
                    ) : (
                      <div className='flex size-full items-center justify-center'>
                        <Package
                          className='size-16 text-foreground/10 dark:text-white/10'
                          strokeWidth={1}
                        />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Gradient overlay at bottom */}
                <div className='pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-background to-transparent' />

                {/* Slide indicators */}
                {slides.length > 1 && (
                  <div className='absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2'>
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          i === index
                            ? 'w-6 bg-rose-500 dark:bg-rose-400'
                            : 'w-1 bg-foreground/30 hover:bg-foreground/50 dark:bg-white/30 dark:hover:bg-white/50'
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Floating accent badge */}
              <div className='absolute -bottom-4 -left-4 rounded-xl border border-foreground/10 bg-background/90 px-4 py-3 shadow-xl backdrop-blur-sm dark:border-white/10 dark:bg-[#111]/90'>
                <p className='text-xs text-foreground/40 dark:text-white/40'>Giá thuê từ</p>
                <p className='text-xl font-bold text-foreground dark:text-white'>120K</p>
                <p className='text-xs text-foreground/40 dark:text-white/40'>/ngày</p>
              </div>

              {/* Floating trust badge */}
              <div className='absolute -top-3 -right-3 rounded-xl border border-foreground/10 bg-background/90 px-3 py-2 shadow-xl backdrop-blur-sm dark:border-white/10 dark:bg-[#111]/90'>
                <div className='flex items-center gap-1.5'>
                  <ShieldCheck className='size-3.5 text-emerald-500 dark:text-emerald-400' />
                  <span className='text-xs font-medium text-foreground/70 dark:text-white/70'>
                    Cọc hoàn 100%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
