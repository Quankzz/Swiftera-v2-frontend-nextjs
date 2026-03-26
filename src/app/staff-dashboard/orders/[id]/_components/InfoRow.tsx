import React from 'react';
import { cn } from '@/lib/utils';

export function InfoRow({
  icon: Icon,
  label,
  value,
  strong,
  mono,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  strong?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="size-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p
          className={cn(
            'text-sm text-foreground',
            strong && 'font-bold',
            mono && 'font-mono',
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
