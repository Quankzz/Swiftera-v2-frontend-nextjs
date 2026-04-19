export interface Category {
  categoryId: string;
  parentId: string | null;
  name: string;
  slug: string;
  sortOrder: number;
  imageUrl?: string;
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

// ─── Inventory Item (bảng inventory_items) ────────────────────────
// Source: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md - Module 9: INVENTORY ITEMS
export type InventoryItemStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'RENTED'
  | 'MAINTENANCE'
  | 'DAMAGED'
  | 'RETIRED';

export interface InventoryItem {
  inventoryItemId: string;
  productId: string;
  serialNumber: string;
  status: InventoryItemStatus;
  conditionGrade: string; // VD: "A", "B", "C" hoặc "Mới", "Tốt", "Trung bình"
  staffNote: string;
}

export interface Product {
  productId: string;
  categoryId: string;
  name: string;
  dailyPrice: number;
  oldDailyPrice?: number;
  depositAmount?: number;
  description: string;
  shortDescription?: string;
  productImages: ProductImage[];
  colors?: ProductColor[];
  minRentalDays: number;
  /** Danh sách thiết bị vật lý thuộc sản phẩm này */
  inventoryItems?: InventoryItem[];
}
