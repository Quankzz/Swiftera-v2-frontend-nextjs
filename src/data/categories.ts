import type { Category, CategoryTree } from '@/types/catalog';

export const categories: Category[] = [
  // 1. Điện thoại & Máy tính bảng
  {
    categoryId: 'cat-phones',
    parentId: null,
    name: 'Điện thoại & Máy tính bảng',
    slug: 'phones-tablets',
    sortOrder: 1,
    image:
      'https://cdn2.fptshop.com.vn/unsafe/iphone_17_pro_max_cosmic_orange_1_a940b68476.png',
    brands: ['Apple', 'Samsung', 'Xiaomi', 'Google'],
  },
  {
    categoryId: 'cat-phones-show-all',
    parentId: 'cat-phones',
    name: 'Xem tất cả',
    slug: 'phones-tablets',
    sortOrder: 1,
  },
  {
    categoryId: 'cat-smartphones',
    parentId: 'cat-phones',
    name: 'Điện thoại thông minh',
    slug: 'smartphones',
    sortOrder: 2,
  },
  {
    categoryId: 'cat-smartphones-show-all',
    parentId: 'cat-smartphones',
    name: 'Xem tất cả điện thoại',
    slug: 'smartphones',
    sortOrder: 1,
  },
  {
    categoryId: 'cat-iphones',
    parentId: 'cat-smartphones',
    name: 'iPhone',
    slug: 'iphones',
    sortOrder: 2,
  },
  {
    categoryId: 'cat-androids',
    parentId: 'cat-smartphones',
    name: 'Điện thoại Android',
    slug: 'android-phones',
    sortOrder: 3,
  },
  {
    categoryId: 'cat-tablets',
    parentId: 'cat-phones',
    name: 'Máy tính bảng',
    slug: 'tablets',
    sortOrder: 3,
  },
  {
    categoryId: 'cat-ereaders',
    parentId: 'cat-phones',
    name: 'Máy đọc sách điện tử',
    slug: 'e-readers',
    sortOrder: 4,
  },
  {
    categoryId: 'cat-phones-accessories',
    parentId: 'cat-phones',
    name: 'Phụ kiện',
    slug: 'accessories',
    sortOrder: 5,
  },

  // 2. Máy tính
  {
    categoryId: 'cat-computers',
    parentId: null,
    name: 'Máy tính',
    slug: 'computers',
    sortOrder: 2,
    image:
      'https://cdn2.fptshop.com.vn/unsafe/iphone_17_pro_max_cosmic_orange_1_a940b68476.png',
    brands: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus'],
  },
  {
    categoryId: 'cat-laptops',
    parentId: 'cat-computers',
    name: 'Máy tính xách tay',
    slug: 'laptops',
    sortOrder: 1,
  },
  {
    categoryId: 'cat-macbooks',
    parentId: 'cat-laptops',
    name: 'MacBook',
    slug: 'macbooks',
    sortOrder: 1,
  },
  {
    categoryId: 'cat-windows-laptops',
    parentId: 'cat-laptops',
    name: 'Laptop Windows',
    slug: 'windows-laptops',
    sortOrder: 2,
  },
  {
    categoryId: 'cat-monitors',
    parentId: 'cat-computers',
    name: 'Màn hình',
    slug: 'monitors',
    sortOrder: 2,
  },

  // 3. Máy chơi game
  {
    categoryId: 'cat-consoles',
    parentId: null,
    name: 'Máy chơi game',
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
    name: 'Kính thực tế ảo VR',
    slug: 'vr-headsets',
    sortOrder: 1,
  },
  {
    categoryId: 'cat-gaming-accessories',
    parentId: 'cat-gaming',
    name: 'Phụ kiện gaming',
    slug: 'gaming-accessories',
    sortOrder: 2,
  },

  // 5. Âm thanh & Âm nhạc
  // {
  //   categoryId: 'cat-audio',
  //   parentId: null,
  //   name: 'Âm thanh & Âm nhạc',
  //   slug: 'audio-music',
  //   sortOrder: 5,
  //   image:
  //     'https://cdn2.fptshop.com.vn/unsafe/iphone_17_pro_max_cosmic_orange_1_a940b68476.png',
  //   brands: ['Sony', 'Bose', 'Sennheiser', 'JBL'],
  // },
  // {
  //   categoryId: 'cat-headphones',
  //   parentId: 'cat-audio',
  //   name: 'Tai nghe',
  //   slug: 'headphones',
  //   sortOrder: 1,
  // },
  // {
  //   categoryId: 'cat-speakers',
  //   parentId: 'cat-audio',
  //   name: 'Loa',
  //   slug: 'speakers',
  //   sortOrder: 2,
  // },
  // {
  //   categoryId: 'cat-microphones',
  //   parentId: 'cat-audio',
  //   name: 'Micro',
  //   slug: 'microphones',
  //   sortOrder: 3,
  // },

  // 6. Thiết bị đeo
  {
    categoryId: 'cat-wearables',
    parentId: null,
    name: 'Thiết bị đeo',
    slug: 'wearables',
    sortOrder: 6,
    image:
      'https://cdn2.fptshop.com.vn/unsafe/iphone_17_pro_max_cosmic_orange_1_a940b68476.png',
    brands: ['Apple', 'Samsung', 'Garmin', 'Fitbit'],
  },
  {
    categoryId: 'cat-smartwatches',
    parentId: 'cat-wearables',
    name: 'Đồng hồ thông minh',
    slug: 'smartwatches',
    sortOrder: 1,
  },
  {
    categoryId: 'cat-fitness-trackers',
    parentId: 'cat-wearables',
    name: 'Vòng đeo theo dõi sức khỏe',
    slug: 'fitness-trackers',
    sortOrder: 2,
  },

  // 7. Nhà thông minh
  // {
  //   categoryId: 'cat-smart-home',
  //   parentId: null,
  //   name: 'Nhà thông minh',
  //   slug: 'smart-home',
  //   sortOrder: 7,
  //   image:
  //     'https://cdn2.fptshop.com.vn/unsafe/iphone_17_pro_max_cosmic_orange_1_a940b68476.png',
  //   brands: ['Google', 'Amazon', 'Philips', 'Ring'],
  // },
  // {
  //   categoryId: 'cat-smart-speakers',
  //   parentId: 'cat-smart-home',
  //   name: 'Loa thông minh',
  //   slug: 'smart-speakers',
  //   sortOrder: 1,
  // },
  // {
  //   categoryId: 'cat-security-cameras',
  //   parentId: 'cat-smart-home',
  //   name: 'Camera an ninh',
  //   slug: 'security-cameras',
  //   sortOrder: 2,
  // },

  // 8. Máy ảnh
  {
    categoryId: 'cat-cameras',
    parentId: null,
    name: 'Máy ảnh',
    slug: 'cameras',
    sortOrder: 8,
    image:
      'https://cdn2.fptshop.com.vn/unsafe/iphone_17_pro_max_cosmic_orange_1_a940b68476.png',
    brands: ['Canon', 'Nikon', 'Sony', 'Fujifilm', 'Panasonic'],
  },
  {
    categoryId: 'cat-dslr',
    parentId: 'cat-cameras',
    name: 'Máy ảnh DSLR',
    slug: 'dslr-cameras',
    sortOrder: 1,
  },
  {
    categoryId: 'cat-mirrorless',
    parentId: 'cat-cameras',
    name: 'Máy ảnh không gương lật',
    slug: 'mirrorless-cameras',
    sortOrder: 2,
  },
  {
    categoryId: 'cat-action-cameras',
    parentId: 'cat-cameras',
    name: 'Camera hành động',
    slug: 'action-cameras',
    sortOrder: 3,
  },

  // 9. Máy tính để bàn
  {
    categoryId: 'cat-desktops',
    parentId: null,
    name: 'Máy tính để bàn',
    slug: 'desktops',
    sortOrder: 9,
    image:
      'https://cdn2.fptshop.com.vn/unsafe/iphone_17_pro_max_cosmic_orange_1_a940b68476.png',
    brands: ['Apple', 'Dell', 'HP'],
  },
  {
    categoryId: 'cat-imacs',
    parentId: 'cat-desktops',
    name: 'iMac & Mac mini',
    slug: 'imacs-mac-minis',
    sortOrder: 1,
  },
  {
    categoryId: 'cat-windows-desktops',
    parentId: 'cat-desktops',
    name: 'Máy tính để bàn Windows',
    slug: 'windows-desktops',
    sortOrder: 2,
  },

  // 10. Phụ kiện
  {
    categoryId: 'cat-accessories',
    parentId: null,
    name: 'Phụ kiện',
    slug: 'accessories',
    sortOrder: 10,
    image:
      'https://cdn2.fptshop.com.vn/unsafe/iphone_17_pro_max_cosmic_orange_1_a940b68476.png',
    brands: ['Logitech', 'Razer', 'Corsair'],
  },
  {
    categoryId: 'cat-keyboards',
    parentId: 'cat-accessories',
    name: 'Bàn phím',
    slug: 'keyboards',
    sortOrder: 1,
  },
  {
    categoryId: 'cat-mice',
    parentId: 'cat-accessories',
    name: 'Chuột',
    slug: 'mice',
    sortOrder: 2,
  },
  {
    categoryId: 'cat-cables',
    parentId: 'cat-accessories',
    name: 'Cáp & Bộ chuyển đổi',
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
