import {
  ProductJsonLd,
  ProductBreadcrumbJsonLd,
} from "@/components/product-detail/product-json-ld";
import { stripHtml } from "@/lib/rich-text";
import {
  getProductByIdServer,
  getReviewsByProductServer,
} from "@/lib/server-api";
import ProductDetailClient from "./product-detail-client";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;

  try {
    const product = await getProductByIdServer(id);
    const p = product as Record<string, unknown>;
    const name = String(p?.name ?? "Sản phẩm");
    const categoryName = String(p?.categoryName ?? "sản phẩm");
    const dailyPrice = p?.dailyPrice as number | undefined;
    const brand = p?.brand as string | undefined;
    const images = Array.isArray(p?.images)
      ? (p.images as Array<{ imageUrl?: string }>)
      : [];
    const shortDescription =
      typeof p?.shortDescription === "string"
        ? stripHtml(p.shortDescription)
        : "";
    const title = `${name} - Thuê ${categoryName} tại Swiftera`;
    const description =
      shortDescription ||
      `${name} với giá thuê chỉ từ ${dailyPrice ? `${dailyPrice.toLocaleString("vi-VN")}₫/ngày` : ""}. ${brand ? `Thương hiệu ${brand}.` : ""} Đặt thuê ngay tại Swiftera!`;
    const url = `https://swiftera.vn/product/${id}`;

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        type: "website",
        locale: "vi_VN",
        url,
        siteName: "Swiftera",
        title,
        description,
        images: images.length
          ? images.slice(0, 4).map((img) => ({
              url: img.imageUrl ?? "",
              width: 800,
              height: 600,
              alt: `${name} - Swiftera`,
            }))
          : [
              {
                url: "https://swiftera.vn/og-image.png",
                width: 1200,
                height: 630,
                alt: "Swiftera",
              },
            ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: images.length
          ? [images[0].imageUrl ?? "https://swiftera.vn/og-image.png"]
          : ["https://swiftera.vn/og-image.png"],
        site: "@swiftera_vn",
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
    };
  } catch {
    return {
      title: "Sản phẩm - Swiftera",
      description:
        "Nền tảng cho thuê sản phẩm linh hoạt, nhanh chóng và tin cậy tại Việt Nam.",
    };
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  let product: Record<string, unknown> | null = null;
  let reviewsCount = 0;

  try {
    product = (await getProductByIdServer(id)) as Record<string, unknown>;
  } catch {
    // Product not found - handled client-side
  }

  try {
    const reviewsMeta = await getReviewsByProductServer(id, {
      page: 1,
      size: 1,
    });
    reviewsCount = reviewsMeta.totalItems;
  } catch {
    // Reviews not available
  }

  const p = product;
  const imageUrl =
    Array.isArray(p?.images) && (p.images as unknown[]).length > 0
      ? (p.images as Array<{ imageUrl?: string }>)[0]?.imageUrl
      : undefined;

  return (
    <>
      {p && (
        <>
          <ProductJsonLd
            productId={String(p.productId ?? id)}
            name={String(p.name ?? "Sản phẩm")}
            description={
              typeof p.description === "string"
                ? stripHtml(p.description)
                : typeof p.shortDescription === "string"
                  ? stripHtml(p.shortDescription)
                  : undefined
            }
            imageUrl={imageUrl}
            price={typeof p.dailyPrice === "number" ? p.dailyPrice : undefined}
            currency="VND"
            brand={typeof p.brand === "string" ? p.brand : undefined}
            category={
              typeof p.categoryName === "string" ? p.categoryName : undefined
            }
            rating={
              typeof p.averageRating === "number" ? p.averageRating : undefined
            }
            reviewCount={reviewsCount}
          />
          <ProductBreadcrumbJsonLd
            productId={String(p.productId ?? id)}
            productName={String(p.name ?? "Sản phẩm")}
            categoryName={
              typeof p.categoryName === "string" ? p.categoryName : undefined
            }
          />
        </>
      )}
      <ProductDetailClient productId={id} />
    </>
  );
}
