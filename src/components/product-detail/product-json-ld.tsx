/**
 * Product JSON-LD Structured Data
 * Server component - renders schema.org/Product markup for SEO
 */

interface ProductJsonLdProps {
  productId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  brand?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
}

export function ProductJsonLd({
  productId,
  name,
  description,
  imageUrl,
  price,
  currency = 'VND',
  brand,
  category,
  rating,
  reviewCount,
}: ProductJsonLdProps) {
  const siteUrl = 'https://swiftera.vn';
  const productUrl = `${siteUrl}/product/${productId}`;

  const aggregateRating = rating && reviewCount ? {
    '@type': 'AggregateRating',
    ratingValue: rating.toFixed(1),
    reviewCount: reviewCount,
    bestRating: '5',
    worstRating: '1',
  } : null;

  const offers = price ? {
    '@type': 'Offer',
    price: price.toString(),
    priceCurrency: currency,
    availability: 'https://schema.org/InStock',
    url: productUrl,
    seller: {
      '@type': 'Organization',
      name: 'Swiftera',
    },
  } : null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': productUrl,
    name,
    description,
    url: productUrl,
    ...(imageUrl && {
      image: [imageUrl],
    }),
    ...(brand && {
      brand: {
        '@type': 'Brand',
        name: brand,
      },
    }),
    ...(category && {
      category,
    }),
    ...(aggregateRating && { aggregateRating }),
    ...(offers && { offers }),
    ...(reviewCount !== undefined && reviewCount > 0 && {
      review: {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: rating?.toFixed(1) ?? '0',
          bestRating: '5',
          worstRating: '1',
        },
        reviewBody: `Sản phẩm ${name} trên Swiftera`,
      },
    }),
  };

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * BreadcrumbList JSON-LD for product page
 */
export function ProductBreadcrumbJsonLd({
  productId,
  productName,
  categoryName,
}: {
  productId: string;
  productName: string;
  categoryName?: string;
}) {
  const siteUrl = 'https://swiftera.vn';

  const itemListElement = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Trang chủ',
      item: siteUrl,
    },
    ...(categoryName
      ? [
          {
            '@type': 'ListItem' as const,
            position: 2,
            name: categoryName,
            item: `${siteUrl}/catalog`,
          },
        ]
      : []),
    {
      '@type': 'ListItem',
      position: categoryName ? 3 : 2,
      name: productName,
      item: `${siteUrl}/product/${productId}`,
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
