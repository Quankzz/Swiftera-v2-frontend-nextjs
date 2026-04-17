'use client';

import { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCategoryTreeQuery } from '@/features/categories/hooks/use-category-tree';

// ─── TYPES ──────────────────────────────────────────────────────────────────
export interface CategoryNode {
  isActive: boolean;
  imageUrl?: string | null;
  sortOrder: number;
  name: string;
}

export interface SlideData {
  title: string;
  description: string;
  image: string;
}

// ─── COMPONENTS ─────────────────────────────────────────────────────────────
const ParticlesBg = dynamic(() => import('@/components/ui/particles-bg'), {
  ssr: false,
});

const FALLBACK_SLIDES: SlideData[] = [
  {
    title: 'Yêu công nghệ',
    description:
      'Thuê thiết bị linh hoạt, chi phí hợp lý, giao hàng nhanh và đổi trả dễ dàng.',
    image: '',
  },
];

/**
 * Hiệu ứng gõ chữ (Typing Effect) với con trỏ nhấp nháy
 */
const TypewriterText = ({
  text,
  speed = 60,
}: {
  text: string;
  speed?: number;
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let i = 0;

    const timer = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <>
      {displayedText}
      {/* Blinking Cursor */}
      <span
        className={`inline-block ml-1 bg-theme-primary-start translate-y-1 ${
          isTyping ? 'animate-none' : 'animate-pulse'
        }`}
      />
    </>
  );
};

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export function HeroBanner() {
  // Giả sử useCategoryTreeQuery trả về mảng các CategoryNode
  const { data = [], isLoading } = useCategoryTreeQuery();
  const categoryTree = data as CategoryNode[];

  const slides: SlideData[] = useMemo(() => {
    const roots = categoryTree
      .filter((c) => c.isActive && c.imageUrl)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    if (roots.length === 0) return FALLBACK_SLIDES;

    return roots.map((node) => ({
      title: node.name,
      description:
        'Thuê thiết bị linh hoạt, chi phí hợp lý, giao hàng nhanh và đổi trả dễ dàng.',
      image: node.imageUrl ?? '',
    }));
  }, [categoryTree]);

  const [index, setIndex] = useState<number>(0);
  const current = slides[index];

  // Auto slide
  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4500);

    return () => clearInterval(t);
  }, [slides.length]);

  if (!isLoading && slides.length === 0) return null;

  return (
    <section className="relative min-h-[60vh] overflow-hidden bg-gray-50 dark:bg-[#0a0a0a] flex items-center px-6">
      {/* Background particles */}
      <div className="absolute inset-0 z-0 opacity-30">
        <ParticlesBg particleCount={120} speed={0.03} particleBaseSize={60} />
      </div>

      {/* Glow background */}
      <div className="absolute -right-[10%] top-1/4 h-125 w-125 rounded-full bg-theme-primary-start/10 blur-[120px]" />

      {/* MAIN LAYOUT */}
      <div className="relative z-10 mx-auto w-full max-w-7xl grid grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* ═════════ TEXT COLUMN ═════════ */}
        <div className="col-span-12 lg:col-span-6 max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
          <AnimatePresence mode="wait">
            <motion.div
              key={current?.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <h1 className="font-black leading-[1.1] tracking-tighter text-[clamp(2.5rem,6vw,4.5rem)] text-gray-900 dark:text-white">
                {/* Ứng dụng TypewriterText vào tiêu đề slide */}
                <TypewriterText text={current?.title || ''} speed={80} />
                <br />
                <span
                  style={{
                    background:
                      'linear-gradient(95deg, var(--theme-primary-start) 0%, #7ecbf7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Chọn Swiftera
                </span>
              </h1>

              <p className="mt-6 text-lg text-gray-600 dark:text-white/60">
                {current?.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* CTA */}
          <div className="mt-8 flex justify-center lg:justify-start gap-4">
            <button className="rounded-full bg-theme-primary-start px-8 py-3.5 text-white font-semibold shadow-lg shadow-theme-primary-start/30 hover:scale-105 hover:shadow-theme-primary-start/50 transition-all">
              Khám phá ngay
            </button>
            <button className="rounded-full border border-gray-300 dark:border-white/20 px-8 py-3.5 font-semibold text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
              Xem thêm
            </button>
          </div>
        </div>

        {/* ═════════ IMAGE COLUMN ═════════ */}
        <div className="col-span-12 lg:col-span-6 hidden lg:flex justify-center">
          <div className="relative w-full max-w-130 aspect-4/5">
            {/* Background glow */}
            <div className="absolute inset-0 bg-linear-to-tr from-theme-primary-start/20 to-blue-400/20 rounded-[3rem] blur-[100px]" />

            {/* Main image card */}
            <div className="absolute top-1/2 left-1/2 w-[80%] h-[70%] -translate-x-1/2 -translate-y-1/2 rounded-[2.5rem] overflow-hidden border border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current?.image}
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={current?.image || '/fallback.jpg'}
                    alt={current?.title || 'Swiftera Image'}
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Decorative blur elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-theme-primary-start/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-6 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
