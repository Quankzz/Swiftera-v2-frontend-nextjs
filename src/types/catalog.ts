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

export interface ProductImage {
  productImageId?: string;
  productId: string;
  imageUrl: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductColor {
  colorId?: string;
  name: string;
  value: string; // ví dụ: #111111
}

export interface Product {
  productId: string;
  categoryId: string;
  name: string;
  dailyPrice: number;
  oldDailyPrice?: number;
  depositAmount?: number;
  description: string;
  productImages: ProductImage[];
  colors?: ProductColor[];
  minRentalDays: number;
}
