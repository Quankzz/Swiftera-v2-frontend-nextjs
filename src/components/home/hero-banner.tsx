"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoveRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroSlide {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  accent?: string;
}

interface HeroBannerProps {
  slides: HeroSlide[];
}

export function HeroBanner({ slides }: HeroBannerProps) {
  const safeSlides = useMemo(() => slides.filter(Boolean), [slides]);
  const [index, setIndex] = useState(0);
  const current = safeSlides[index] ?? safeSlides[0];

  const handleNext = (direction: "prev" | "next") => {
    if (safeSlides.length === 0) return;
    setIndex((prev) => {
      if (direction === "next") {
        return (prev + 1) % safeSlides.length;
      }
      return prev === 0 ? safeSlides.length - 1 : prev - 1;
    });
  };

  if (!current) return null;

  return (
    <section className='relative overflow-hidden rounded-[32px] bg-linear-to-r from-theme-primary-start to-theme-primary-end text-white shadow-xl'>
      <div className='absolute inset-0 opacity-30'>
        <div className='absolute -left-16 top-10 h-72 w-72 rounded-full bg-white/30 blur-3xl' />
        <div className='absolute bottom-0 right-0 h-64 w-64 rounded-full bg-black/20 blur-3xl' />
      </div>

      <div className='relative grid items-center gap-10 px-6 py-10 lg:grid-cols-12 lg:px-12 lg:py-14'>
        <div className='lg:col-span-6'>
          <p className='mb-4 inline-flex items-center rounded-full bg-white/15 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] backdrop-blur'>
            {current.accent ?? "Flexible tech rental"}
          </p>
          <h1 className='text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl'>
            {current.title}
          </h1>
          <h2 className='mt-3 text-3xl font-bold md:text-4xl'>
            {current.subtitle}
          </h2>
          <p className='mt-4 max-w-2xl text-lg leading-relaxed text-white/90'>
            {current.description}
          </p>

          <div className='mt-8 flex flex-wrap items-center gap-4'>
            <Button className='rounded-full bg-white text-theme-primary-start hover:bg-white/90'>
              Discover gaming
            </Button>
            <Button
              variant='ghost'
              className='gap-2 rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20'
            >
              View offers
              <MoveRight className='size-4' />
            </Button>
          </div>
        </div>

        <div className='relative lg:col-span-6'>
          <div className='relative mx-auto h-80 max-w-xl overflow-hidden rounded-[28px] bg-white/10 backdrop-blur lg:h-96'>
            <Image
              src={current.image}
              alt={current.title}
              fill
              sizes='(min-width: 1024px) 520px, 90vw'
              className='object-cover'
            />
          </div>

          <div className='absolute left-6 top-1/2 hidden -translate-y-1/2 lg:flex'>
            <div className='flex flex-col gap-2'>
              <Button
                size='icon'
                variant='secondary'
                className='rounded-full bg-white/90 text-theme-primary-start shadow'
                onClick={() => handleNext("prev")}
                aria-label='Previous slide'
              >
                <ChevronLeft className='size-5' />
              </Button>
              <Button
                size='icon'
                variant='secondary'
                className='rounded-full bg-white/90 text-theme-primary-start shadow'
                onClick={() => handleNext("next")}
                aria-label='Next slide'
              >
                <ChevronRight className='size-5' />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className='flex items-center justify-center gap-2 pb-6'>
        {safeSlides.map((_, dotIndex) => (
          <button
            key={dotIndex}
            className={cn(
              "h-2 w-2 rounded-full bg-white/50 transition-all",
              dotIndex === index && "w-6 bg-white",
            )}
            aria-label={`Go to slide ${dotIndex + 1}`}
            onClick={() => setIndex(dotIndex)}
          />
        ))}
      </div>
    </section>
  );
}
