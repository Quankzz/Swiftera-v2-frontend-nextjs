import type { MetadataRoute } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://swiftera.azurewebsites.net/api/v1';
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://swiftera.vn').replace(/\/+$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/catalog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    const res = await fetch(
      `${API_URL}/products?size=100&onlyWithStock=true&filter=isActive:true`,
      { next: { revalidate: 3600 }, headers: { 'Content-Type': 'application/json' } },
    );
    if (!res.ok) return staticRoutes;

    const json = await res.json();
    const products: Array<{
      productId: string;
      updatedAt?: string;
    }> = json?.data?.content ?? [];

    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      // Guard against invalid/empty updatedAt values from upstream API.
      lastModified: (() => {
        const parsed = product.updatedAt ? new Date(product.updatedAt) : null;
        return parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date();
      })(),
      url: `${BASE_URL}/product/${product.productId}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
