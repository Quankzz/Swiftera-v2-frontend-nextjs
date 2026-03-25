'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, BoxIcon, PackageCheck, PackageX, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductsGrid } from '@/components/dashboard/products/products-grid';
import { ProductViewDialog } from '@/components/dashboard/products/product-view-dialog';
import { ProductDeleteDialog } from '@/components/dashboard/products/product-delete-dialog';
import { products as allProducts } from '@/data/products';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/catalog';

// ─── Stats tổng hợp từ mock data ──────────────────────────────────
function computeStats(products: Product[]) {
  let totalUnits = 0;
  let available = 0;
  let rented = 0;
  let maintenance = 0;
  for (const p of products) {
    const items = p.inventoryItems ?? [];
    totalUnits += items.length;
    available += items.filter((i) => i.status === 'AVAILABLE').length;
    rented += items.filter((i) => i.status === 'RENTED').length;
    maintenance += items.filter((i) => i.status === 'MAINTENANCE').length;
  }
  return {
    totalProducts: products.length,
    totalUnits,
    available,
    rented,
    maintenance,
  };
}

function StatCard({
  label,
  value,
  icon: Icon,
  colorCls,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  colorCls: string;
}) {
  return (
    <div className='flex items-center gap-3 rounded-xl border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-5 py-4 shadow-sm'>
      <span
        className={cn(
          'flex size-10 items-center justify-center rounded-xl',
          colorCls,
        )}
      >
        <Icon size={18} />
      </span>
      <div>
        <p className='text-2xl font-bold text-text-main'>{value}</p>
        <p className='text-xs text-text-sub'>{label}</p>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const router = useRouter();
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const stats = computeStats(allProducts);

  const handleDeleteMany = (ids: string[]) => {
    console.log('Xóa nhiều sản phẩm:', ids);
  };

  const handleConfirmDelete = (product: Product) => {
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
            Xem, thêm mới, sửa hoặc xóa sản phẩm cho thuê. Mỗi sản phẩm có thể
            có nhiều thiết bị vật lý (serial).
          </p>
        </div>

        <Button
          size='lg'
          className='bg-theme-primary-start hover:opacity-90 transition-opacity text-white'
          onClick={() => router.push('/dashboard/products/new')}
        >
          <Plus className='mr-2 size-4' />
          Thêm sản phẩm
        </Button>
      </div>

      {/* Stats bar */}
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
        <StatCard
          label='Loại sản phẩm'
          value={stats.totalProducts}
          icon={BoxIcon}
          colorCls='bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
        />
        <StatCard
          label='Sẵn sàng cho thuê'
          value={stats.available}
          icon={PackageCheck}
          colorCls='bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
        />
        <StatCard
          label='Đang cho thuê'
          value={stats.rented}
          icon={PackageX}
          colorCls='bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
        />
        <StatCard
          label='Đang bảo trì'
          value={stats.maintenance}
          icon={Wrench}
          colorCls='bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
        />
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
        onEdit={(p) => router.push(`/dashboard/products/${p.productId}/edit`)}
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
