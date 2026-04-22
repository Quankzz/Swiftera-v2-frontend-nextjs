"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type ActionLink = {
  href: string;
  label: string;
};

type AuthActionCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  footerLinks?: ActionLink[];
};

export function AuthActionCard({
  title,
  description,
  children,
  footerLinks = [],
}: AuthActionCardProps) {
  return (
    <div className="w-full max-w-md rounded-[30px] border border-black/5 bg-white/95 p-6 shadow-[0_5px_15px_rgba(0,0,0,0.2)] backdrop-blur max-md:mx-4 max-md:rounded-2xl dark:border-white/10 dark:bg-zinc-900/95 dark:shadow-[0_12px_45px_rgba(0,0,0,0.6)]">
      <div className="mb-6 space-y-2 text-center">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {title}
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      </div>

      {children}

      {footerLinks.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[var(--theme-primary-start,#0ea5e9)] transition-colors hover:text-[var(--theme-primary-end,#0369a1)] hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
