export interface Category {
  categoryId: string;
  parentId: string | null;
  name: string;
  slug: string;
  sortOrder: number;
  image?: string;
  brands?: string[]; // For brands under this category
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
}

export interface Product {
  productId: string;
  categoryId: string;
  name: string;
  dailyPrice: number;
  oldDailyPrice?: number;
  depositAmount?: number;
  color?: string;
  description: string;
  image: string;
  badge?: string;
}
