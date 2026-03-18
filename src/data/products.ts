import type { Product } from '@/types/catalog';

export const products: Product[] = [
  {
    productId: 'prod-iphone-15-pro',
    categoryId: 'cat-phones',
    name: 'iPhone 15 Pro Max',
    dailyPrice: 2.33,
    oldDailyPrice: 2.69,
    depositAmount: 149,
    color: 'Titanium Silver',
    description: '6.7" LTPO OLED, A17 Pro, 5x tetraprism camera.',
    image:
      'https://cdn2.fptshop.com.vn/unsafe/750x0/filters:format(webp):quality(75)/2023_9_20_638307989548944936_iphone-15-promax-xanh-1.jpg',
    badge: '-8%',
    colors: [
      { name: 'Blue Titanium', hex: '#8DA6B3' },
      { name: 'Black Titanium', hex: '#2E3440' },
      { name: 'Natural Titanium', hex: '#B9B1A5' },
      { name: 'White Titanium', hex: '#D9D6CF' },
    ],
  },
  {
    productId: 'prod-switch-oled',
    categoryId: 'cat-consoles',
    name: 'Nintendo Switch OLED + Mario Kart',
    dailyPrice: 0.99,
    oldDailyPrice: 1.09,
    depositAmount: 69,
    description: '7" OLED, Joy-Con bundle, full game download included.',
    image:
      'https://m.media-amazon.com/images/I/6181h344+6L._AC_UF1000,1000_QL80_.jpg',
    badge: 'Bundle',
  },
  {
    productId: 'prod-ps5',
    categoryId: 'cat-consoles',
    name: 'PlayStation 5',
    dailyPrice: 1.23,
    oldDailyPrice: 1.49,
    depositAmount: 99,
    description: 'Slim edition, DualSense controller, ray tracing ready.',
    image:
      'https://images.unsplash.com/photo-1606813909355-245f1ac35b53?auto=format&fit=crop&w=600&q=80',
    badge: '-19%',
  },
  {
    productId: 'prod-robot-cleaner',
    categoryId: 'cat-smart-home',
    name: 'Dreame X50 Ultra',
    dailyPrice: 1.15,
    oldDailyPrice: 1.25,
    depositAmount: 79,
    description: '20kPa suction, AI obstacle avoidance, self-emptying dock.',
    image:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
    badge: '-8%',
  },
  {
    productId: 'prod-macbook-pro',
    categoryId: 'cat-computers',
    name: 'MacBook Pro 14" M3 Pro',
    dailyPrice: 3.29,
    oldDailyPrice: 3.69,
    depositAmount: 199,
    description: '12-core CPU, 18GB RAM, 1TB SSD, Liquid Retina XDR.',
    image:
      'https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?auto=format&fit=crop&w=600&q=80',
    badge: 'Hot',
  },
  {
    productId: 'prod-sony-headphones',
    categoryId: 'cat-audio',
    name: 'Sony WH-1000XM5',
    dailyPrice: 0.69,
    oldDailyPrice: 0.79,
    depositAmount: 49,
    color: 'Matte Black',
    description: 'Adaptive ANC, 30h battery, multipoint Bluetooth.',
    image:
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80',
    badge: 'Top pick',
  },
];
