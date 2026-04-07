'use client';

import { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// React Bits components — loaded client-only (WebGL / motion)
const ParticlesBg = dynamic(() => import('@/components/ui/particles-bg'), {
  ssr: false,
});
const OrbitImages = dynamic(() => import('@/components/ui/orbit-images'), {
  ssr: false,
});

interface HeroSlide {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  orbitImages?: string[];
  accent?: string;
  tag?: string;
  priceFrom?: string;
}

interface HeroBannerProps {
  slides: HeroSlide[];
}

export function HeroBanner({ slides }: HeroBannerProps) {
  const safeSlides = useMemo(() => slides.filter(Boolean), [slides]);
  const [index, setIndex] = useState(0);

  // Ảnh orbit: dùng orbitImages riêng của slide nếu có, fallback về tất cả ảnh slides
  const orbitImages = useMemo(() => {
    const slide = safeSlides[index] ?? safeSlides[0];
    if (slide?.orbitImages?.length) return slide.orbitImages;
    return safeSlides.map((s) => s.image).filter(Boolean);
  }, [index, safeSlides]);

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
    <section className='relative min-h-screen overflow-hidden bg-[#0a0a0a] flex items-center lg:px-18 py-16'>
      {/* ── Particles background (React Bits) ── */}
      <div aria-hidden className='pointer-events-none absolute inset-0 z-0'>
        <ParticlesBg
          particleCount={200}
          particleSpread={10}
          speed={0.07}
          particleColors={['#ffffff', '#c8d6e5', '#a4b8cc']}
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
          <h1 className='font-black leading-[0.88] tracking-tighter text-[clamp(3.5rem,10vw,7rem)] text-white'>
            {current.title}
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
              {current.subtitle}
            </span>
          </h1>

          {/* Description */}
          <p className='mt-8 max-w-lg text-lg font-medium leading-relaxed text-white/55 lg:text-xl'>
            {current.description}
          </p>

          {/* Stats row */}
          {/* <div className='mt-12 flex flex-wrap items-center gap-8 border-t border-white/8 pt-8'>
            {[
              { value: '500K+', label: 'Khách hàng tin dùng' },
              { value: '120+', label: 'Thương hiệu đối tác' },
              { value: '48h', label: 'Giao hàng nhanh' },
              { value: '99%', label: 'Khách hài lòng' },
            ].map((s) => (
              <div key={s.label} className='flex flex-col'>
                <span className='text-2xl font-black text-white lg:text-3xl'>
                  {s.value}
                </span>
                <span className='mt-0.5 text-[11px] font-medium uppercase tracking-widest text-white/35'>
                  {s.label}
                </span>
              </div>
            ))}
          </div> */}
        </div>

        {/* ═══ ORBIT IMAGERY COLUMN (col 7–12) ═══ */}
        <div className='col-span-12 lg:col-span-6 relative hidden lg:block'>
          <div className='relative h-125 lg:h-162.5 w-full flex items-center justify-center'>
            {/* OrbitImages — Ellipse shape (React Bits) */}
            <OrbitImages
              images={orbitImages.length > 0 ? orbitImages : [current.image]}
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
              pathColor='rgba(255,255,255,0.06)'
            />

            {/* Price badge — floating center-bottom */}
            {/* <div className='absolute bottom-8 left-1/2 z-20 -translate-x-1/2 rounded-2xl border border-white/10 bg-black/70 px-5 py-3.5 backdrop-blur-xl whitespace-nowrap'>
              <p className='text-[10px] uppercase tracking-widest text-white/40'>
                Giá thuê từ
              </p>
              <p className='mt-0.5 text-xl font-black text-white'>
                {current.priceFrom ?? '65.000 ₫'}
                <span className='ml-1 text-xs font-normal text-white/40'>
                  / ngày
                </span>
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
}
