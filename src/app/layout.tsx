import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppProviders } from '@/providers/app-providers';
import '@/styles/globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Swiftera - Cho thuê sản phẩm ngắn hạn',
  description:
    'Nền tảng cho thuê thiết bị, đồ công nghệ ngắn hạn tại Việt Nam. Thuê máy ảnh, drone, máy chiếu, thiết bị điện tử với giá cả hợp lý, linh hoạt theo ngày.',
  keywords: [
    'cho thuê',
    'thuê thiết bị',
    'thuê máy ảnh',
    'thuê drone',
    'thuê máy chiếu',
    'thuê đồ công nghệ',
    'swiftera',
    'cho thuê ngắn hạn',
    'thuê theo ngày',
  ],
  authors: [{ name: 'Swiftera' }],
  creator: 'Swiftera',
  publisher: 'Swiftera',
  metadataBase: new URL('https://swiftera.vn'),
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon-57x57.png', sizes: '57x57' },
      { url: '/apple-icon-60x60.png', sizes: '60x60' },
      { url: '/apple-icon-72x72.png', sizes: '72x72' },
      { url: '/apple-icon-76x76.png', sizes: '76x76' },
      { url: '/apple-icon-114x114.png', sizes: '114x114' },
      { url: '/apple-icon-120x120.png', sizes: '120x120' },
      { url: '/apple-icon-144x144.png', sizes: '144x144' },
      { url: '/apple-icon-152x152.png', sizes: '152x152' },
      { url: '/apple-icon-180x180.png', sizes: '180x180' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-icon-precomposed.png',
      },
      { rel: 'msapplication-TileImage', url: '/ms-icon-144x144.png' },
    ],
  },
  other: {
    'msapplication-TileColor': '#ffffff',
    'msapplication-config': '/browserconfig.xml',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://swiftera.vn',
    siteName: 'Swiftera',
    title: 'Swiftera - Cho thuê sản phẩm ngắn hạn',
    description:
      'Nền tảng cho thuê thiết bị, đồ công nghệ ngắn hạn tại Việt Nam. Thuê máy ảnh, drone, máy chiếu, thiết bị điện tử với giá cả hợp lý.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Swiftera - Cho thuê sản phẩm ngắn hạn',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Swiftera - Cho thuê sản phẩm ngắn hạn',
    description:
      'Nền tảng cho thuê thiết bị, đồ công nghệ ngắn hạn tại Việt Nam.',
    images: ['/og-image.png'],
    site: '@swiftera_vn',
    creator: '@swiftera_vn',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='vi' suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
