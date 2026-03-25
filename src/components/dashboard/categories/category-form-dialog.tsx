'use client';

import { useState } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  generateSlug,
  useCategoryStore,
  type CategoryFormData,
} from '@/stores/use-category-store';
import type { Category } from '@/types/catalog';

// ─── Props ───────────────────────────────────────────────────────
interface CategoryFormDialogProps {
  /** null = create new | Category = edit existing */
  target: Category | null;
  /** Pre-fill parentId (when clicking "Add child") */
  defaultParentId?: string | null;
  onClose: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────
function inputCls(error?: boolean) {
  return cn(
    'h-10 w-full rounded-sm border bg-white dark:bg-[#1a1a1f] px-3 text-sm text-text-main focus:outline-none focus:ring-2 transition',
    error
      ? 'border-red-400 focus:ring-red-200'
      : 'border-gray-200 dark:border-white/8 focus:border-theme-primary-start focus:ring-theme-primary-start/20',
  );
}

// ─── Component ───────────────────────────────────────────────────
export function CategoryFormDialog({
  target,
  defaultParentId,
  onClose,
}: CategoryFormDialogProps) {
  const { categories, addCategory, updateCategory } = useCategoryStore();
  const isEdit = target !== null;

  // ── Form state ──
  const [name, setName] = useState(target?.name ?? '');
  const [slugOverride, setSlugOverride] = useState(target?.slug ?? '');
  const [slugManual, setSlugManual] = useState(isEdit);
  // Derived: auto-slug from name unless manually edited
  const slug = slugManual ? slugOverride : generateSlug(name);
  const [parentId, setParentId] = useState<string | null>(
    target?.parentId ?? defaultParentId ?? null,
  );
  const [sortOrder, setSortOrder] = useState(target?.sortOrder ?? 1);
  const [image, setImage] = useState(target?.image ?? '');
  const [brandInput, setBrandInput] = useState('');
  const [brands, setBrands] = useState<string[]>(target?.brands ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Available parent options — exclude self and own descendants
  const parentOptions = categories.filter((c) => {
    if (isEdit && c.categoryId === target.categoryId) return false;
    // Prevent circular: don't allow child as parent
    let cur: Category | undefined = c;
    while (cur?.parentId) {
      if (cur.parentId === target?.categoryId) return false;
      cur = categories.find((x) => x.categoryId === cur?.parentId);
    }
    return true;
  });

  // Group parent options for select
  const rootOptions = parentOptions.filter((c) => c.parentId === null);
  const childOptions = (pid: string) =>
    parentOptions.filter((c) => c.parentId === pid);

  // ── Brand tag helpers ──
  const addBrand = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !brands.includes(trimmed)) {
      setBrands((b) => [...b, trimmed]);
    }
    setBrandInput('');
  };
  const removeBrand = (b: string) =>
    setBrands((arr) => arr.filter((x) => x !== b));

  // ── Validate ──
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Tên danh mục không được trống';
    if (!slug.trim()) errs.slug = 'Slug không được trống';
    if (sortOrder < 1) errs.sortOrder = 'Thứ tự phải ≥ 1';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ──
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const data: CategoryFormData = {
      name: name.trim(),
      slug: slug.trim(),
      parentId,
      sortOrder,
      brands,
      image: image.trim() || undefined,
    };
    if (isEdit) {
      updateCategory(target.categoryId, data);
    } else {
      addCategory(data);
    }
    onClose();
  };

  return (
    /* Backdrop */
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className='w-full max-w-lg rounded-xl bg-white dark:bg-[#1a1a1f] shadow-2xl dark:shadow-black/50'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-100 dark:border-white/8 px-6 py-4'>
          <h2 className='text-base font-semibold text-text-main'>
            {isEdit ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          </h2>
          <button
            type='button'
            onClick={onClose}
            className='rounded-sm p-1 text-text-sub hover:bg-gray-100 dark:hover:bg-white/8 transition'
          >
            <X className='size-4' />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='flex flex-col gap-4 px-6 py-5'>
          {/* Name */}
          <div className='flex flex-col gap-1.5'>
            <label className='text-sm font-medium text-text-main'>
              Tên danh mục <span className='text-red-500'>*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='VD: Phones & Tablets'
              className={inputCls(!!errors.name)}
            />
            {errors.name && (
              <p className='text-xs text-red-500'>{errors.name}</p>
            )}
          </div>

          {/* Slug */}
          <div className='flex flex-col gap-1.5'>
            <label className='text-sm font-medium text-text-main'>Slug</label>
            <div className='flex gap-2'>
              <input
                value={slug}
                onChange={(e) => {
                  setSlugManual(true);
                  setSlugOverride(e.target.value);
                }}
                placeholder='phones-tablets'
                className={cn(inputCls(!!errors.slug), 'flex-1')}
              />
              {slugManual && (
                <button
                  type='button'
                  onClick={() => {
                    setSlugManual(false);
                    setSlugOverride(generateSlug(name));
                  }}
                  className='rounded-sm border border-gray-200 dark:border-white/8 px-3 text-xs text-text-sub hover:bg-gray-50 dark:hover:bg-white/8 transition'
                >
                  Tự động
                </button>
              )}
            </div>
            {errors.slug && (
              <p className='text-xs text-red-500'>{errors.slug}</p>
            )}
          </div>

          {/* Parent + SortOrder row */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-medium text-text-main'>
                Danh mục cha
              </label>
              <select
                value={parentId ?? ''}
                onChange={(e) => setParentId(e.target.value || null)}
                className={cn(inputCls(), 'cursor-pointer')}
              >
                <option value=''>— Danh mục gốc —</option>
                {rootOptions.map((root) => (
                  <optgroup key={root.categoryId} label={root.name}>
                    <option value={root.categoryId}>{root.name}</option>
                    {childOptions(root.categoryId).map((child) => (
                      <option key={child.categoryId} value={child.categoryId}>
                        &nbsp;&nbsp;↳ {child.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-medium text-text-main'>
                Thứ tự
              </label>
              <input
                type='number'
                min={1}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className={inputCls(!!errors.sortOrder)}
              />
              {errors.sortOrder && (
                <p className='text-xs text-red-500'>{errors.sortOrder}</p>
              )}
            </div>
          </div>

          {/* Image URL */}
          <div className='flex flex-col gap-1.5'>
            <label className='text-sm font-medium text-text-main'>
              URL ảnh đại diện
            </label>
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder='https://...'
              className={inputCls()}
            />
          </div>

          {/* Brands */}
          <div className='flex flex-col gap-1.5'>
            <label className='text-sm font-medium text-text-main flex items-center gap-1.5'>
              <Tag className='size-3.5' />
              Thương hiệu
            </label>
            <div className='flex gap-2'>
              <input
                value={brandInput}
                onChange={(e) => setBrandInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addBrand(brandInput);
                  } else if (e.key === ',' || e.key === ';') {
                    e.preventDefault();
                    addBrand(brandInput);
                  }
                }}
                placeholder='Nhập tên hãng, nhấn Enter hoặc ,'
                className={cn(inputCls(), 'flex-1')}
              />
              <button
                type='button'
                onClick={() => addBrand(brandInput)}
                className='flex items-center gap-1 rounded-sm border border-gray-200 dark:border-white/8 px-3 text-sm text-text-sub hover:bg-gray-50 dark:hover:bg-white/8 transition'
              >
                <Plus className='size-3.5' />
                Thêm
              </button>
            </div>
            {brands.length > 0 && (
              <div className='flex flex-wrap gap-1.5 mt-1'>
                {brands.map((b) => (
                  <span
                    key={b}
                    className='flex items-center gap-1 rounded-full bg-theme-primary-start/10 px-2.5 py-0.5 text-xs font-medium text-theme-primary-start'
                  >
                    {b}
                    <button type='button' onClick={() => removeBrand(b)}>
                      <X className='size-3' />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className='flex justify-end gap-3 border-t border-gray-100 dark:border-white/8 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='rounded-sm border border-gray-200 dark:border-white/8 px-4 py-2 text-sm font-medium text-text-main hover:bg-gray-50 dark:hover:bg-white/8 transition'
            >
              Huỷ
            </button>
            <button
              type='submit'
              className='rounded-sm bg-theme-primary-start px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition'
            >
              {isEdit ? 'Lưu thay đổi' : 'Tạo danh mục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
