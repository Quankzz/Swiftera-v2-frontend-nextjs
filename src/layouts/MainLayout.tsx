import type { ReactNode } from "react";

/**
 * Page layouts - Layout chính cho ứng dụng
 */
export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      {children}
    </div>
  );
}
