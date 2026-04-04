'use client';

import { use } from 'react';
import { ProductFormPage } from '@/components/dashboard/products/product-form-page';
import { useProductQuery } from '@/features/products/hooks/use-product-management';

interface Props {
  params: Promise<{ productId: string }>;
}

export default function EditProductPage({ params }: Props) {
  const { productId } = use(params);
  const { data, isLoading } = useProductQuery(productId);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-32 text-sm text-text-sub'>
        Đang tải sản phẩm...
      </div>
    );
  }

  return <ProductFormPage mode='edit' initialProduct={data} />;
}
