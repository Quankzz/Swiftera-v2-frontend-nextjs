'use client';

import { useState } from 'react';
import { ChevronRight, GripVertical, Plus, Pencil, Trash2 } from 'lucide-react';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import type { CategoryTreeNode } from '@/features/categories/types';

// ─── Props ───────────────────────────────────────────────────────
interface CategoryTreeNodeProps {
  node: CategoryTreeNode;
  depth?: number;
  activeId?: string | null; // ID currently being dragged
  onEdit: (node: CategoryTreeNode) => void;
  onAddChild: (node: CategoryTreeNode) => void;
  onDelete: (node: CategoryTreeNode) => void;
  searchQuery?: string;
}

// ─── Highlight matching text ──────────────────────────────────────
function Highlight({ text, query }: { text: string; query?: string }) {
  if (!query?.trim()) return <>{text}</>;
  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === query.trim().toLowerCase() ? (
          <mark
            key={i}
            className='bg-yellow-200 text-text-main rounded-sm px-0.5'
          >
            {p}
          </mark>
        ) : (
          p
        ),
      )}
    </>
  );
}

// ─── Single node ─────────────────────────────────────────────────
export function CategoryTreeNode({
  node,
  depth = 0,
  activeId,
  onEdit,
  onAddChild,
  onDelete,
  searchQuery,
}: CategoryTreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.children.length > 0;
  const childIds = node.children.map((c) => c.categoryId);

  // Each node is individually sortable within its parent's SortableContext.
  // We store parentId as undefined for tree nodes (parentId is not in the tree shape).
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver: isSortableOver,
  } = useSortable({
    id: node.categoryId,
    data: {},
  });

  // Dedicated droppable zone: "drop B into A to make B a child of A".
  // Uses a prefixed id so handleDragEnd can tell it apart from sortable drops.
  const { setNodeRef: setDropRef, isOver: isDropIntoOver } = useDroppable({
    id: `drop-into::${node.categoryId}`,
    disabled: activeId === node.categoryId,
    data: { type: 'drop-into', parentId: node.categoryId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Show children when expanded OR when something is being dragged over the drop-into zone
  const showChildren = expanded || (isDropIntoOver && !!activeId);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('relative flex flex-col', isDragging && 'z-50 opacity-50')}
    >
      {/* Drop-target highlight line at top (sortable reorder indicator) */}
      {isSortableOver && !isDragging && (
        <div className='absolute inset-x-0 top-0 h-0.5 rounded-full bg-theme-primary-start' />
      )}

      {/* Row */}
      <div
        className={cn(
          'group flex min-h-11 items-center gap-2 rounded-md border bg-white dark:bg-surface-card pr-1 transition-all',
          // Root level: left-accent border + light shadow
          depth === 0
            ? 'border-l-4 border-l-theme-primary-start border-gray-100 dark:border-white/8 shadow-sm'
            : 'border-gray-100 dark:border-white/8 hover:border-gray-200 dark:hover:border-white/15 hover:bg-gray-50/60 dark:hover:bg-white/5',
          isSortableOver &&
            !isDragging &&
            'bg-rose-50/30 dark:bg-rose-900/10 border-theme-primary-start/40',
        )}
        style={{ paddingLeft: depth === 0 ? '10px' : '8px' }}
      >
        {/* Drag handle - suppressHydrationWarning because dnd-kit injects
            aria-describedby="DndDescribedBy-{n}" with a counter that differs
            between SSR (0) and the first client render (incremented). */}
        <button
          type='button'
          {...attributes}
          {...listeners}
          suppressHydrationWarning
          className='flex h-full cursor-grab touch-none items-center px-1.5 text-gray-300 transition hover:text-gray-500 active:cursor-grabbing'
          aria-label='Kéo để sắp xếp'
        >
          <GripVertical className='size-4' />
        </button>

        {/* Expand toggle */}
        <button
          type='button'
          onClick={() => setExpanded((v) => !v)}
          className={cn(
            'flex size-6 shrink-0 items-center justify-center rounded-sm transition-colors',
            hasChildren
              ? 'text-text-sub hover:bg-gray-100 dark:hover:bg-white/8 hover:text-text-main'
              : 'pointer-events-none opacity-0',
          )}
        >
          <ChevronRight
            className={cn(
              'size-4 transition-transform duration-150',
              showChildren && 'rotate-90',
            )}
          />
        </button>

        {/* Root badge */}
        {depth === 0 && (
          <span className='shrink-0 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-theme-primary-start'>
            Gốc
          </span>
        )}

        {/* Name */}
        <span className='flex-1 truncate text-sm font-medium text-text-main'>
          <Highlight text={node.name} query={searchQuery} />
        </span>

        {/* Children count */}
        {hasChildren && (
          <span className='shrink-0 rounded-full bg-gray-100 dark:bg-white/8 px-2 py-0.5 text-xs font-medium text-text-sub'>
            {node.children.length}
          </span>
        )}

        {/* Actions */}
        <div className='flex shrink-0 items-center gap-0.5 pl-1'>
          <button
            type='button'
            onClick={() => onAddChild(node)}
            title='Thêm danh mục con'
            className='flex size-7 items-center justify-center rounded-sm text-text-sub transition hover:bg-blue-50 hover:text-blue-600'
          >
            <Plus className='size-3.5' />
          </button>
          <button
            type='button'
            onClick={() => onEdit(node)}
            title='Chỉnh sửa'
            className='flex size-7 items-center justify-center rounded-sm text-text-sub transition hover:bg-gray-100 dark:hover:bg-white/8 hover:text-text-main'
          >
            <Pencil className='size-3.5' />
          </button>
          <button
            type='button'
            onClick={() => onDelete(node)}
            title='Xoá'
            className='flex size-7 items-center justify-center rounded-sm text-text-sub transition hover:bg-red-50 hover:text-red-500'
          >
            <Trash2 className='size-3.5' />
          </button>
        </div>
      </div>

      {/* Children - each level has its OWN SortableContext so DnD stays within siblings */}
      {showChildren && hasChildren && (
        <div className='ml-5 mt-1 flex flex-col gap-1 border-l-2 border-dashed border-gray-200 dark:border-white/10 pl-3'>
          <SortableContext
            items={childIds}
            strategy={verticalListSortingStrategy}
          >
            {node.children.map((child) => (
              <CategoryTreeNode
                key={child.categoryId}
                node={child}
                depth={depth + 1}
                activeId={activeId}
                onEdit={onEdit}
                onAddChild={onAddChild}
                onDelete={onDelete}
                searchQuery={searchQuery}
              />
            ))}
          </SortableContext>
        </div>
      )}

      {/* Drop-into zone: visible while dragging so any node (even leaf) can receive a child.
          Renders below the row and below existing children. */}
      {!!activeId && activeId !== node.categoryId && (
        <div
          ref={setDropRef}
          className={cn(
            'ml-5 mt-0.5 flex items-center gap-2 rounded-md border-2 border-dashed px-3 py-1.5 text-xs transition-all',
            isDropIntoOver
              ? 'border-theme-primary-start bg-rose-50/60 dark:bg-rose-900/10 text-theme-primary-start font-medium'
              : 'border-gray-200 dark:border-white/15 text-text-sub',
          )}
        >
          <Plus className='size-3 shrink-0' />
          <span>
            Thả vào đây để làm con của{' '}
            <span className='font-semibold'>{node.name}</span>
          </span>
        </div>
      )}
    </div>
  );
}
