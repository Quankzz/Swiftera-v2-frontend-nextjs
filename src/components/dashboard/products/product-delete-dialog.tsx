'use client';

import { Trash2, X, AlertTriangle } from 'lucide-react';
import type { ProductResponse } from '@/features/products/types';
import { stripHtml } from '@/lib/rich-text';

interface ProductDeleteDialogProps {
  product: ProductResponse | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (product: ProductResponse) => void;
}

export function ProductDeleteDialog({
  product,
  open,
  onClose,
  onConfirm,
}: ProductDeleteDialogProps) {
  if (!open || !product) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Panel */}
      <div className='relative z-10 w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-100 px-6 py-4'>
          <div className='flex items-center gap-3'>
            <div className='flex size-9 items-center justify-center rounded-md bg-red-50'>
              <AlertTriangle size={18} className='text-red-500' />
            </div>
            <h2 className='text-base font-semibold text-text-main'>
              Xác nhận xóa sản phẩm
            </h2>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='flex size-8 items-center justify-center rounded-md text-text-sub transition hover:bg-gray-100 hover:text-text-main'
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className='px-6 py-5'>
          <p className='text-sm text-text-sub'>
            Bạn có chắc chắn muốn xóa sản phẩm dưới đây không? Thao tác này
            không thể hoàn tác.
          </p>
          <div className='mt-4 rounded-md border border-red-100 bg-red-50 px-4 py-3'>
            <p className='font-semibold text-text-main'>{product.name}</p>
            {product.description && (
              <p className='mt-0.5 line-clamp-2 text-sm text-text-sub'>
                {stripHtml(product.description)}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className='flex justify-end gap-3 border-t border-gray-100 px-6 py-4'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-md border border-gray-200 px-5 py-2.5 text-sm font-medium text-text-main transition hover:bg-gray-50'
          >
            Hủy bỏ
          </button>
          <button
            type='button'
            onClick={() => {
              onConfirm(product);
              onClose();
            }}
            className='flex items-center gap-2 rounded-md bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-600'
          >
            <Trash2 size={15} />
            Xóa sản phẩm
          </button>
        </div>
      </div>
    </div>
  );
}
