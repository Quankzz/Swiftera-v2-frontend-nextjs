import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChecklistItem({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setDone((v) => !v)}
      className="flex items-center gap-3 w-full text-left py-2.5 group"
    >
      <div
        className={cn(
          "size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
          done
            ? "bg-success border-success"
            : "border-border group-hover:border-theme-primary-start/60",
        )}
      >
        {done && <CheckCircle2 className="size-3 text-white" />}
      </div>
      <span
        className={cn(
          "text-sm font-medium transition-colors",
          done ? "text-muted-foreground line-through" : "text-foreground",
        )}
      >
        {text}
      </span>
    </button>
  );
}
