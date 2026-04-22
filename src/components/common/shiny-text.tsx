"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ShinyText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block animate-react-bits-shimmer bg-clip-text text-transparent",
        className,
      )}
      style={{ backgroundSize: "200% 100%" }}
    >
      {children}
    </span>
  );
}
