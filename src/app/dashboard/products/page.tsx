'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductsGrid } from '@/components/dashboard/products/products-grid';
import { ProductViewDialog } from '@/components/dashboard/products/product-view-dialog';
import { ProductDeleteDialog } from '@/components/dashboard/products/product-delete-dialog';
import type { Product } from '@/types/catalog';

export default function ProductsPage() {
  const router = useRouter();
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const handleDeleteMany = (ids: string[]) => {
    // TODO: gọi API batch delete
    console.log('Xóa nhiều sản phẩm:', ids);
  };

  const handleConfirmDelete = (product: Product) => {
    // TODO: gọi API xóa đơn
    console.log('Xóa sản phẩm:', product.productId);
  };

  return (
    <div className='flex flex-col gap-6 w-full p-6'>
      {/* Page header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight text-text-main'>
            Quản lý sản phẩm
          </h2>
          <p className='mt-1 text-sm text-text-sub'>
            Xem, thêm mới, sửa hoặc xóa sản phẩm cho thuê
          </p>
        </div>

        <Button
          size='lg'
          className='bg-theme-primary-start hover:opacity-90 transition-opacity'
          onClick={() => router.push('/dashboard/products/new')}
        >
          <Plus className='mr-2 size-4' />
          Thêm sản phẩm
        </Button>
      </div>

      {/* Product grid with toolbar */}
      <ProductsGrid
        onView={(p) => setViewProduct(p)}
        onEdit={(p) => router.push(`/dashboard/products/${p.productId}/edit`)}
        onDelete={(p) => setDeleteProduct(p)}
        onDeleteMany={handleDeleteMany}
      />

      {/* View dialog */}
      <ProductViewDialog
        product={viewProduct}
        open={viewProduct !== null}
        onClose={() => setViewProduct(null)}
      />

      {/* Delete dialog */}
      <ProductDeleteDialog
        product={deleteProduct}
        open={deleteProduct !== null}
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
