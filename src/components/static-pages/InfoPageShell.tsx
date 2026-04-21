'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import {
  ChevronDown,
  ChevronUp,
  ArrowRight,
  FileText,
  HelpCircle,
} from 'lucide-react';

type Stat = { label: string; value: string };
type FaqItem = { question: string; answer: string };
type SectionItem = { title: string; content: string; bullets?: string[] };
type ActionLink = { label: string; href: string };

type InfoPageShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  stats?: Stat[];
  faqs?: FaqItem[];
  sections?: SectionItem[];
  actions?: ActionLink[];
};

export function InfoPageShell({
  eyebrow,
  title,
  description,
  stats = [],
  faqs = [],
  sections = [],
  actions = [],
}: InfoPageShellProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <Layout stickyHeader>
      <main className="bg-background pb-16 pt-10">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10">

          {/* ── Hero Header Card ── */}
          <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card px-6 py-8 shadow-sm sm:px-8 sm:py-10">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-500/[0.06] blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-sky-400/[0.06] blur-[120px]" />

            <div className="relative z-10">
              {eyebrow && (
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-500 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-400">
                  {eyebrow}
                </div>
              )}
              <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                {title}
              </h1>
              {description && (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {description}
                </p>
              )}
            </div>

            {/* Stats row */}
            {stats.length > 0 && (
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {stats.map((stat, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-border/40 bg-background/60 p-4 text-center dark:bg-foreground/[0.03]"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-sm font-bold text-foreground sm:text-base">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── FAQ Accordion ── */}
          {faqs.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
                <HelpCircle className="size-5 text-blue-500" />
                Câu hỏi thường gặp
              </h2>
              <div className="space-y-2">
                {faqs.map((faq, i) => {
                  const isOpen = openFaqIndex === i;
                  return (
                    <div
                      key={i}
                      className="rounded-2xl border border-border/60 bg-card overflow-hidden transition-colors hover:border-blue-500/20 dark:bg-card/80"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                      >
                        <span className="text-sm font-semibold text-foreground">
                          {faq.question}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="size-4 shrink-0 text-blue-500" />
                        ) : (
                          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="border-t border-border/40 px-5 pb-4">
                          <p className="pt-3 text-sm leading-relaxed text-muted-foreground">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Content Sections ── */}
          {sections.length > 0 && (
            <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              {sections.map((section, i) => (
                <article
                  key={i}
                  className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm dark:bg-card/80"
                >
                  <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-blue-500/10">
                    <FileText className="size-5 text-blue-500" />
                  </div>
                  <h3 className="mb-2 text-base font-bold text-foreground">
                    {section.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {section.content}
                  </p>
                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {section.bullets.map((bullet, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2.5 text-sm text-muted-foreground"
                        >
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-blue-500" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </section>
          )}

          {/* ── Quick Action Pills ── */}
          {actions.length > 0 && (
            <section className="mt-8 rounded-2xl border border-border/60 bg-card p-5">
              <p className="mb-3 text-sm font-semibold text-foreground">
                Liên kết nhanh
              </p>
              <div className="flex flex-wrap gap-2">
                {actions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-500/20 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-400 dark:hover:bg-blue-400/20"
                  >
                    {action.label}
                    <ArrowRight className="size-3.5" />
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
