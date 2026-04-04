'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { useDeleteCategoryMutation } from '@/features/categories/hooks/use-category-management';
import type { CategoryTreeNode } from '@/features/categories/types';

interface CategoryDeleteDialogProps {
  category: CategoryTreeNode;
  onClose: () => void;
}

export function CategoryDeleteDialog({
  category,
  onClose,
}: CategoryDeleteDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const deleteMutation = useDeleteCategoryMutation();
  const isPending = deleteMutation.isPending;

  const hasChildren = category.children.length > 0;
  const childCount = category.children.length;

  async function handleDelete() {
    setServerError(null);
    try {
      await deleteMutation.mutateAsync(category.categoryId);
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Có lỗi xảy ra, vui lòng thử lại';
      // Surface friendly message for known BE errors
      if (
        typeof msg === 'string' &&
        msg.toUpperCase().includes('CATEGORY_HAS_PRODUCTS')
      ) {
        setServerError(
          'Không thể xoá: danh mục này đang chứa sản phẩm. Hãy chuyển hoặc xoá các sản phẩm trước.',
        );
      } else {
        setServerError(msg);
      }
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm'>
      <div className='w-full max-w-md rounded-xl bg-white dark:bg-surface-card shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-100 dark:border-white/8 px-6 py-4'>
          <div className='flex items-center gap-2 text-red-500'>
            <AlertTriangle className='size-5' />
            <h2 className='text-base font-semibold'>Xoá danh mục</h2>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='flex size-8 items-center justify-center rounded-md text-text-sub hover:bg-gray-100 dark:hover:bg-white/8 hover:text-text-main'
          >
            <X className='size-4' />
          </button>
        </div>

        {/* Body */}
        <div className='flex flex-col gap-4 px-6 py-5'>
          {/* Server error */}
          {serverError && (
            <p className='rounded-md bg-red-50 dark:bg-red-900/20 px-4 py-2.5 text-sm text-red-600 dark:text-red-400'>
              {serverError}
            </p>
          )}

          <p className='text-sm text-text-main'>
            Bạn có chắc muốn xoá danh mục{' '}
            <span className='font-semibold'>&ldquo;{category.name}&rdquo;</span>
            ?
          </p>

          {/* Children promotion notice */}
          {hasChildren && (
            <div className='rounded-lg border border-amber-200 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-900/20 p-4 text-sm text-amber-800 dark:text-amber-300'>
              <p className='font-medium'>
                Danh mục này có {childCount} danh mục con.
              </p>
              <p className='mt-1'>
                Khi xoá, các danh mục con sẽ được tự động chuyển lên cấp cha của
                danh mục này (không xoá theo).
              </p>
            </div>
          )}

          <p className='text-xs text-text-sub'>
            Hành động này không thể hoàn tác.
          </p>
        </div>

        {/* Footer */}
        <div className='flex justify-end gap-3 border-t border-gray-100 dark:border-white/8 px-6 py-4'>
          <button
            type='button'
            onClick={onClose}
            disabled={isPending}
            className='rounded-lg border border-gray-200 dark:border-white/15 px-4 py-2 text-sm text-text-sub transition hover:bg-gray-50 dark:hover:bg-white/5'
          >
            Hủy
          </button>
          <button
            type='button'
            onClick={handleDelete}
            disabled={isPending}
            className='flex items-center gap-2 rounded-lg bg-red-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-60'
          >
            {isPending && <Loader2 className='size-4 animate-spin' />}
            Xoá danh mục
          </button>
        </div>
      </div>
    </div>
  );
}
