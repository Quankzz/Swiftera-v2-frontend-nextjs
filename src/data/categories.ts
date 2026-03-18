import type { Category, CategoryTree } from '@/types/catalog';

export const categories: Category[] = [
  // 1. Phones & Tablets
  {
    categoryId: 'cat-phones',
    parentId: null,
    name: 'Phones & Tablets',
    slug: 'phones-tablets',
    sortOrder: 1,
    image:
      'https://cdn2.fptshop.com.vn/unsafe/iphone_17_pro_max_cosmic_orange_1_a940b68476.png',
    brands: ['Apple', 'Samsung', 'Xiaomi', 'Google'],
  },
  {
    categoryId: 'cat-phones-show-all',
    parentId: 'cat-phones',
    name: 'Show all',
    slug: 'phones-tablets',
    sortOrder: 1,
  },
  {
    categoryId: 'cat-smartphones',
    parentId: 'cat-phones',
    name: 'Smartphones',
    slug: 'smartphones',
    sortOrder: 2,
  },
  {
    categoryId: 'cat-smartphones-show-all',
    parentId: 'cat-smartphones',
    name: 'Show all Smartphones',
    slug: 'smartphones',
    sortOrder: 1,
  },
  {
    categoryId: 'cat-iphones',
    parentId: 'cat-smartphones',
    name: 'iPhones',
    slug: 'iphones',
    sortOrder: 2,
  },
  {
    categoryId: 'cat-androids',
    parentId: 'cat-smartphones',
    name: 'Android Phones',
    slug: 'android-phones',
    sortOrder: 3,
  },
  {
    categoryId: 'cat-tablets',
    parentId: 'cat-phones',
    name: 'Tablets',
    slug: 'tablets',
    sortOrder: 3,
  },
  {
    categoryId: 'cat-ereaders',
    parentId: 'cat-phones',
    name: 'E-Readers & E-Paper Tablets',
    slug: 'e-readers',
    sortOrder: 4,
  },
  {
    categoryId: 'cat-phones-accessories',
    parentId: 'cat-phones',
    name: 'Accessories',
    slug: 'accessories',
    sortOrder: 5,
  },

  // 2. Computers
  {
    categoryId: 'cat-computers',
    parentId: null,
    name: 'Computers',
    slug: 'computers',
    sortOrder: 2,
    image:
      'https://cdn2.fptshop.com.vn/unsafe/iphone_17_pro_max_cosmic_orange_1_a940b68476.png',
    brands: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus'],
  },
  {
    categoryId: 'cat-laptops',
    parentId: 'cat-computers',
    name: 'Laptops',
    slug: 'laptops',
    sortOrder: 1,
  },
  {
    categoryId: 'cat-macbooks',
    parentId: 'cat-laptops',
    name: 'MacBooks',
    slug: 'macbooks',
    sortOrder: 1,
  },
  {
    categoryId: 'cat-windows-laptops',
    parentId: 'cat-laptops',
    name: 'Windows Laptops',
    slug: 'windows-laptops',
    sortOrder: 2,
  },
  {
    categoryId: 'cat-monitors',
    parentId: 'cat-computers',
    name: 'Monitors',
    slug: 'monitors',
    sortOrder: 2,
  },

  // 3. Consoles
  {
    categoryId: 'cat-consoles',
    parentId: null,
    name: 'Consoles',
    slug: 'consoles',
    sortOrder: 3,
    image:
      'https://cdn2.fptshop.com.vn/unsafe/iphone_17_pro_max_cosmic_orange_1_a940b68476.png',
    brands: ['Sony', 'Microsoft', 'Nintendo'],
  },
  {
    categoryId: 'cat-playstation',
    parentId: 'cat-consoles',
    name: 'PlayStation',
    slug: 'playstation',
    sortOrder: 1,
  },
  {
    categoryId: 'cat-xbox',
    parentId: 'cat-consoles',
    name: 'Xbox',
    slug: 'xbox',
    sortOrder: 2,
  },
  {
    categoryId: 'cat-nintendo',
    parentId: 'cat-consoles',
    name: 'Nintendo',
    slug: 'nintendo',
    sortOrder: 3,
  },

  // 4. Gaming & VR
  {
    categoryId: 'cat-gaming',
    parentId: null,
    name: 'Gaming & VR',
    slug: 'gaming-vr',
    sortOrder: 4,
    image:
      'https://cdn2.fptshop.com.vn/unsafe/iphone_17_pro_max_cosmic_orange_1_a940b68476.png',
    brands: ['Meta', 'HTC', 'Valve', 'Logitech'],
  },
  {
    categoryId: 'cat-vr-headsets',
    parentId: 'cat-gaming',
    name: 'VR Headsets',
    slug: 'vr-headsets',
    sortOrder: 1,
  },
  {
    categoryId: 'cat-gaming-accessories',
    parentId: 'cat-gaming',
    name: 'Gaming Accessories',
    slug: 'gaming-accessories',
    sortOrder: 2,
  },

  // 5. Audio & Music
  {
    categoryId: 'cat-audio',
    parentId: null,
    name: 'Audio & Music',
    slug: 'audio-music',
    sortOrder: 5,
    image:
      'https://cdn2.fptshop.com.vn/unsafe/iphone_17_pro_max_cosmic_orange_1_a940b68476.png',
    brands: ['Sony', 'Bose', 'Sennheiser', 'JBL'],
  },
  {
    categoryId: 'cat-headphones',
    parentId: 'cat-audio',
    name: 'Headphones',
    slug: 'headphones',
    sortOrder: 1,
  },
  {
    categoryId: 'cat-speakers',
    parentId: 'cat-audio',
    name: 'Speakers',
    slug: 'speakers',
    sortOrder: 2,
  },
  {
    categoryId: 'cat-microphones',
    parentId: 'cat-audio',
    name: 'Microphones',
    slug: 'microphones',
    sortOrder: 3,
  },

  // 6. Wearables
  {
    categoryId: 'cat-wearables',
    parentId: null,
    name: 'Wearables',
    slug: 'wearables',
    sortOrder: 6,
    image:
      'https://cdn2.fptshop.com.vn/unsafe/iphone_17_pro_max_cosmic_orange_1_a940b68476.png',
    brands: ['Apple', 'Samsung', 'Garmin', 'Fitbit'],
  },
  {
    categoryId: 'cat-smartwatches',
    parentId: 'cat-wearables',
    name: 'Smartwatches',
    slug: 'smartwatches',
    sortOrder: 1,
  },
  {
    categoryId: 'cat-fitness-trackers',
    parentId: 'cat-wearables',
    name: 'Fitness Trackers',
    slug: 'fitness-trackers',
    sortOrder: 2,
  },

  // 7. Smart Home
  {
    categoryId: 'cat-smart-home',
    parentId: null,
    name: 'Smart Home',
    slug: 'smart-home',
    sortOrder: 7,
    image:
      'https://cdn2.fptshop.com.vn/unsafe/iphone_17_pro_max_cosmic_orange_1_a940b68476.png',
    brands: ['Google', 'Amazon', 'Philips', 'Ring'],
  },
  {
    categoryId: 'cat-smart-speakers',
    parentId: 'cat-smart-home',
    name: 'Smart Speakers',
    slug: 'smart-speakers',
    sortOrder: 1,
  },
  {
    categoryId: 'cat-security-cameras',
    parentId: 'cat-smart-home',
    name: 'Security Cameras',
    slug: 'security-cameras',
    sortOrder: 2,
  },

  // 8. Cameras
  {
    categoryId: 'cat-cameras',
    parentId: null,
    name: 'Cameras',
    slug: 'cameras',
    sortOrder: 8,
    image:
      'https://cdn2.fptshop.com.vn/unsafe/iphone_17_pro_max_cosmic_orange_1_a940b68476.png',
    brands: ['Canon', 'Nikon', 'Sony', 'Fujifilm', 'Panasonic'],
  },
  {
    categoryId: 'cat-dslr',
    parentId: 'cat-cameras',
    name: 'DSLR Cameras',
    slug: 'dslr-cameras',
    sortOrder: 1,
  },
  {
    categoryId: 'cat-mirrorless',
    parentId: 'cat-cameras',
    name: 'Mirrorless Cameras',
    slug: 'mirrorless-cameras',
    sortOrder: 2,
  },
  {
    categoryId: 'cat-action-cameras',
    parentId: 'cat-cameras',
    name: 'Action Cameras',
    slug: 'action-cameras',
    sortOrder: 3,
  },

  // 9. Desktops
  {
    categoryId: 'cat-desktops',
    parentId: null,
    name: 'Desktops',
    slug: 'desktops',
    sortOrder: 9,
    image:
      'https://cdn2.fptshop.com.vn/unsafe/iphone_17_pro_max_cosmic_orange_1_a940b68476.png',
    brands: ['Apple', 'Dell', 'HP'],
  },
  {
    categoryId: 'cat-imacs',
    parentId: 'cat-desktops',
    name: 'iMacs & Mac minis',
    slug: 'imacs-mac-minis',
    sortOrder: 1,
  },
  {
    categoryId: 'cat-windows-desktops',
    parentId: 'cat-desktops',
    name: 'Windows Desktops',
    slug: 'windows-desktops',
    sortOrder: 2,
  },

  // 10. Accessories
  {
    categoryId: 'cat-accessories',
    parentId: null,
    name: 'Accessories',
    slug: 'accessories',
    sortOrder: 10,
    image:
      'https://cdn2.fptshop.com.vn/unsafe/iphone_17_pro_max_cosmic_orange_1_a940b68476.png',
    brands: ['Logitech', 'Razer', 'Corsair'],
  },
  {
    categoryId: 'cat-keyboards',
    parentId: 'cat-accessories',
    name: 'Keyboards',
    slug: 'keyboards',
    sortOrder: 1,
  },
  {
    categoryId: 'cat-mice',
    parentId: 'cat-accessories',
    name: 'Mice',
    slug: 'mice',
    sortOrder: 2,
  },
  {
    categoryId: 'cat-cables',
    parentId: 'cat-accessories',
    name: 'Cables & Adapters',
    slug: 'cables-adapters',
    sortOrder: 3,
  },
];

export const buildCategoryTree = (categories: Category[]): CategoryTree[] => {
  const categoryMap = new Map<string, CategoryTree>();
  const tree: CategoryTree[] = [];

  categories.forEach((cat) => {
    categoryMap.set(cat.categoryId, { ...cat, children: [] });
  });

  categories.forEach((cat) => {
    if (cat.parentId) {
      const parent = categoryMap.get(cat.parentId);
      if (parent) {
        parent.children.push(categoryMap.get(cat.categoryId)!);
      }
    } else {
      tree.push(categoryMap.get(cat.categoryId)!);
    }
  });

  // Sort children
  const sortTree = (nodes: CategoryTree[]) => {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder);
    nodes.forEach((node) => {
      if (node.children.length > 0) {
        sortTree(node.children);
      }
    });
  };

  sortTree(tree);

  return tree;
};

export const topLevelCategories = buildCategoryTree(categories);
