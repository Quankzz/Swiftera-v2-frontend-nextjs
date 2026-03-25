"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Layout } from '@/components/Layout';
import { HeroBanner } from '@/components/home/hero-banner';
import { CategoryCarousel } from '@/components/home/category-carousel';
import { ProductCard } from '@/components/home/product-card';
import { categories } from '@/data/categories';
import { products } from '@/data/products';
import { Button } from '@/components/ui/button';
import { CalendarRange, ShieldCheck, Smile, WalletCards } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Search,
  ArrowRight,
  SearchCheck,
  Rocket,
  RefreshCcw,
} from 'lucide-react';
import { RotatingText } from '@/components/ui/rotate-text';
import { NumberCounter } from '@/components/ui/number-counter';
import { Magnetic } from '@/components/ui/magnetic';
import { HighlightText } from '@/components/ui/highlight-text';
import { RainbowButton } from '@/components/ui/rainbow-button';

const heroSlides = [
  {
    title: 'Thiết bị của bạn.',
    subtitle: 'Theo cách của bạn.',
    description:
      'Sử dụng công nghệ theo nhu cầu với mức phí theo ngày phù hợp ngân sách, không cần trả trước quá lớn.',
    image:
      'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=1400&q=80',
    accent: 'Linh hoạt mỗi ngày',
  },
  {
    title: 'Yêu công nghệ.',
    subtitle: 'Chọn Swiftera.',
    description:
      'Nâng cấp thiết bị dễ dàng, chi phí hợp lý, giao nhanh và đổi trả thuận tiện.',
    image:
      'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1400&q=80',
    accent: 'Nâng cấp nhanh',
  },
  {
    title: 'Thuê thiết bị cao cấp.',
    subtitle: 'Giữ trọn tự do.',
    description:
      'Chọn điện thoại, máy chơi game, laptop và wearables mới nhất với kỳ hạn thuê linh hoạt từ 1 đến 24+ tháng.',
    image:
      'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1400&q=80',
    accent: 'Kỳ hạn linh hoạt',
  },
];

const highlightStats = [
  { icon: Smile, label: '500.000+ khách hàng tin dùng' },
  { icon: WalletCards, label: 'Chi phí theo ngày tiết kiệm' },
  { icon: CalendarRange, label: 'Kỳ hạn thuê từ 1 đến 24+ tháng' },
  { icon: ShieldCheck, label: 'Có gói bảo hành & bảo vệ' },
];

// Sản phẩm nổi bật: giá cao nhất trước
const featuredProducts = [...products].sort(
  (a, b) => b.dailyPrice - a.dailyPrice,
);

// Có thể bạn thích: giá thấp nhất trước (entry-level)
const budgetProducts = [...products].sort(
  (a, b) => a.dailyPrice - b.dailyPrice,
);
const stats = [
  { value: 15000, label: 'Active Users', suffix: '+', prefix: '' },
  { value: 100, label: 'Insured Gear', suffix: '%', prefix: '' },
  { value: 4.9, label: 'Member Rating', suffix: '/5', prefix: '', decimals: 1 },
  { value: 24, label: 'Expert Support', suffix: '/7', prefix: '' },
];

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className='px-6 pt-32 pb-16'>
        <div className='mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-12'>
          <div className='lg:col-span-7'>
            <h1 className='mb-8 text-6xl font-extrabold leading-[0.9] tracking-tighter text-foreground md:text-8xl'>
              RENT THE{' '}
              <RotatingText
                words={['FUTURE', 'BEST', 'LATEST', 'PREMIUM']}
                interval={2500}
                className='italic text-teal-600 dark:text-teal-400'
              />{' '}
              IN MINUTES.
            </h1>
            <p className='mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl'>
              Access{' '}
              <HighlightText variant='marker' color='teal' strokeWidth={3}>
                premium products
              </HighlightText>{' '}
              on-demand. From high-end cameras to ergonomic office setups,{' '}
              <HighlightText variant='underline' color='teal' animationDelay={0.3}>
                skip ownership
              </HighlightText>{' '}
              and embrace kinetic living.
            </p>

          {/* Highlight stats */}
          <div className='mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-border/40 dark:border-white/5 bg-white/80 dark:bg-white/4 p-4 shadow-sm md:grid-cols-2 lg:grid-cols-4'>
            {highlightStats.map((item) => (
              <div key={item.label} className='flex items-center gap-3'>
                <span className='flex size-11 items-center justify-center rounded-full bg-rose-50 dark:bg-theme-primary-start/15 text-theme-primary-start'>
                  <item.icon className='size-5' />
                </span>
                <p className='text-sm font-semibold text-text-main'>
                  {item.label}
                </p>
                <p className='text-lg font-bold'>Sony FX3 Cinema</p>
                <div className='mt-2 flex items-center gap-2'>
                  <span className='size-2 animate-pulse rounded-full bg-teal-500' />
                  <span className='text-xs font-medium'>Ready for Rent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Bento Grid */}
      <section className='bg-muted/50 px-6 py-24'>
        <div className='mx-auto max-w-7xl'>
          <div className='mb-16 flex items-end justify-between'>
            <div>
              <span className='mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400'>
                Collections
              </span>
              <h2 className='text-4xl font-bold'>Curated Categories</h2>
            </div>
            <Button
              variant='link'
              className='gap-2 font-bold text-teal-600 dark:text-teal-400'
            >
              Rent Now
              <ArrowRight className='size-4' />
            </Button>
          </div>

          <div className='grid h-[600px] gap-6 md:grid-cols-4'>
            {categories.map((cat) => (
              <Link
                key={cat.title}
                href='/categories'
                className={`group relative cursor-pointer overflow-hidden rounded-xl bg-background ${cat.colSpan} ${cat.rowSpan}`}
              >
                <Image
                  src={cat.image}
                  alt={cat.alt}
                  fill
                  className='object-cover transition-transform duration-700 group-hover:scale-110'
                  unoptimized
                />
                <div className='absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/60 via-transparent to-transparent p-8'>
                  <h3
                    className={`font-bold text-white ${cat.colSpan ? 'text-3xl' : 'text-2xl'}`}
                  >
                    {cat.title}
                  </h3>
                  {cat.desc && (
                    <p className='text-sm text-white/80'>{cat.desc}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className='bg-background px-6 py-24'>
        <div className='mx-auto flex max-w-7xl flex-col items-center gap-20 lg:flex-row'>
          {/* Steps */}
          <div className='order-2 space-y-12 lg:order-1 lg:w-1/2'>
            {howItWorks.map((step) => (
              <div key={step.title} className='group flex gap-8'>
                <Magnetic intensity={0.4} range={80}>
                  <div
                    className={`flex size-16 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${step.bgColor}`}
                  >
                    <step.icon className={`size-7 ${step.iconColor}`} />
                  </div>
                </Magnetic>
                <div>
                  <h4 className='mb-2 text-xl font-bold'>{step.title}</h4>
                  <p className='leading-relaxed text-muted-foreground'>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Danh mục */}
          <section className='mt-14 space-y-6'>
            <div className='flex items-end justify-between'>
              <div>
                <h2 className='text-3xl font-extrabold text-text-main'>
                  Danh mục
                </h2>
                <p className='text-text-sub'>
                  Khám phá thiết bị phù hợp với mọi nhu cầu sống.
                </p>
              </div>
            </div>
            <CategoryCarousel items={categories} />
          </section>

          {/* Sản phẩm nổi bật */}
          <section className='mt-16 space-y-6'>
            <div className='flex items-end justify-between'>
              <div>
                <h2 className='text-3xl font-extrabold text-text-main'>
                  Sản phẩm nổi bật
                </h2>
                <p className='text-text-sub'>
                  Những lựa chọn được thuê nhiều nhất tuần này.
                </p>
              </div>
              <Button variant='link' className='text-rose-600'>
                Xem tất cả
              </Button>
            </div>
            <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
              {featuredProducts.map((product) => (
                <ProductCard key={product.productId} product={product} />
              ))}
            </div>
          </section>

          {/* Có thể bạn thích */}
          <section className='mt-16 space-y-6'>
            <div className='flex items-end justify-between'>
              <div>
                <h2 className='text-3xl font-extrabold text-text-main'>
                  Có thể bạn thích
                </h2>
                <p className='text-text-sub'>
                  Lựa chọn phù hợp túi tiền, chất lượng vẫn đảm bảo.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Signals with Animated Counters */}
      <section className='border-y border-border/10 bg-background px-6 py-16'>
        <div className='mx-auto grid max-w-7xl grid-cols-2 gap-8 md:grid-cols-4'>
          {stats.map((stat) => (
            <div key={stat.label} className='text-center'>
              <p className='text-3xl font-extrabold text-teal-600 dark:text-teal-400'>
                <NumberCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                  decimals={stat.decimals ?? 0}
                  duration={2.5}
                  easing='easeOut'
                />
              </p>
              <p className='mt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground'>
                {stat.label}
              </p>
            </div>
            <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
              {budgetProducts.map((product) => (
                <ProductCard key={product.productId} product={product} />
              ))}
            </div>
          </section>
        </div>
      </section>

      {/* Floating Rent Now FAB */}
      <div className='fixed right-10 bottom-10 z-50'>
        <Magnetic intensity={0.3} range={120}>
          <Link href='/categories'>
            <RainbowButton
              colors={['#006875', '#00e5ff', '#8b5cf6', '#006875']}
              duration={3}
              borderWidth={2}
              className='shadow-lg bg-teal-600 dark:bg-teal-400'
            >
              <Rocket className='size-4' />
              Rent Now
            </RainbowButton>
          </Link>
        </Magnetic>
      </div>
    </Layout>
  );
}
