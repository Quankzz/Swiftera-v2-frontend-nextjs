'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import {
  countDescendants,
  useCategoryStore,
} from '@/stores/use-category-store';
import type { Category } from '@/types/catalog';

interface CategoryDeleteDialogProps {
  category: Category;
  onClose: () => void;
}

export function CategoryDeleteDialog({
  category,
  onClose,
}: CategoryDeleteDialogProps) {
  const { categories, deleteCategory } = useCategoryStore();
  const [cascade, setCascade] = useState(true);

  const descendantCount = countDescendants(categories, category.categoryId);
  const hasChildren = descendantCount > 0;

  const handleDelete = () => {
    deleteCategory(category.categoryId, cascade);
    onClose();
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className='w-full max-w-md rounded-xl bg-white shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-100 px-6 py-4'>
          <div className='flex items-center gap-2 text-red-500'>
            <AlertTriangle className='size-5' />
            <h2 className='text-base font-semibold'>Xoá danh mục</h2>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='rounded-sm p-1 text-text-sub hover:bg-gray-100 transition'
          >
            <X className='size-4' />
          </button>
        </div>

        {/* Body */}
        <div className='px-6 py-5 flex flex-col gap-4'>
          <p className='text-sm text-text-main'>
            Bạn có chắc muốn xoá danh mục{' '}
            <span className='font-semibold'>&ldquo;{category.name}&rdquo;</span>
            ?
          </p>

          {hasChildren && (
            <div className='rounded-sm border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800'>
              <p className='font-medium mb-2'>
                Danh mục này có {descendantCount} danh mục con.
              </p>
              <div className='flex flex-col gap-2'>
                <label className='flex items-start gap-2.5 cursor-pointer'>
                  <input
                    type='radio'
                    name='deleteMode'
                    checked={cascade}
                    onChange={() => setCascade(true)}
                    className='mt-0.5 accent-red-500'
                  />
                  <span>
                    <span className='font-medium text-red-700'>Xoá tất cả</span>{' '}
                    — xoá danh mục này và {descendantCount} danh mục con.
                  </span>
                </label>
                <label className='flex items-start gap-2.5 cursor-pointer'>
                  <input
                    type='radio'
                    name='deleteMode'
                    checked={!cascade}
                    onChange={() => setCascade(false)}
                    className='mt-0.5 accent-amber-600'
                  />
                  <span>
                    <span className='font-medium'>Chỉ xoá danh mục này</span> —
                    các danh mục con sẽ được chuyển lên cấp cha.
                  </span>
                </label>
              </div>
            </div>
          )}

          <p className='text-xs text-text-sub'>
            Hành động này không thể hoàn tác.
          </p>
        </div>

        {/* Footer */}
        <div className='flex justify-end gap-3 border-t border-gray-100 px-6 py-4'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-sm border border-gray-200 px-4 py-2 text-sm font-medium text-text-main hover:bg-gray-50 transition'
          >
            Huỷ
          </button>
          <button
            type='button'
            onClick={handleDelete}
            className='rounded-sm bg-red-500 px-5 py-2 text-sm font-semibold text-white hover:bg-red-600 transition'
          >
            Xoá
            {hasChildren && !cascade
              ? ' danh mục này'
              : cascade && hasChildren
                ? ' tất cả'
                : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
