import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id } = await params;
  const search = await searchParams;
  const rawReview = search?.review;
  const reviewId = Array.isArray(rawReview) ? rawReview[0] : rawReview;

  const title = 'Swiftera - Cho thuê sản phẩm ngắn hạn';
  const description =
    'Nền tảng cho thuê sản phẩm linh hoạt, nhanh chóng và tin cậy tại Việt Nam. Thuê máy ảnh, drone, thiết bị điện tử và nhiều hơn nữa với giá cả hợp lý.';
  const url = `https://swiftera.vn/product/${id}`;

  const canonical = reviewId ? `${url}?review=${reviewId}` : url;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'website',
      locale: 'vi_VN',
      url,
      siteName: 'Swiftera',
      title,
      description,
      images: [
        {
          url: 'https://swiftera.vn/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Swiftera - Cho thuê sản phẩm ngắn hạn',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://swiftera.vn/og-image.png'],
      site: '@swiftera_vn',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children;
}
