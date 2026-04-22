"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Layers,
  GripVertical,
  Loader2,
} from "lucide-react";
import {
  useCategoryTreeQuery,
  flattenTree,
} from "@/features/categories/hooks/use-category-tree";
import { useUpdateCategoryMutation } from "@/features/categories/hooks/use-category-management";
import type { CategoryTreeNode } from "@/features/categories/types";
import { CategoryTreeNode as CategoryTreeNodeComponent } from "./category-tree-node";
import { CategoryFormDialog } from "./category-form-dialog";
import { CategoryDeleteDialog } from "./category-delete-dialog";

// ─── Filter tree by search query ─────────────────────────────────────────────
function filterTree(nodes: CategoryTreeNode[], q: string): CategoryTreeNode[] {
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
    .filter(Boolean) as CategoryTreeNode[];
}

// ─── Stats bar ───────────────────────────────────────────────────────────────
function StatsBar({ total, roots }: { total: number; roots: number }) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex items-center gap-2 rounded-lg border border-gray-100 dark:border-white/8 bg-white dark:bg-surface-card px-4 py-2.5">
        <Layers className="size-4 text-theme-primary-start" />
        <span className="text-sm font-medium text-text-main">{total}</span>
        <span className="text-sm text-text-sub">danh mục</span>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-gray-100 dark:border-white/8 bg-white dark:bg-surface-card px-4 py-2.5">
        <ChevronRight className="size-4 text-blue-400" />
        <span className="text-sm font-medium text-text-main">{roots}</span>
        <span className="text-sm text-text-sub">danh mục gốc</span>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-gray-100 dark:border-white/8 bg-white dark:bg-surface-card px-4 py-2.5">
        <ChevronDown className="size-4 text-amber-400" />
        <span className="text-sm font-medium text-text-main">
          {total - roots}
        </span>
        <span className="text-sm text-text-sub">danh mục con</span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function CategoriesPage() {
  const { data: tree = [], isLoading, isError } = useCategoryTreeQuery();
  const updateMutation = useUpdateCategoryMutation();

  // Flat list derived from tree (for lookups and count)
  const allNodes = useMemo(() => flattenTree(tree), [tree]);

  // Dialog state
  type DialogState =
    | { type: "idle" }
    | { type: "create"; defaultParentId?: string }
    | { type: "edit"; node: CategoryTreeNode }
    | { type: "delete"; node: CategoryTreeNode };

  const [dialog, setDialog] = useState<DialogState>({ type: "idle" });
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  // Filtered tree for display
  const filtered = useMemo(() => filterTree(tree, search), [tree, search]);
  const rootIds = filtered.map((n) => n.categoryId);

  // Active node for DragOverlay label
  const activeNode = activeId
    ? allNodes.find((n) => n.categoryId === activeId)
    : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  // After drag-drop, persist sortOrder changes via PATCH API
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const draggedId = String(active.id);
    const overId = String(over.id);

    // ── Case 1: drop-into zone → reparent dragged node ────────────────────
    if (overId.startsWith("drop-into::")) {
      const newParentId = overId.replace("drop-into::", "");
      if (newParentId === draggedId) return;

      // Optimistically persist reparent via PATCH (sortOrder stays, parentId changes)
      updateMutation.mutate({
        categoryId: draggedId,
        payload: { parentId: newParentId },
      });
      return;
    }

    // ── Case 2: same-level reorder ────────────────────────────────────────
    // Find siblings (nodes with the same parent as dragged node)
    const draggedNode = allNodes.find((n) => n.categoryId === draggedId);
    if (!draggedNode) return;

    // Find the parent node to get siblings
    const findParent = (
      nodes: CategoryTreeNode[],
      childId: string,
    ): CategoryTreeNode | null => {
      for (const n of nodes) {
        if (n.children.some((c) => c.categoryId === childId)) return n;
        const found = findParent(n.children, childId);
        if (found) return found;
      }
      return null;
    };

    const parentNode = findParent(tree, draggedId);
    const siblings = parentNode ? parentNode.children : tree;

    const oldIdx = siblings.findIndex((n) => n.categoryId === draggedId);
    const newIdx = siblings.findIndex((n) => n.categoryId === overId);
    if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return;

    // BE tự tính lại sortOrder các item còn lại - chỉ gửi sortOrder mới của item được kéo
    const newSortOrder = newIdx + 1;
    updateMutation.mutate({
      categoryId: draggedId,
      payload: { sortOrder: newSortOrder },
    });
  };

  // ── Loading / error states ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-theme-primary-start" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-red-500">
          Không thể tải danh mục. Vui lòng thử lại.
        </p>
      </div>
    );
  }

  const rootCount = tree.length;
  const totalCount = allNodes.length;

  return (
    <div className="flex flex-col gap-6 p-6 w-full">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-main">
            Quản lý danh mục
          </h2>
          <p className="mt-1 text-sm text-text-sub">
            Tổ chức danh mục dạng cây, kéo thả để sắp xếp thứ tự hoặc đổi danh
            mục cha
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDialog({ type: "create" })}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-theme-primary-start px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition shadow-sm"
        >
          <Plus className="size-4" />
          Thêm danh mục gốc
        </button>
      </div>

      {/* Stats */}
      <StatsBar total={totalCount} roots={rootCount} />

      {/* Search bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-sub pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm danh mục..."
          className="h-10 w-full rounded-lg border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card pl-9 pr-4 text-sm text-text-main focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20 transition"
        />
      </div>

      {/* Tree */}
      <div className="rounded-xl border border-gray-100 dark:border-white/8 bg-gray-50/60 dark:bg-white/3 p-4 min-h-64">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <Layers className="size-12 text-gray-200" />
            <p className="text-sm font-medium text-text-sub">
              {search
                ? "Không tìm thấy danh mục phù hợp"
                : "Chưa có danh mục nào"}
            </p>
            {!search && (
              <button
                type="button"
                onClick={() => setDialog({ type: "create" })}
                className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 dark:border-white/15 px-3 py-2 text-sm text-text-sub hover:border-gray-400 dark:hover:border-white/30 hover:text-text-main transition"
              >
                <Plus className="size-4" />
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
              <div className="flex flex-col gap-1">
                {filtered.map((rootNode) => (
                  <CategoryTreeNodeComponent
                    key={rootNode.categoryId}
                    node={rootNode}
                    depth={0}
                    activeId={activeId}
                    searchQuery={search}
                    onEdit={(n) => setDialog({ type: "edit", node: n })}
                    onAddChild={(n) =>
                      setDialog({
                        type: "create",
                        defaultParentId: n.categoryId,
                      })
                    }
                    onDelete={(n) => setDialog({ type: "delete", node: n })}
                  />
                ))}
              </div>
            </SortableContext>

            {/* Floating drag preview */}
            <DragOverlay dropAnimation={null}>
              {activeNode && (
                <div className="flex min-h-11 items-center gap-2 rounded-md border border-theme-primary-start/40 bg-white dark:bg-surface-card px-3 shadow-lg ring-2 ring-theme-primary-start/20 opacity-90">
                  <GripVertical className="size-4 text-gray-400" />
                  <span className="text-sm font-medium text-text-main">
                    {activeNode.name}
                  </span>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Hint */}
      <p className="text-xs text-text-sub">
        💡 Kéo icon <span className="font-medium">⠿</span> để sắp xếp lại thứ tự
        hoặc chuyển sang danh mục cha khác. Thả lên một node để trở thành con
        của node đó.
      </p>

      {/* Dialogs - use key prop so form state fully resets on each open */}
      {dialog.type === "create" && (
        <CategoryFormDialog
          key={`create-${dialog.defaultParentId ?? "root"}`}
          target={null}
          defaultParentId={dialog.defaultParentId}
          onClose={() => setDialog({ type: "idle" })}
        />
      )}
      {dialog.type === "edit" && (
        <CategoryFormDialog
          key={`edit-${dialog.node.categoryId}`}
          target={
            dialog.node as unknown as import("@/features/categories/types").CategoryResponse
          }
          onClose={() => setDialog({ type: "idle" })}
        />
      )}
      {dialog.type === "delete" && (
        <CategoryDeleteDialog
          category={dialog.node}
          onClose={() => setDialog({ type: "idle" })}
        />
      )}
    </div>
  );
}
