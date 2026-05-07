"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { ProductResponse } from "@/features/products/types";
import type { Product } from "@/types/catalog";
import type {
  InventoryItemConditionGrade,
  InventoryItemStatus,
  InventoryItemInProduct,
  ProductColorInput,
} from "@/features/products/types";
/** Dạng draft của một ảnh trong form (chưa có productImageId từ BE) */
export interface DraftImage {
  /** id tạm thời dùng trong UI */
  draftId: string;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
}

/**
 * DraftInventoryItem - đại diện cho một thiết bị vật lý đang được soạn trong UI.
 * Dùng trong edit mode (productId đã tồn tại).
 * Khi submit sẽ gọi createInventoryItem / updateInventoryItem.
 */
export interface DraftInventoryItem {
  /** id tạm thời cho react key, nếu đã có từ BE thì là inventoryItemId */
  draftId: string;
  /** inventoryItemId thực từ BE (nếu đã create rồi) */
  inventoryItemId?: string;
  serialNumber: string;
  hubId: string;
  /** Tên hub để hiển thị trong UI - không gửi lên BE */
  hubName: string;
  hubCode?: string;
  conditionGrade: InventoryItemConditionGrade;
  staffNote: string;
  /** status chỉ dùng trong edit/display, không gửi khi create */
  status: InventoryItemStatus;
  /** UUID màu đã chọn - maps to productColorId từ product.colors[] */
  productColorId: string;
  /**
   * Snapshot của các trường updatable khi item được load từ BE.
   * Dùng để so sánh dirty-check trước khi gọi update API.
   * Không bao giờ bị thay đổi sau khi khởi tạo.
   */
  _original?: {
    hubId: string;
    conditionGrade: InventoryItemConditionGrade;
    staffNote: string;
    status: InventoryItemStatus;
    productColorId: string;
  };
}

/** Map một InventoryItemInProduct (từ product detail response) về DraftInventoryItem */
function inventoryItemToDraft(
  item: InventoryItemInProduct,
): DraftInventoryItem {
  const colorId = item.productColorId ?? "";
  return {
    draftId: item.inventoryItemId,
    inventoryItemId: item.inventoryItemId,
    serialNumber: item.serialNumber,
    hubId: item.hub?.hubId ?? "",
    hubName: item.hub?.name ?? "",
    hubCode: item.hub?.code ?? "",
    conditionGrade: item.conditionGrade ?? "NEW",
    staffNote: item.staffNote ?? "",
    status: item.status,
    productColorId: colorId,
    _original: {
      hubId: item.hub?.hubId ?? "",
      conditionGrade: item.conditionGrade ?? "NEW",
      staffNote: item.staffNote ?? "",
      status: item.status,
      productColorId: colorId,
    },
  };
}

/**
 * ProductFormData - ánh xạ 1-1 với CreateProductInput / UpdateProductInput.
 * Giá trị số lưu dạng string vì input HTML luôn trả về string.
 */
export interface ProductFormData {
  /** Trống khi tạo mới */
  productId: string;
  categoryId: string;
  name: string;
  description: string;
  shortDescription: string;
  brand: string;
  /** Danh sách màu - mảng { name, code } */
  colors: ProductColorInput[];
  dailyPrice: string;
  oldDailyPrice: string;
  depositAmount: string;
  minRentalDays: string;
  /** Voucher ID đã chọn cho sản phẩm (PRODUCT_DISCOUNT) */
  voucherId: string;
  /** Chỉ có trong edit mode */
  isActive: boolean;
  /** Video URL cho sản phẩm */
  videoUrl: string;
}

const EMPTY_FORM: ProductFormData = {
  productId: "",
  categoryId: "",
  name: "",
  description: "",
  shortDescription: "",
  brand: "",
  colors: [],
  dailyPrice: "",
  oldDailyPrice: "",
  depositAmount: "",
  minRentalDays: "1",
  voucherId: "",
  isActive: true,
  videoUrl: "",
};

/** Chuyển ProductResponse (từ BE) về ProductFormData để fill vào form edit */
function productToForm(p: ProductResponse): ProductFormData {
  const videoUrl = p.images?.length
    ? (p.images.find((img) => img.videoUrl)?.videoUrl ?? "")
    : "";
  return {
    productId: p.productId,
    categoryId: p.categoryId,
    name: p.name,
    description: p.description ?? "",
    shortDescription: p.shortDescription ?? "",
    brand: p.brand ?? "",
    colors: (p.colors ?? []).map((c) => ({
      productColorId: c.productColorId,
      name: c.name,
      code: c.code,
    })),
    dailyPrice: String(p.dailyPrice),
    oldDailyPrice: p.oldDailyPrice != null ? String(p.oldDailyPrice) : "",
    depositAmount: p.depositAmount != null ? String(p.depositAmount) : "",
    minRentalDays: String(p.minRentalDays),
    voucherId: p.voucherId ?? "",
    isActive: p.isActive,
    videoUrl,
  };
}

/** Chuyển images array từ ProductResponse về DraftImage[] */
function imagesToDrafts(images: ProductResponse["images"]): DraftImage[] {
  return images.map((img, i) => ({
    draftId: img.productImageId ?? `draft-${Date.now()}-${i}`,
    imageUrl: img.imageUrl,
    isPrimary: img.isPrimary,
    sortOrder: img.sortOrder,
  }));
}

/**
 * Chuyển DraftImage[] + form về dạng Product (catalog type)
 * để truyền cho live preview card (ProductCard variant='preview').
 */
export function draftToProductPreview(
  form: ProductFormData,
  images: DraftImage[],
): Product {
  return {
    productId: form.productId || "preview",
    categoryId: form.categoryId,
    name: form.name,
    description: form.description || "",
    shortDescription: form.shortDescription,
    dailyPrice: parseFloat(form.dailyPrice) || 0,
    oldDailyPrice: form.oldDailyPrice
      ? parseFloat(form.oldDailyPrice)
      : undefined,
    depositAmount: form.depositAmount
      ? parseFloat(form.depositAmount)
      : undefined,
    minRentalDays: parseInt(form.minRentalDays) || 1,
    productImages: images.map((img) => ({
      productImageId: img.draftId,
      productId: form.productId || "preview",
      imageUrl: img.imageUrl,
      sortOrder: img.sortOrder,
      isPrimary: img.isPrimary,
    })),
    colors: form.colors.map((c, i) => ({
      colorId: c.productColorId ?? `preview-color-${i}`,
      name: c.name,
      value: c.code,
    })),
  };
}

export function useProductForm(initial?: ProductResponse) {
  const [form, setForm] = useState<ProductFormData>(
    initial ? productToForm(initial) : EMPTY_FORM,
  );
  const [images, setImages] = useState<DraftImage[]>(
    initial ? imagesToDrafts(initial.images) : [],
  );
  const [draftInventoryItems, setDraftInventoryItems] = useState<
    DraftInventoryItem[]
  >(
    // Pre-populate from product detail response if inventoryItems are embedded
    initial?.inventoryItems
      ? initial.inventoryItems.map(inventoryItemToDraft)
      : [],
  );

  // Track initial snapshot for dirty-checking. Update when `initial` changes.
  const initialSnapshotRef = useRef<string>(
    JSON.stringify({
      form: initial ? productToForm(initial) : EMPTY_FORM,
      images: initial ? imagesToDrafts(initial.images) : [],
      draftInventoryItems: initial?.inventoryItems
        ? initial.inventoryItems.map(inventoryItemToDraft)
        : [],
    }),
  );

  useEffect(() => {
    initialSnapshotRef.current = JSON.stringify({
      form: initial ? productToForm(initial) : EMPTY_FORM,
      images: initial ? imagesToDrafts(initial.images) : [],
      draftInventoryItems: initial?.inventoryItems
        ? initial.inventoryItems.map(inventoryItemToDraft)
        : [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  const currentSnapshot = JSON.stringify({ form, images, draftInventoryItems });
  const isDirty = currentSnapshot !== initialSnapshotRef.current;

  /* ─── Form field handler ─── */
  const setField = useCallback(
    <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  /* ─── Image handlers ─── */
  const addImage = useCallback((url: string) => {
    setImages((prev) => {
      const isFirst = prev.length === 0;
      return [
        ...prev,
        {
          draftId: `draft-${Date.now()}`,
          imageUrl: url,
          isPrimary: isFirst,
          sortOrder: prev.length + 1,
        },
      ];
    });
  }, []);

  const removeImage = useCallback((draftId: string) => {
    setImages((prev) => {
      const next = prev.filter((img) => img.draftId !== draftId);
      const hasPrimary = next.some((img) => img.isPrimary);
      if (!hasPrimary && next.length > 0) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return next.map((img, i) => ({ ...img, sortOrder: i + 1 }));
    });
  }, []);

  const setPrimary = useCallback((draftId: string) => {
    setImages((prev) =>
      prev.map((img) => ({ ...img, isPrimary: img.draftId === draftId })),
    );
  }, []);

  const updateImageUrl = useCallback((draftId: string, url: string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.draftId === draftId ? { ...img, imageUrl: url } : img,
      ),
    );
  }, []);

  /** Reorder images after a drag-and-drop event (pass new ordered array) */
  const reorderImages = useCallback((newOrder: DraftImage[]) => {
    setImages(newOrder.map((img, i) => ({ ...img, sortOrder: i + 1 })));
  }, []);

  /* ─── Inventory Item handlers (edit mode only) ─── */
  const addDraftInventoryItem = useCallback(() => {
    setDraftInventoryItems((prev) => [
      ...prev,
      {
        draftId: `inv-draft-${Date.now()}`,
        serialNumber: "",
        hubId: "",
        hubName: "",
        conditionGrade: "NEW" as InventoryItemConditionGrade,
        staffNote: "",
        status: "AVAILABLE" as InventoryItemStatus,
        productColorId: "",
      },
    ]);
  }, []);

  const updateDraftInventoryItem = useCallback(
    (draftId: string, patch: Partial<Omit<DraftInventoryItem, "draftId">>) => {
      setDraftInventoryItems((prev) =>
        prev.map((item) =>
          item.draftId === draftId ? { ...item, ...patch } : item,
        ),
      );
    },
    [],
  );

  const removeDraftInventoryItem = useCallback((draftId: string) => {
    setDraftInventoryItems((prev) =>
      prev.filter((item) => item.draftId !== draftId),
    );
  }, []);

  /* ─── Validation ─── */
  const errors: Partial<Record<keyof ProductFormData, string>> = {};
  if (!form.categoryId) errors.categoryId = "Vui lòng chọn danh mục";
  if (!form.name.trim()) errors.name = "Vui lòng nhập tên sản phẩm";
  if (
    !form.dailyPrice ||
    isNaN(parseFloat(form.dailyPrice)) ||
    parseFloat(form.dailyPrice) <= 0
  ) {
    errors.dailyPrice = "Giá thuê phải lớn hơn 0";
  }
  if (
    form.oldDailyPrice &&
    parseFloat(form.oldDailyPrice) < parseFloat(form.dailyPrice)
  ) {
    errors.oldDailyPrice = "Giá gốc phải >= giá thuê hiện tại";
  }
  if (
    form.depositAmount !== "" &&
    !isNaN(parseFloat(form.depositAmount)) &&
    parseFloat(form.depositAmount) < 0
  ) {
    errors.depositAmount = "Tiền đặt cọc phải >= 0";
  }
  if (!form.minRentalDays || parseInt(form.minRentalDays) < 1) {
    errors.minRentalDays = "Tối thiểu 1 ngày";
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    form,
    setField,
    images,
    addImage,
    removeImage,
    setPrimary,
    updateImageUrl,
    reorderImages,
    draftInventoryItems,
    addDraftInventoryItem,
    updateDraftInventoryItem,
    removeDraftInventoryItem,
    errors,
    isValid,
    isDirty,
  };
}
