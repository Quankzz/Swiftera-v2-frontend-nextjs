"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      <Header />

      {/* Animated Background */}
      <div className="fixed inset-0 bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-[#0f0f11] dark:via-[#12121a] dark:to-[#0f0f11] -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300/20 dark:bg-blue-500/8 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl animate-pulse" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300/20 dark:bg-purple-500/8 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl animate-pulse [animation-delay:2s]" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300/20 dark:bg-theme-primary-start/6 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl animate-pulse [animation-delay:4s]" />
      </div>

      {/* Content - pt-24 clears fixed header */}
      <div className="relative z-10 flex-1 pt-24 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">{children}</div>
      </div>

      <Footer />
    </div>
  );
}
