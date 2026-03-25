import { ProductFormPage } from '@/components/dashboard/products/product-form-page';
import { products } from '@/data/products';

interface Props {
  params: Promise<{ productId: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { productId } = await params;
  const product = products.find((p) => p.productId === productId);

  return <ProductFormPage mode='edit' initialProduct={product} />;
}
