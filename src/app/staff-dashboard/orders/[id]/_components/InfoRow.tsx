import React from 'react';
import { cn } from '@/lib/utils';

export function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  strong?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-2.5 bg-theme-primary-start/10 rounded-2xl">
        <Icon className="size-5 text-theme-primary-start" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground font-medium mb-1">
          {label}
        </p>
        <p className={cn('text-lg text-foreground leading-snug font-medium')}>
          {value}
        </p>
      </div>
    </div>
  );
}
