import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn2.fptshop.com.vn' },
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      // Product images
      { protocol: 'https', hostname: 'i.dell.com' },
      { protocol: 'https', hostname: 'images.samsung.com' },
      { protocol: 'https', hostname: 'dlcdnwebimgs.asus.com' },
      { protocol: 'https', hostname: 'store.storeimages.cdn-apple.com' },
      { protocol: 'https', hostname: 'gmedia.playstation.com' },
      { protocol: 'https', hostname: 'i01.appmifile.com' },
      { protocol: 'https', hostname: 'assets.bose.com' },
      { protocol: 'https', hostname: 'macone.vn' },
      // Azure Blob Storage (uploaded images)
      { protocol: 'https', hostname: 'swifterastorage.blob.core.windows.net' },
    ],
  },
};

export default nextConfig;
