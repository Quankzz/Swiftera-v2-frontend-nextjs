import { mockOr, apiPatch, USE_MOCK } from './apiService';
import { MOCK_PRODUCTS } from '@/data/mockDashboard';
import type {
  DashboardProduct,
  ProductStatus,
  ProductCondition,
} from '@/types/dashboard.types';

// ─── Fetch all products (staff hub) ──────────────────────────────────────────
export async function getProducts(): Promise<DashboardProduct[]> {
  return mockOr('/products', MOCK_PRODUCTS);
}

// ─── Fetch single product ─────────────────────────────────────────────────────
export async function getProductById(id: string): Promise<DashboardProduct> {
  if (USE_MOCK) {
    const product = MOCK_PRODUCTS.find((p) => p.product_item_id === id);
    if (!product) throw new Error(`Product ${id} not found`);
    return Promise.resolve(product);
  }
  return import('./apiService').then(({ apiGet }) =>
    apiGet<DashboardProduct>(`/products/${id}`),
  );
}

// ─── Update product status ────────────────────────────────────────────────────
export async function updateProductStatus(
  id: string,
  status: ProductStatus,
): Promise<DashboardProduct> {
  if (USE_MOCK) {
    const product = MOCK_PRODUCTS.find((p) => p.product_item_id === id);
    if (!product) throw new Error(`Product ${id} not found`);
    product.status = status;
    return Promise.resolve({ ...product });
  }
  return apiPatch<DashboardProduct>(`/products/${id}/status`, { status });
}

// ─── Update product condition ─────────────────────────────────────────────────
export async function updateProductCondition(
  id: string,
  condition: ProductCondition,
): Promise<DashboardProduct> {
  if (USE_MOCK) {
    const product = MOCK_PRODUCTS.find((p) => p.product_item_id === id);
    if (!product) throw new Error(`Product ${id} not found`);
    product.condition = condition;
    return Promise.resolve({ ...product });
  }
  return apiPatch<DashboardProduct>(`/products/${id}/condition`, { condition });
}
