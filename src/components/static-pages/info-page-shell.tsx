'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, ArrowRight, Sparkles } from 'lucide-react';

import { Layout } from '@/components/Layout';

type InfoStat = {
  label: string;
  value: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type InfoSection = {
  title: string;
  content: string;
  bullets?: string[];
};

type InfoAction = {
  label: string;
  href: string;
};

interface InfoPageShellProps {
  eyebrow?: string;
  title: string;
  description?: string;
  stats?: InfoStat[];
  faqs?: FaqItem[];
  sections?: InfoSection[];
  actions?: InfoAction[];
}

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className='space-y-3'>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className='rounded-2xl border border-border/60 bg-card overflow-hidden transition-all hover:shadow-sm dark:bg-card/80'
          >
            <button
              type='button'
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className='flex w-full items-center justify-between gap-4 px-5 py-4 text-left'
            >
              <span className='text-sm font-semibold text-foreground'>{item.question}</span>
              {isOpen ? (
                <ChevronUp className='size-4 shrink-0 text-blue-500' />
              ) : (
                <ChevronDown className='size-4 shrink-0 text-muted-foreground' />
              )}
            </button>
            {isOpen && (
              <div className='border-t border-border/40 px-5 pb-5 pt-4'>
                <p className='text-sm leading-relaxed text-muted-foreground'>{item.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function InfoPageShell({
  eyebrow,
  title,
  description,
  stats = [],
  faqs,
  sections = [],
  actions = [],
}: InfoPageShellProps) {
  return (
    <Layout stickyHeader>
      <main className='bg-background pb-14 pt-10'>
        <div className='mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10'>
          {/* ── Hero Header ── */}
          <section className='relative overflow-hidden rounded-3xl border border-border/60 bg-card px-6 py-8 shadow-sm sm:px-8 sm:py-10'>
            {/* Ambient blobs */}
            <div className='pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-blue-500/10 blur-[120px]' />
            <div className='pointer-events-none absolute -bottom-20 -left-14 h-44 w-44 rounded-full bg-sky-400/10 blur-[120px]' />

            <div className='relative z-10'>
              {eyebrow && (
                <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-500 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-400'>
                  <Sparkles className='size-3.5' />
                  {eyebrow}
                </div>
              )}

              <h1 className='text-3xl font-black tracking-tight text-foreground sm:text-4xl'>
                {title}
              </h1>

              {description && (
                <p className='mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base'>
                  {description}
                </p>
              )}

              {stats.length > 0 && (
                <div className='mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3'>
                  {stats.map((stat) => (
                    <div
                      key={`${stat.label}-${stat.value}`}
                      className='rounded-2xl border border-border/60 bg-background/80 px-4 py-3 backdrop-blur-sm'
                    >
                      <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                        {stat.label}
                      </p>
                      <p className='mt-1 text-base font-bold text-foreground'>{stat.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── FAQ Section ── */}
          {faqs && faqs.length > 0 && (
            <section className='mt-8'>
              <h2 className='mb-4 text-xl font-bold text-foreground'>
                Câu hỏi thường gặp
              </h2>
              <FaqAccordion items={faqs} />
            </section>
          )}

          {/* ── Content Sections ── */}
          {sections.length > 0 && (
            <section className='mt-8 grid grid-cols-1 gap-4 md:grid-cols-2'>
              {sections.map((section) => (
                <article
                  key={section.title}
                  className='rounded-2xl border border-border/60 bg-card p-5 shadow-sm dark:bg-card/80'
                >
                  <h2 className='text-lg font-bold text-foreground'>{section.title}</h2>
                  <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
                    {section.content}
                  </p>

                  {section.bullets && section.bullets.length > 0 && (
                    <ul className='mt-3 space-y-2'>
                      {section.bullets.map((item) => (
                        <li
                          key={item}
                          className='flex items-start gap-2 rounded-xl border border-border/50 bg-muted/20 px-3 py-2 text-sm text-foreground'
                        >
                          <span className='mt-0.5 size-1.5 shrink-0 rounded-full bg-blue-500' />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </section>
          )}

          {/* ── Action Links ── */}
          {actions.length > 0 && (
            <section className='mt-6 rounded-2xl border border-border/60 bg-card p-4 sm:p-5'>
              <p className='text-sm font-semibold text-foreground'>Liên kết nhanh</p>
              <div className='mt-3 flex flex-wrap gap-2'>
                {actions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className='inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-500/20 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-400 dark:hover:bg-blue-400/20'
                  >
                    {action.label}
                    <ArrowRight className='size-3.5' />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </Layout>
  );
}
