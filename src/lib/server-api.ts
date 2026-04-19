/**
 * Server-side product API
 * Uses native fetch() so it works in React Server Components (RSC).
 * This is only for SSR/SSG - client components should use the regular service.
 */

const API_URL = 'https://swiftera.azurewebsites.net/api/v1';

interface ProductApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: { timestamp?: string; instance?: string };
}

export async function getProductByIdServer(
  productId: string,
): Promise<unknown> {
  const res = await fetch(`${API_URL}/products/${productId}`, {
    next: { revalidate: 60 },
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch product: ${res.status}`);
  }

  const json: ProductApiResponse<unknown> = await res.json();
  return json.data;
}

export async function getReviewsByProductServer(
  productId: string,
  params?: { page?: number; size?: number },
): Promise<{
  totalItems: number;
  items: unknown[];
}> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.size) searchParams.set('size', String(params.size));

  const url = `${API_URL}/reviews/product/${productId}${
    searchParams.toString() ? `?${searchParams.toString()}` : ''
  }`;

  const res = await fetch(url, {
    next: { revalidate: 60 },
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch reviews: ${res.status}`);
  }

  const json: ProductApiResponse<{
    meta: { totalElements: number };
    content: unknown[];
  }> = await res.json();

  return {
    totalItems: json.data.meta?.totalElements ?? 0,
    items: json.data.content ?? [],
  };
}
