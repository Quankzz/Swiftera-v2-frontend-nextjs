'use client';

import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Layers,
  GripVertical,
} from 'lucide-react';
import { useCategoryStore } from '@/stores/use-category-store';
import type { CategoryTree } from '@/types/catalog';
import { CategoryTreeNode } from './category-tree-node';
import { CategoryFormDialog } from './category-form-dialog';
import { CategoryDeleteDialog } from './category-delete-dialog';

// ─── Filter tree by search query ─────────────────────────────────
function filterTree(nodes: CategoryTree[], q: string): CategoryTree[] {
  if (!q.trim()) return nodes;
  const lower = q.toLowerCase();
  return nodes
    .map((n) => {
      const childMatches = filterTree(n.children, q);
      const selfMatch = n.name.toLowerCase().includes(lower);
      if (selfMatch || childMatches.length > 0) {
        return { ...n, children: childMatches };
      }
      return null;
    })
    .filter(Boolean) as CategoryTree[];
}

// ─── Stats bar ───────────────────────────────────────────────────
function StatsBar({ total, roots }: { total: number; roots: number }) {
  return (
    <div className='flex flex-wrap gap-4'>
      <div className='flex items-center gap-2 rounded-sm border border-gray-100 dark:border-white/8 bg-white dark:bg-[#1a1a1f] px-4 py-2.5'>
        <Layers className='size-4 text-theme-primary-start' />
        <span className='text-sm font-medium text-text-main'>{total}</span>
        <span className='text-sm text-text-sub'>danh mục</span>
      </div>
      <div className='flex items-center gap-2 rounded-sm border border-gray-100 dark:border-white/8 bg-white dark:bg-[#1a1a1f] px-4 py-2.5'>
        <ChevronRight className='size-4 text-blue-400' />
        <span className='text-sm font-medium text-text-main'>{roots}</span>
        <span className='text-sm text-text-sub'>danh mục gốc</span>
      </div>
      <div className='flex items-center gap-2 rounded-sm border border-gray-100 dark:border-white/8 bg-white dark:bg-[#1a1a1f] px-4 py-2.5'>
        <ChevronDown className='size-4 text-amber-400' />
        <span className='text-sm font-medium text-text-main'>
          {total - roots}
        </span>
        <span className='text-sm text-text-sub'>danh mục con</span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────
export function CategoriesPage() {
  const { tree, categories, reorderCategories, moveCategory } =
    useCategoryStore();

  // Dialog state
  type DialogState =
    | { type: 'idle' }
    | { type: 'create'; defaultParentId?: string }
    | { type: 'edit'; node: CategoryTree }
    | { type: 'delete'; node: CategoryTree };

  const [dialog, setDialog] = useState<DialogState>({ type: 'idle' });
  const [search, setSearch] = useState('');
  // ID of the item currently being dragged (for DragOverlay)
  const [activeId, setActiveId] = useState<string | null>(null);

  // Filtered tree
  const filtered = useMemo(() => filterTree(tree, search), [tree, search]);
  // Only root-level IDs for the outer SortableContext (DnD must be per-sibling-group)
  const rootIds = filtered.map((n) => n.categoryId);

  // Find node by id for DragOverlay label
  const activeCategory = activeId
    ? categories.find((c) => c.categoryId === activeId)
    : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const draggedCat = categories.find((c) => c.categoryId === active.id);
    if (!draggedCat) return;

    const overId = String(over.id);

    // ── Case 1: drop-into zone → make dragged a child of target node ──
    if (overId.startsWith('drop-into::')) {
      const newParentId = overId.replace('drop-into::', '');
      // Prevent making a node its own child or moving to its current parent (no-op)
      if (newParentId === draggedCat.categoryId) return;
      if (newParentId === draggedCat.parentId) return;
      moveCategory(draggedCat.categoryId, newParentId);
      // Append at the end of the new parent's children
      const newSiblings = categories
        .filter(
          (c) =>
            c.parentId === newParentId &&
            c.categoryId !== draggedCat.categoryId,
        )
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((c) => c.categoryId);
      reorderCategories(newParentId, [...newSiblings, draggedCat.categoryId]);
      return;
    }

    // ── Case 2: dropped onto a sortable node ──────────────────────────
    // parentId of the item we dropped onto (from useSortable data)
    const overParentId =
      (over.data.current?.parentId as string | null | undefined) ?? null;
    const draggedParentId = draggedCat.parentId;

    if (draggedParentId !== overParentId) {
      // Cross-parent: move + reorder in new parent
      moveCategory(draggedCat.categoryId, overParentId);

      const newSiblings = categories
        .filter(
          (c) =>
            c.parentId === overParentId &&
            c.categoryId !== draggedCat.categoryId,
        )
        .sort((a, b) => a.sortOrder - b.sortOrder);

      const overIdx = newSiblings.findIndex((c) => c.categoryId === over.id);
      const insertAt = overIdx === -1 ? newSiblings.length : overIdx;
      const newOrder = [
        ...newSiblings.slice(0, insertAt).map((c) => c.categoryId),
        draggedCat.categoryId,
        ...newSiblings.slice(insertAt).map((c) => c.categoryId),
      ];
      reorderCategories(overParentId, newOrder);
    } else {
      // Same-parent: reorder only
      const siblings = categories
        .filter((c) => c.parentId === draggedParentId)
        .sort((a, b) => a.sortOrder - b.sortOrder);

      const oldIdx = siblings.findIndex((c) => c.categoryId === active.id);
      const newIdx = siblings.findIndex((c) => c.categoryId === over.id);
      if (oldIdx === -1 || newIdx === -1) return;

      const reordered = [...siblings];
      const [moved] = reordered.splice(oldIdx, 1);
      reordered.splice(newIdx, 0, moved);

      reorderCategories(
        draggedParentId,
        reordered.map((c) => c.categoryId),
      );
    }
  };

  const rootCount = tree.length;
  const totalCount = categories.length;

  return (
    <div className='flex flex-col gap-6 p-6 w-full'>
      {/* Page header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight text-text-main'>
            Quản lý danh mục
          </h2>
          <p className='mt-1 text-sm text-text-sub'>
            Tổ chức danh mục dạng cây, kéo thả để sắp xếp thứ tự hoặc đổi danh
            mục cha
          </p>
        </div>
        <button
          type='button'
          onClick={() => setDialog({ type: 'create' })}
          className='inline-flex shrink-0 items-center gap-2 rounded-sm bg-theme-primary-start px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition shadow-sm'
        >
          <Plus className='size-4' />
          Thêm danh mục gốc
        </button>
      </div>

      {/* Stats */}
      <StatsBar total={totalCount} roots={rootCount} />

      {/* Search bar */}
      <div className='relative max-w-md'>
        <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-sub pointer-events-none' />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Tìm kiếm danh mục...'
          className='h-10 w-full rounded-sm border border-gray-200 dark:border-white/8 bg-white dark:bg-[#1a1a1f] pl-9 pr-4 text-sm text-text-main focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20 transition'
        />
      </div>

      {/* Tree */}
      <div className='rounded-xl border border-gray-100 dark:border-white/8 bg-gray-50/60 dark:bg-white/3 p-4 min-h-64'>
        {filtered.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 text-center gap-3'>
            <Layers className='size-12 text-gray-200' />
            <p className='text-sm font-medium text-text-sub'>
              {search
                ? 'Không tìm thấy danh mục phù hợp'
                : 'Chưa có danh mục nào'}
            </p>
            {!search && (
              <button
                type='button'
                onClick={() => setDialog({ type: 'create' })}
                className='mt-1 inline-flex items-center gap-1.5 rounded-sm border border-dashed border-gray-300 dark:border-white/15 px-3 py-2 text-sm text-text-sub hover:border-gray-400 dark:hover:border-white/30 hover:text-text-main transition'
              >
                <Plus className='size-4' />
                Tạo danh mục đầu tiên
              </button>
            )}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={rootIds}
              strategy={verticalListSortingStrategy}
            >
              <div className='flex flex-col gap-1'>
                {filtered.map((rootNode) => (
                  <CategoryTreeNode
                    key={rootNode.categoryId}
                    node={rootNode}
                    depth={0}
                    activeId={activeId}
                    searchQuery={search}
                    onEdit={(n) => setDialog({ type: 'edit', node: n })}
                    onAddChild={(n) =>
                      setDialog({
                        type: 'create',
                        defaultParentId: n.categoryId,
                      })
                    }
                    onDelete={(n) => setDialog({ type: 'delete', node: n })}
                  />
                ))}
              </div>
            </SortableContext>

            {/* Floating drag preview */}
            <DragOverlay dropAnimation={null}>
              {activeCategory && (
                <div className='flex min-h-11 items-center gap-2 rounded-md border border-theme-primary-start/40 bg-white dark:bg-[#1a1a1f] px-3 shadow-lg ring-2 ring-theme-primary-start/20 opacity-90'>
                  <GripVertical className='size-4 text-gray-400' />
                  <span className='text-sm font-medium text-text-main'>
                    {activeCategory.name}
                  </span>
                  <span className='ml-auto rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] text-text-sub'>
                    {activeCategory.slug}
                  </span>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Hint */}
      <p className='text-xs text-text-sub'>
        💡 Kéo icon <span className='font-medium'>⠿</span> để sắp xếp lại thứ tự
        hoặc chuyển sang danh mục cha khác. Thả lên một node để trở thành con
        của node đó.
      </p>

      {/* Dialogs */}
      {dialog.type === 'create' && (
        <CategoryFormDialog
          target={null}
          defaultParentId={dialog.defaultParentId}
          onClose={() => setDialog({ type: 'idle' })}
        />
      )}
      {dialog.type === 'edit' && (
        <CategoryFormDialog
          target={dialog.node}
          onClose={() => setDialog({ type: 'idle' })}
        />
      )}
      {dialog.type === 'delete' && (
        <CategoryDeleteDialog
          category={dialog.node}
          onClose={() => setDialog({ type: 'idle' })}
        />
      )}
    </div>
  );
}
