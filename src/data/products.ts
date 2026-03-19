import type { Product } from '@/types/catalog';

export const products: Product[] = [
  {
    productId: 'prod-iphone-15-pro',
    categoryId: 'cat-phones',
    name: 'iPhone 15 Pro Max',
    dailyPrice: 350000,
    oldDailyPrice: 450000,
    depositAmount: 3000000,
    description: '6.7" LTPO OLED, A17 Pro, camera tetraprism 5x.',
    productImages: [
      {
        productId: 'prod-iphone-15-pro',
        imageUrl:
          'https://cdn2.fptshop.com.vn/unsafe/750x0/filters:format(webp):quality(75)/2023_9_20_638307989548944936_iphone-15-promax-xanh-1.jpg',
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    colors: [
      { name: 'Blue Titanium', value: '#8DA6B3' },
      { name: 'Black Titanium', value: '#2E3440' },
      { name: 'Natural Titanium', value: '#B9B1A5' },
      { name: 'White Titanium', value: '#D9D6CF' },
    ],
    minRentalDays: 1,
  },
  {
    productId: 'prod-switch-oled',
    categoryId: 'cat-consoles',
    name: 'Nintendo Switch OLED + Mario Kart',
    dailyPrice: 120000,
    oldDailyPrice: 150000,
    depositAmount: 1500000,
    description: 'Màn 7" OLED, Joy-Con bundle, tặng kèm game Mario Kart.',
    productImages: [
      {
        productId: 'prod-switch-oled',
        imageUrl:
          'https://m.media-amazon.com/images/I/6181h344+6L._AC_UF1000,1000_QL80_.jpg',
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    minRentalDays: 1,
  },
  {
    productId: 'prod-ps5',
    categoryId: 'cat-consoles',
    name: 'PlayStation 5',
    dailyPrice: 200000,
    oldDailyPrice: 280000,
    depositAmount: 2000000,
    description: 'Bản Slim, tay cầm DualSense, hỗ trợ ray tracing 4K.',
    productImages: [
      {
        productId: 'prod-ps5',
        imageUrl:
          'https://images.unsplash.com/photo-1606813909355-245f1ac35b53?auto=format&fit=crop&w=600&q=80',
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    minRentalDays: 1,
  },
  {
    productId: 'prod-robot-cleaner',
    categoryId: 'cat-smart-home',
    name: 'Dreame X50 Ultra',
    dailyPrice: 150000,
    oldDailyPrice: 180000,
    depositAmount: 1200000,
    description: 'Hút 20kPa, tránh vật cản AI, tự làm rỗng hộc chứa.',
    productImages: [
      {
        productId: 'prod-robot-cleaner',
        imageUrl:
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    minRentalDays: 1,
  },
  {
    productId: 'prod-macbook-pro',
    categoryId: 'cat-computers',
    name: 'MacBook Pro 14" M3 Pro',
    dailyPrice: 500000,
    oldDailyPrice: 650000,
    depositAmount: 5000000,
    description: 'CPU 12 nhân, RAM 18GB, SSD 1TB, Liquid Retina XDR.',
    productImages: [
      {
        productId: 'prod-macbook-pro',
        imageUrl:
          'https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?auto=format&fit=crop&w=600&q=80',
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    colors: [
      { name: 'Space Black', value: '#1C1C1E' },
      { name: 'Silver', value: '#E8E8ED' },
    ],
    minRentalDays: 1,
  },
  {
    productId: 'prod-sony-headphones',
    categoryId: 'cat-audio',
    name: 'Sony WH-1000XM5',
    dailyPrice: 80000,
    oldDailyPrice: 100000,
    depositAmount: 600000,
    description: 'ANC thích ứng, pin 30h, Bluetooth đa điểm.',
    productImages: [
      {
        productId: 'prod-sony-headphones',
        imageUrl:
          'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80',
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    colors: [{ name: 'Matte Black', value: '#1C1C1C' }],
    minRentalDays: 1,
  },
];
