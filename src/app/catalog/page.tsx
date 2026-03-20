import type { Metadata } from 'next';
import { Layout } from '@/components/Layout';
import { CatalogGrid } from '@/components/catalog/catalog-grid';
import type { SortOption } from '@/components/catalog/catalog-header';

interface CatalogSearchParams {
  q?: string;
  category?: string;
  sort?: string;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const title = params.q
    ? `Tìm kiếm "${params.q}" — Swiftera`
    : 'Danh mục sản phẩm — Swiftera';
  return { title };
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

  const query = params.q ?? '';
  const categoryId = params.category ?? undefined;
  const sort: SortOption = VALID_SORTS.includes(params.sort as SortOption)
    ? (params.sort as SortOption)
    : 'relevance';

  return (
    <Layout>
      <div className='mx-auto w-full px-4 py-8 lg:px-18'>
        <CatalogGrid
          initialQuery={query}
          initialCategoryId={categoryId}
          initialSort={sort}
        />
      </div>
    </Layout>
  );
}
