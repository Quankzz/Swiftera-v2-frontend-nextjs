'use client';

/**
 * CategoryTreeSelect - custom dropdown chọn danh mục theo dạng cây.
 *
 * Props:
 *   value          - categoryId đang chọn ('' = placeholder)
 *   onChange       - callback(categoryId) khi chọn
 *   excludeId      - loại trừ node này khỏi danh sách (tránh self-parent)
 *   placeholder    - text hiển thị khi chưa chọn
 *   disabled       - disable toàn bộ
 *   className      - override class cho trigger button
 */

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useCategoryTreeQuery,
  flattenTree,
} from '@/features/categories/hooks/use-category-tree';
import type { CategoryTreeNode } from '@/features/categories/types';

// ─── Flat item with depth ─────────────────────────────────────────────────────

interface FlatItem {
  categoryId: string;
  name: string;
  depth: number;
  isActive: boolean;
}

function flattenWithDepth(
  nodes: CategoryTreeNode[],
  depth = 0,
  excludeId?: string,
): FlatItem[] {
  const result: FlatItem[] = [];
  for (const node of nodes) {
    if (node.categoryId === excludeId) continue;
    result.push({
      categoryId: node.categoryId,
      name: node.name,
      depth,
      isActive: node.isActive,
    });
    if (node.children.length > 0) {
      result.push(...flattenWithDepth(node.children, depth + 1, excludeId));
    }
  }
  return result;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface CategoryTreeSelectProps {
  value: string; // '' = none selected
  onChange: (categoryId: string) => void;
  excludeId?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** If true, allow clearing the selection (show "- root -" option) */
  allowRoot?: boolean;
  rootLabel?: string;
}

export function CategoryTreeSelect({
  value,
  onChange,
  excludeId,
  placeholder = '- Chọn danh mục -',
  disabled = false,
  className,
  allowRoot = false,
  rootLabel = '- Danh mục gốc -',
}: CategoryTreeSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: tree = [], isLoading } = useCategoryTreeQuery();
  const flatItems = flattenWithDepth(tree, 0, excludeId);

  // Label for the selected item
  const allFlat = flattenTree(tree);
  const selectedNode = allFlat.find((n) => n.categoryId === value);
  const displayLabel =
    value === ''
      ? allowRoot
        ? rootLabel
        : placeholder
      : (selectedNode?.name ?? placeholder);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className='relative'>
      {/* Trigger */}
      <button
        type='button'
        disabled={disabled || isLoading}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-10 w-full items-center justify-between gap-2 rounded-lg border px-3 text-sm transition',
          'bg-white dark:bg-surface-card text-text-main',
          'border-gray-200 dark:border-white/15',
          'focus:outline-none focus:ring-2 focus:ring-theme-primary-start/30 focus:border-theme-primary-start',
          'disabled:opacity-60 disabled:cursor-not-allowed',
          open &&
            'border-theme-primary-start ring-2 ring-theme-primary-start/20',
          className,
        )}
      >
        <span className={cn('truncate', !value && 'text-text-sub opacity-70')}>
          {isLoading ? 'Đang tải...' : displayLabel}
        </span>
        <ChevronDown
          size={15}
          className={cn(
            'shrink-0 text-gray-400 transition-transform duration-150',
            open && 'rotate-180',
          )}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className='absolute z-50 mt-1 w-full min-w-55 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-card shadow-xl dark:shadow-black/40 overflow-hidden'>
          <div className='max-h-60 overflow-y-auto py-1'>
            {/* Root option */}
            {allowRoot && (
              <button
                type='button'
                onClick={() => handleSelect('')}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-sm transition',
                  value === ''
                    ? 'bg-theme-primary-start/8 text-theme-primary-start font-medium'
                    : 'text-text-sub hover:bg-gray-50 dark:hover:bg-white/5',
                )}
              >
                <span className='flex-1 text-left italic'>{rootLabel}</span>
                {value === '' && <Check size={13} className='shrink-0' />}
              </button>
            )}

            {flatItems.length === 0 && (
              <p className='px-3 py-3 text-xs text-text-sub italic'>
                Không có danh mục nào
              </p>
            )}

            {flatItems.map((item) => {
              const isSelected = item.categoryId === value;
              return (
                <button
                  key={item.categoryId}
                  type='button'
                  onClick={() => handleSelect(item.categoryId)}
                  className={cn(
                    'flex w-full items-center gap-1 py-2 pr-3 text-sm transition',
                    isSelected
                      ? 'bg-theme-primary-start/8 text-theme-primary-start font-medium'
                      : item.isActive
                        ? 'text-text-main hover:bg-gray-50 dark:hover:bg-white/5'
                        : 'text-text-sub opacity-60 hover:bg-gray-50 dark:hover:bg-white/5',
                  )}
                  style={{ paddingLeft: `${12 + item.depth * 18}px` }}
                >
                  {/* Tree indent guides */}
                  {item.depth > 0 && (
                    <span className='shrink-0 text-gray-300 dark:text-white/20 select-none'>
                      {'└ '}
                    </span>
                  )}
                  <span className='flex-1 truncate text-left'>
                    {item.name}
                    {!item.isActive && (
                      <span className='ml-1.5 text-[10px] text-orange-500'>
                        (ẩn)
                      </span>
                    )}
                  </span>
                  {isSelected && <Check size={13} className='shrink-0' />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
