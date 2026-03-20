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
    productId: 'prod-samsung-s24-ultra',
    categoryId: 'cat-phones',
    name: 'Samsung Galaxy S24 Ultra',
    dailyPrice: 320000,
    oldDailyPrice: 400000,
    depositAmount: 2800000,
    description:
      '6.8" Dynamic AMOLED 2X, Snapdragon 8 Gen 3, bút S Pen tích hợp.',
    productImages: [
      {
        productId: 'prod-samsung-s24-ultra',
        imageUrl:
          'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80',
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    colors: [
      { name: 'Titanium Black', value: '#2B2B2B' },
      { name: 'Titanium Gray', value: '#8C8C8C' },
      { name: 'Titanium Violet', value: '#7B5EA7' },
    ],
    minRentalDays: 1,
  },
  {
    productId: 'prod-asus-rog-phone-8',
    categoryId: 'cat-phones',
    name: 'ASUS ROG Phone 8 Pro',
    dailyPrice: 290000,
    oldDailyPrice: 370000,
    depositAmount: 2500000,
    description:
      '6.78" AMOLED 165Hz, Snapdragon 8 Gen 3, pin 5500mAh, tản nhiệt AeroActive.',
    productImages: [
      {
        productId: 'prod-asus-rog-phone-8',
        imageUrl:
          'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    colors: [
      { name: 'Phantom Black', value: '#1A1A1A' },
      { name: 'Storm White', value: '#F0F0F0' },
    ],
    minRentalDays: 1,
  },
  {
    productId: 'prod-ipad-pro-m4',
    categoryId: 'cat-tablets',
    name: 'iPad Pro 13" M4',
    dailyPrice: 400000,
    oldDailyPrice: 520000,
    depositAmount: 4000000,
    description:
      'Chip M4 siêu mỏng 5.1mm, màn OLED Ultra Retina XDR, hỗ trợ Apple Pencil Pro.',
    productImages: [
      {
        productId: 'prod-ipad-pro-m4',
        imageUrl:
          'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80',
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    colors: [
      { name: 'Silver', value: '#E8E8ED' },
      { name: 'Space Black', value: '#1C1C1E' },
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
    name: 'PlayStation 5 Slim',
    dailyPrice: 200000,
    oldDailyPrice: 280000,
    depositAmount: 2000000,
    description: 'Bản Slim, tay cầm DualSense, hỗ trợ ray tracing 4K.',
    productImages: [
      {
        productId: 'prod-ps5',
        imageUrl:
          'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=600&q=80',
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    colors: [{ name: 'White', value: '#F0F0F0' }],
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
    productId: 'prod-xiaomi-vacuum',
    categoryId: 'cat-smart-home',
    name: 'Xiaomi Robot Vacuum S20+',
    dailyPrice: 90000,
    oldDailyPrice: 120000,
    depositAmount: 800000,
    description: 'Hút 10000Pa, lập bản đồ LDS, mop rung siêu âm, pin 5200mAh.',
    productImages: [
      {
        productId: 'prod-xiaomi-vacuum',
        imageUrl:
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
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
    productId: 'prod-dell-xps-15',
    categoryId: 'cat-computers',
    name: 'Dell XPS 15 OLED',
    dailyPrice: 430000,
    oldDailyPrice: 560000,
    depositAmount: 4500000,
    description: '15.6" OLED 3.5K, Intel Core Ultra 9, RAM 32GB, SSD 1TB.',
    productImages: [
      {
        productId: 'prod-dell-xps-15',
        imageUrl:
          'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=600&q=80',
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    colors: [
      { name: 'Platinum', value: '#E5E4E2' },
      { name: 'Graphite', value: '#383838' },
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
  {
    productId: 'prod-bose-qc45',
    categoryId: 'cat-audio',
    name: 'Bose QuietComfort 45',
    dailyPrice: 65000,
    oldDailyPrice: 85000,
    depositAmount: 500000,
    description:
      'ANC chế độ kép, pin 24h, âm thanh TriPort, kết nối Multipoint.',
    productImages: [
      {
        productId: 'prod-bose-qc45',
        imageUrl:
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    colors: [
      { name: 'Triple Black', value: '#1C1C1C' },
      { name: 'White Smoke', value: '#F5F5F0' },
    ],
    minRentalDays: 1,
  },
];
