import { create } from 'zustand';
import { categories as initialData } from '@/data/categories';
import type { Category, CategoryTree } from '@/types/catalog';

// ─── Helpers ─────────────────────────────────────────────────────

export function buildTree(flat: Category[]): CategoryTree[] {
  const map = new Map<string, CategoryTree>();
  const roots: CategoryTree[] = [];

  // First pass: create nodes
  flat.forEach((c) => map.set(c.categoryId, { ...c, children: [] }));

  // Second pass: attach to parents
  flat.forEach((c) => {
    const node = map.get(c.categoryId)!;
    if (c.parentId === null) {
      roots.push(node);
    } else {
      const parent = map.get(c.parentId);
      if (parent) parent.children.push(node);
    }
  });

  // Sort by sortOrder at every level
  const sortNodes = (nodes: CategoryTree[]) => {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder);
    nodes.forEach((n) => sortNodes(n.children));
  };
  sortNodes(roots);

  return roots;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function generateId(): string {
  return `cat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// Count descendants
export function countDescendants(flat: Category[], categoryId: string): number {
  const directChildren = flat.filter((c) => c.parentId === categoryId);
  return directChildren.reduce(
    (sum, c) => sum + 1 + countDescendants(flat, c.categoryId),
    0,
  );
}

// Get all descendant IDs (inclusive)
function getAllDescendantIds(flat: Category[], categoryId: string): string[] {
  const ids: string[] = [categoryId];
  const children = flat.filter((c) => c.parentId === categoryId);
  children.forEach((c) => ids.push(...getAllDescendantIds(flat, c.categoryId)));
  return ids;
}

// ─── Store ───────────────────────────────────────────────────────

export interface CategoryFormData {
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  brands: string[];
  image?: string;
}

interface CategoryStore {
  categories: Category[];
  tree: CategoryTree[];

  // CRUD
  addCategory: (data: CategoryFormData) => Category;
  updateCategory: (id: string, data: Partial<CategoryFormData>) => void;
  deleteCategory: (id: string, cascade?: boolean) => void;

  // Reorder: move a category to a new sortOrder within same parent
  reorderCategories: (parentId: string | null, orderedIds: string[]) => void;

  // Move to different parent
  moveCategory: (id: string, newParentId: string | null) => void;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: initialData,
  tree: buildTree(initialData),

  addCategory: (data) => {
    const newCat: Category = {
      categoryId: generateId(),
      parentId: data.parentId,
      name: data.name,
      slug: data.slug || generateSlug(data.name),
      sortOrder: data.sortOrder,
      brands: data.brands.length > 0 ? data.brands : undefined,
      imageUrl: data.image,
    };
    set((s) => {
      const next = [...s.categories, newCat];
      return { categories: next, tree: buildTree(next) };
    });
    return newCat;
  },

  updateCategory: (id, data) => {
    set((s) => {
      const next = s.categories.map((c) =>
        c.categoryId === id ? { ...c, ...data } : c,
      );
      return { categories: next, tree: buildTree(next) };
    });
  },

  deleteCategory: (id, cascade = false) => {
    set((s) => {
      const toDelete = cascade ? getAllDescendantIds(s.categories, id) : [id];
      const next = s.categories.filter((c) => !toDelete.includes(c.categoryId));
      // If not cascade: re-parent direct children to deleted node's parent
      if (!cascade) {
        const target = s.categories.find((c) => c.categoryId === id);
        const reparented = next.map((c) =>
          c.parentId === id ? { ...c, parentId: target?.parentId ?? null } : c,
        );
        return { categories: reparented, tree: buildTree(reparented) };
      }
      return { categories: next, tree: buildTree(next) };
    });
  },

  reorderCategories: (parentId, orderedIds) => {
    set((s) => {
      const next = s.categories.map((c) => {
        const idx = orderedIds.indexOf(c.categoryId);
        if (idx !== -1) return { ...c, sortOrder: idx + 1 };
        return c;
      });
      return { categories: next, tree: buildTree(next) };
    });
  },

  moveCategory: (id, newParentId) => {
    set((s) => {
      const next = s.categories.map((c) =>
        c.categoryId === id ? { ...c, parentId: newParentId } : c,
      );
      return { categories: next, tree: buildTree(next) };
    });
  },
}));
