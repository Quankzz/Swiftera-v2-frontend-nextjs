import React from 'react';
import { cn } from '@/lib/utils';

export function WorkflowBanner({
  icon: Icon,
  title,
  desc,
  variant = 'primary',
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}) {
  const wrapCls = {
    primary: 'border-theme-primary-start/20 bg-theme-primary-start/5',
    success: 'border-success-border bg-success-muted',
    warning: 'border-yellow-300/50 bg-yellow-50 dark:bg-yellow-950/20',
    danger: 'border-destructive/25 bg-destructive/5',
  };
  const iconCls = {
    primary: 'bg-theme-primary-start/10 text-theme-primary-start',
    success: 'bg-success/10 text-success',
    warning:
      'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400',
    danger: 'bg-destructive/10 text-destructive',
  };
  const titleCls = {
    primary: 'text-foreground',
    success: 'text-success',
    warning: 'text-yellow-700 dark:text-yellow-300',
    danger: 'text-destructive',
  };
  return (
    <div
      className={cn(
        'rounded-2xl border p-5 flex items-start gap-4',
        wrapCls[variant],
      )}
    >
      <div
        className={cn(
          'size-11 rounded-xl flex items-center justify-center shrink-0',
          iconCls[variant],
        )}
      >
        <Icon className="size-5" />
      </div>
      <div>
        <h3 className={cn('text-base font-bold mb-1', titleCls[variant])}>
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
