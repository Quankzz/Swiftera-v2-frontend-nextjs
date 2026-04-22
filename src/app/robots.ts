import type { MetadataRoute } from "next";

const DEFAULT_SITE_URL = "https://swiftera.vn";

function normalizeSiteUrl(value?: string): string {
  if (!value) return DEFAULT_SITE_URL;
  return value.replace(/\/+$/, "");
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth/",
          "/dashboard/",
          "/staff-dashboard/",
          "/profile/",
          "/checkout",
          "/payment/",
          "/cart",
          "/rental-orders/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
