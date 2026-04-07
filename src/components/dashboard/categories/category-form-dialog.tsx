'use client';

import { useRef, useState } from 'react';
import { X, Loader2, Upload, Link as LinkIcon, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from '@/features/categories/hooks/use-category-management';
import { useUploadFileMutation } from '@/features/files/hooks/use-files';
import type { CategoryResponse } from '@/features/categories/types';
import { CategoryTreeSelect } from './category-tree-select';

// ─── Props ────────────────────────────────────────────────────────────────────

interface CategoryFormDialogProps {
  /** null = create mode; non-null = edit mode */
  target: CategoryResponse | null;
  /** pre-selected parentId when adding a child from tree */
  defaultParentId?: string | null;
  onClose: () => void;
}

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  parentId: string; // "" means root (null on submit)
  sortOrder: string; // string for controlled input; parsed on submit
  isActive: boolean;
  imageUrl: string;
}

function initForm(
  target: CategoryResponse | null,
  defaultParentId?: string | null,
): FormState {
  if (target) {
    return {
      name: target.name,
      parentId: target.parentId ?? '',
      sortOrder: String(target.sortOrder),
      isActive: target.isActive,
      imageUrl: target.imageUrl ?? '',
    };
  }
  return {
    name: '',
    parentId: defaultParentId ?? '',
    sortOrder: '',
    isActive: true,
    imageUrl: '',
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CategoryFormDialog({
  target,
  defaultParentId,
  onClose,
}: CategoryFormDialogProps) {
  const isEdit = target !== null;

  const [form, setForm] = useState<FormState>(() =>
    initForm(target, defaultParentId),
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [urlMode, setUrlMode] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const uploadMutation = useUploadFileMutation();
  const isPending = createMutation.isPending || updateMutation.isPending;

  // ── Validation ─────────────────────────────────────────────────────────────

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = 'Tên danh mục là bắt buộc';
    const so = parseInt(form.sortOrder, 10);
    if (form.sortOrder !== '' && (isNaN(so) || so < 1)) {
      e.sortOrder = 'Thứ tự phải là số nguyên >= 1';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Upload image ───────────────────────────────────────────────────────────

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setIsUploading(true);
    try {
      const result = await uploadMutation.mutateAsync({
        file,
        folder: 'categories',
      });
      setForm((f) => ({ ...f, imageUrl: result.fileUrl }));
      setUrlMode(false);
    } catch {
      setServerError('Tải ảnh lên thất bại. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    const sortOrderNum =
      form.sortOrder !== '' ? parseInt(form.sortOrder, 10) : undefined;
    const parentIdValue = form.parentId === '' ? null : form.parentId;

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          categoryId: target.categoryId,
          payload: {
            name: form.name.trim(),
            parentId: parentIdValue,
            sortOrder: sortOrderNum,
            isActive: form.isActive,
            imageUrl: form.imageUrl || undefined,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: form.name.trim(),
          parentId: parentIdValue ?? undefined,
          sortOrder: sortOrderNum,
          imageUrl: form.imageUrl || undefined,
        });
      }
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Có lỗi xảy ra, vui lòng thử lại';
      setServerError(msg);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const inputCls = (hasErr?: boolean) =>
    cn(
      'w-full rounded-lg border px-3 py-2 text-sm outline-none transition',
      'bg-white dark:bg-surface-card text-text-main placeholder:text-text-sub',
      'focus:ring-2 focus:ring-theme-primary-start/30 focus:border-theme-primary-start',
      hasErr ? 'border-red-400' : 'border-gray-200 dark:border-white/15',
    );

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm'>
      <div className='w-full max-w-lg rounded-xl bg-white dark:bg-surface-card shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-100 dark:border-white/8 px-6 py-4'>
          <h2 className='text-base font-semibold text-text-main'>
            {isEdit ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          </h2>
          <button
            type='button'
            onClick={onClose}
            className='flex size-8 items-center justify-center rounded-md text-text-sub hover:bg-gray-100 dark:hover:bg-white/8 hover:text-text-main'
          >
            <X className='size-4' />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-5 px-6 py-5'>
          {/* Server error */}
          {serverError && (
            <p className='rounded-md bg-red-50 dark:bg-red-900/20 px-4 py-2.5 text-sm text-red-600 dark:text-red-400'>
              {serverError}
            </p>
          )}

          {/* Name */}
          <div className='space-y-1.5'>
            <label className='block text-sm font-medium text-text-main'>
              Tên danh mục <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder='Ví dụ: Máy ảnh mirrorless'
              className={inputCls(!!errors.name)}
              disabled={isPending}
            />
            {errors.name && (
              <p className='text-xs text-red-500'>{errors.name}</p>
            )}
          </div>

          {/* Image URL */}
          <div className='space-y-1.5'>
            <label className='block text-sm font-medium text-text-main'>
              Ảnh đại diện
            </label>
            <div className='flex gap-3'>
              {/* Preview */}
              <div className='relative size-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-white/15 bg-gray-50 dark:bg-white/4'>
                {isUploading ? (
                  <div className='flex h-full w-full items-center justify-center'>
                    <Loader2 className='size-5 animate-spin text-theme-primary-start' />
                  </div>
                ) : form.imageUrl ? (
                  <Image
                    src={form.imageUrl}
                    alt='Ảnh danh mục'
                    fill
                    sizes='80px'
                    className='object-contain p-1'
                  />
                ) : (
                  <div className='flex h-full w-full items-center justify-center'>
                    <ImageIcon className='size-8 text-gray-300' />
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className='flex flex-1 flex-col gap-2'>
                {/* Toggle buttons */}
                <div className='flex gap-2'>
                  <button
                    type='button'
                    onClick={() => setUrlMode(true)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition',
                      urlMode
                        ? 'border-theme-primary-start bg-theme-primary-start/5 text-theme-primary-start'
                        : 'border-gray-200 dark:border-white/15 bg-white dark:bg-surface-card text-text-sub hover:bg-gray-50 dark:hover:bg-white/5',
                    )}
                  >
                    <LinkIcon size={12} />
                    Nhập URL
                  </button>
                  <button
                    type='button'
                    onClick={() => fileRef.current?.click()}
                    disabled={isUploading || isPending}
                    className={cn(
                      'flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition',
                      !urlMode
                        ? 'border-theme-primary-start bg-theme-primary-start/5 text-theme-primary-start'
                        : 'border-gray-200 dark:border-white/15 bg-white dark:bg-surface-card text-text-sub hover:bg-gray-50 dark:hover:bg-white/5',
                      (isUploading || isPending) &&
                        'opacity-60 cursor-not-allowed',
                    )}
                  >
                    <Upload size={12} />
                    {isUploading ? 'Đang tải...' : 'Tải lên'}
                  </button>
                  <input
                    ref={fileRef}
                    type='file'
                    accept='image/*'
                    className='hidden'
                    onChange={handleFileChange}
                  />
                </div>

                {/* URL input */}
                {urlMode && (
                  <input
                    type='url'
                    value={form.imageUrl}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, imageUrl: e.target.value }))
                    }
                    placeholder='https://example.com/category.jpg'
                    className={inputCls()}
                    disabled={isPending}
                  />
                )}
                {!urlMode && form.imageUrl && (
                  <p className='w-0 min-w-full truncate text-xs text-text-sub'>
                    {form.imageUrl}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Parent + Sort order */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <label className='block text-sm font-medium text-text-main'>
                Danh mục cha
              </label>
              <CategoryTreeSelect
                value={form.parentId}
                onChange={(id) => setForm((f) => ({ ...f, parentId: id }))}
                excludeId={target?.categoryId}
                allowRoot
                rootLabel='— Danh mục gốc —'
                disabled={isPending}
              />
            </div>

            <div className='space-y-1.5'>
              <label className='block text-sm font-medium text-text-main'>
                Thứ tự hiển thị
              </label>
              <input
                type='number'
                min={1}
                step={1}
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sortOrder: e.target.value }))
                }
                placeholder='Tự động'
                className={inputCls(!!errors.sortOrder)}
                disabled={isPending}
              />
              {errors.sortOrder && (
                <p className='text-xs text-red-500'>{errors.sortOrder}</p>
              )}
            </div>
          </div>

          {/* isActive — edit mode only */}
          {isEdit && (
            <div className='flex items-center justify-between rounded-lg border border-gray-100 dark:border-white/8 bg-gray-50/60 dark:bg-white/3 px-4 py-3'>
              <div>
                <p className='text-sm font-medium text-text-main'>
                  Trạng thái hoạt động
                </p>
                <p className='text-xs text-text-sub mt-0.5'>
                  Danh mục ẩn sẽ không hiển thị trên trang khách hàng
                </p>
              </div>
              <button
                type='button'
                role='switch'
                aria-checked={form.isActive}
                onClick={() =>
                  setForm((f) => ({ ...f, isActive: !f.isActive }))
                }
                disabled={isPending}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
                  'transition-colors duration-200 ease-in-out',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary-start',
                  form.isActive
                    ? 'bg-theme-primary-start'
                    : 'bg-gray-200 dark:bg-white/20',
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md',
                    'transform transition duration-200 ease-in-out',
                    form.isActive ? 'translate-x-5' : 'translate-x-0',
                  )}
                />
              </button>
            </div>
          )}

          {/* Footer */}
          <div className='flex justify-end gap-3 border-t border-gray-100 dark:border-white/8 pt-4'>
            <button
              type='button'
              onClick={onClose}
              disabled={isPending}
              className='rounded-lg border border-gray-200 dark:border-white/15 px-4 py-2 text-sm text-text-sub transition hover:bg-gray-50 dark:hover:bg-white/5'
            >
              Hủy
            </button>
            <button
              type='submit'
              disabled={isPending}
              className={cn(
                'flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium text-white transition',
                'bg-linear-to-r from-theme-primary-start to-theme-primary-end',
                'hover:opacity-90 disabled:opacity-60',
              )}
            >
              {isPending && <Loader2 className='size-4 animate-spin' />}
              {isEdit ? 'Cập nhật' : 'Tạo danh mục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
