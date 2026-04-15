'use client';

import { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useCategoryTreeQuery } from '@/features/categories/hooks/use-category-tree';

// React Bits components — loaded client-only (WebGL / motion)
const ParticlesBg = dynamic(() => import('@/components/ui/particles-bg'), {
  ssr: false,
});
const OrbitImages = dynamic(() => import('@/components/ui/orbit-images'), {
  ssr: false,
});

const FALLBACK_SLIDES = [
  {
    title: 'Yêu công nghệ',
    subtitle: 'Chọn Swiftera',
    description:
      'Thuê thiết bị linh hoạt, chi phí hợp lý — giao hàng nhanh, đổi trả dễ dàng.',
    image: '',
  },
];

export function HeroBanner() {
  const { data: categoryTree = [], isLoading } = useCategoryTreeQuery();

  // Each root category becomes one slide; orbit images = root imageUrls only
  const slides = useMemo(() => {
    const roots = categoryTree
      .filter((c) => c.isActive && c.imageUrl)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    if (roots.length === 0) return FALLBACK_SLIDES;

    return roots.map((node) => ({
      title: node.name,
      subtitle: 'Chọn Swiftera',
      description:
        'Thuê thiết bị linh hoạt, chi phí hợp lý — giao hàng nhanh, đổi trả dễ dàng.',
      image: node.imageUrl ?? '',
    }));
  }, [categoryTree]);

  // Collect imageUrls from ALL active root categories for the orbit
  const orbitImages = useMemo(
    () => slides.map((s) => s.image).filter(Boolean),
    [slides],
  );

  const [index, setIndex] = useState(0);
  const current = slides[index] ?? slides[0];

  // Auto-advance slides
  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearTimeout(t);
  }, [index, slides.length]);

  if (!isLoading && !current) return null;

  return (
    <section className='relative min-h-[80vh] overflow-hidden bg-white dark:bg-[#0a0a0a] flex items-center px-6 lg:px-18 py-16'>
      {/* ── Particles background (React Bits) ── */}
      <div aria-hidden className='pointer-events-none absolute inset-0 z-0 opacity-20 dark:opacity-100'>
        <ParticlesBg
          particleCount={200}
          particleSpread={10}
          speed={0.07}
          particleColors={['#000000', '#666666', '#999999']}
          moveParticlesOnHover={false}
          alphaParticles={true}
          particleBaseSize={90}
          sizeRandomness={1.3}
          cameraDistance={20}
          disableRotation={false}
        />
      </div>

      {/* ── Subtle accent orb (top-right) ── */}
      <div
        aria-hidden
        className='pointer-events-none absolute -right-[10%] top-1/4 h-150 w-150 rounded-full bg-theme-primary-start/5 blur-[120px]'
      />

      {/* ── 12-column editorial grid ── */}
      <div className='relative z-10 mx-auto w-full max-w-360 grid grid-cols-12 gap-8 lg:gap-12 items-center'>
        {/* ═══ TYPOGRAPHY COLUMN (col 1–6) ═══ */}
        <div className='col-span-12 lg:col-span-6 flex flex-col'>
          {/* Big editorial headline */}
          <h1 className='font-black leading-[1.1] tracking-tighter text-[clamp(2.5rem,8vw,5rem)] text-gray-900 dark:text-white break-words'>
            Yêu công nghệ
            <span className='text-theme-primary-start'>,</span>
            <br />
            <span
              style={{
                background:
                  'linear-gradient(95deg, var(--theme-primary-start) 0%, #7ecbf7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Chọn Swiftera
            </span>
          </h1>

          {/* Description */}
          <p className='mt-6 max-w-lg text-base md:text-lg font-medium leading-relaxed text-gray-600 dark:text-white/55'>
            Thuê thiết bị linh hoạt, chi phí hợp lý — giao hàng nhanh, đổi trả
            dễ dàng.
          </p>
        </div>

        {/* ═══ ORBIT IMAGERY COLUMN (col 7–12) ═══ */}
        <div className='col-span-12 lg:col-span-6 relative hidden lg:block'>
          <div className='relative h-125 lg:h-162.5 w-full flex items-center justify-center'>
            <OrbitImages
              images={
                orbitImages.length > 0 ? orbitImages : [current?.image ?? '']
              }
              shape='ellipse'
              baseWidth={900}
              radiusX={380}
              radiusY={110}
              rotation={-8}
              duration={32}
              itemSize={120}
              fill={true}
              responsive={true}
              showPath={false}
              pathColor='rgba(128,128,128,0.1)'
            />
          </div>
        </div>
      </div>
    </section>
  );
}
