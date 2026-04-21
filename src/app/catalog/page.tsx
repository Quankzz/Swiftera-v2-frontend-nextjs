import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Layout } from '@/components/Layout';
import { CatalogView } from '@/components/catalog/catalog-view';
import { ProductGridSkeleton } from '@/components/catalog/product-card-skeleton';
import type { SortOption } from '@/components/catalog/catalog-header';

interface CatalogSearchParams {
  /** Legacy: category card links use ?category= */
  category?: string;
  /** New: preferred param name */
  categoryId?: string;
  subcategoryId?: string;
  sort?: string;
  page?: string;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  return {
    title: 'Danh mục sản phẩm - Swiftera',
    description:
      params.categoryId || params.category
        ? 'Xem sản phẩm theo danh mục trên Swiftera'
        : 'Khám phá tất cả sản phẩm cho thuê trên Swiftera',
  };
}

const VALID_SORTS: SortOption[] = [
  'relevance',
  'price-asc',
  'price-desc',
  'newest',
];

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  const params = await searchParams;

  // Support both ?category= (home page legacy) and ?categoryId=
  const categoryId = params.categoryId ?? params.category ?? undefined;
  const subcategoryId = params.subcategoryId ?? undefined;
  const sort: SortOption = VALID_SORTS.includes(params.sort as SortOption)
    ? (params.sort as SortOption)
    : 'relevance';
  const page = parseInt(params.page ?? '1', 10) || 1;

  return (
    <Layout>
      <div className='mx-auto w-full px-4 py-8 lg:px-18'>
        {/*
          CatalogView is a client component that uses useSearchParams.
          Wrap in Suspense so the server shell renders immediately.
        */}
        <Suspense fallback={<ProductGridSkeleton count={12} />}>
          <CatalogView
            initialCategoryId={categoryId}
            initialSubcategoryId={subcategoryId}
            initialSort={sort}
            initialPage={page}
          />
        </Suspense>
      </div>
    </Layout>
  );
}
