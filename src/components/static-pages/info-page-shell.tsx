import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

import { Layout } from '@/components/Layout';

type InfoStat = {
  label: string;
  value: string;
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
  eyebrow: string;
  title: string;
  description: string;
  stats?: InfoStat[];
  sections: InfoSection[];
  actions?: InfoAction[];
}

export function InfoPageShell({
  eyebrow,
  title,
  description,
  stats = [],
  sections,
  actions = [],
}: InfoPageShellProps) {
  return (
    <Layout stickyHeader>
      <main className='bg-background pb-14 pt-10'>
        <div className='mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10'>
          <section className='relative overflow-hidden rounded-3xl border border-border/60 bg-card px-6 py-8 shadow-sm sm:px-8'>
            <div className='pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-rose-200/60 blur-3xl dark:bg-rose-900/40' />
            <div className='pointer-events-none absolute -bottom-20 -left-14 h-44 w-44 rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-900/30' />

            <div className='relative z-1'>
              <p className='inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-700 dark:border-rose-800/70 dark:bg-rose-950/30 dark:text-rose-300'>
                <Sparkles className='size-3.5' />
                {eyebrow}
              </p>

              <h1 className='mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl'>
                {title}
              </h1>
              <p className='mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base'>
                {description}
              </p>

              {stats.length > 0 && (
                <div className='mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3'>
                  {stats.map((stat) => (
                    <div
                      key={`${stat.label}-${stat.value}`}
                      className='rounded-2xl border border-border/60 bg-background/90 px-4 py-3'
                    >
                      <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                        {stat.label}
                      </p>
                      <p className='mt-1 text-base font-bold text-foreground'>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-2'>
            {sections.map((section) => (
              <article
                key={section.title}
                className='rounded-2xl border border-border/60 bg-card p-5 shadow-sm'
              >
                <h2 className='text-lg font-bold text-foreground'>
                  {section.title}
                </h2>
                <p className='mt-2 text-sm leading-6 text-muted-foreground'>
                  {section.content}
                </p>

                {section.bullets && section.bullets.length > 0 && (
                  <ul className='mt-3 space-y-2'>
                    {section.bullets.map((item) => (
                      <li
                        key={item}
                        className='rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-sm text-foreground'
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </section>

          {actions.length > 0 && (
            <section className='mt-6 rounded-2xl border border-border/60 bg-card p-4 sm:p-5'>
              <p className='text-sm font-semibold text-foreground'>
                Liên kết nhanh
              </p>
              <div className='mt-3 flex flex-wrap gap-2'>
                {actions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className='inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-800/60 dark:bg-rose-950/25 dark:text-rose-300 dark:hover:bg-rose-950/45'
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
