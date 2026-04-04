'use client';

import { useState, useCallback } from 'react';
import type { ProductResponse } from '@/features/products/types';

/** Dạng draft của một ảnh trong form (chưa có productImageId từ BE) */
export interface DraftImage {
  /** id tạm thời dùng trong UI */
  draftId: string;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
}

/**
 * ProductFormData — ánh xạ 1-1 với CreateProductInput / UpdateProductInput.
 * Giá trị số lưu dạng string vì input HTML luôn trả về string.
 */
export interface ProductFormData {
  /** Trống khi tạo mới */
  productId: string;
  categoryId: string;
  name: string;
  description: string;
  brand: string;
  /** Màu sắc — single string (không phải mảng), e.g. "Đen", "Bạc" */
  color: string;
  dailyPrice: string;
  oldDailyPrice: string;
  depositAmount: string;
  minRentalDays: string;
  /** Chỉ có trong edit mode */
  isActive: boolean;
}

const EMPTY_FORM: ProductFormData = {
  productId: '',
  categoryId: '',
  name: '',
  description: '',
  brand: '',
  color: '',
  dailyPrice: '',
  oldDailyPrice: '',
  depositAmount: '',
  minRentalDays: '1',
  isActive: true,
};

/** Chuyển ProductResponse (từ BE) về ProductFormData để fill vào form edit */
function productToForm(p: ProductResponse): ProductFormData {
  return {
    productId: p.productId,
    categoryId: p.categoryId,
    name: p.name,
    description: p.description ?? '',
    brand: p.brand ?? '',
    color: p.color ?? '',
    dailyPrice: String(p.dailyPrice),
    oldDailyPrice: p.oldDailyPrice != null ? String(p.oldDailyPrice) : '',
    depositAmount: p.depositAmount != null ? String(p.depositAmount) : '',
    minRentalDays: String(p.minRentalDays),
    isActive: p.isActive,
  };
}

/** Chuyển images array từ ProductResponse về DraftImage[] */
function imagesToDrafts(images: ProductResponse['images']): DraftImage[] {
  return images.map((img, i) => ({
    draftId: img.productImageId ?? `draft-${Date.now()}-${i}`,
    imageUrl: img.imageUrl,
    isPrimary: img.isPrimary,
    sortOrder: img.sortOrder,
  }));
}

/**
 * Chuyển DraftImage[] + form về dạng gần với ProductResponse
 * để truyền cho live preview card.
 */
export function draftToProductPreview(
  form: ProductFormData,
  images: DraftImage[],
  categoryName?: string,
): ProductResponse {
  return {
    productId: form.productId || 'preview',
    categoryId: form.categoryId,
    categoryName: categoryName ?? '',
    brand: form.brand || null,
    color: form.color || null,
    name: form.name,
    description: form.description || null,
    dailyPrice: parseFloat(form.dailyPrice) || 0,
    oldDailyPrice: form.oldDailyPrice ? parseFloat(form.oldDailyPrice) : null,
    depositAmount: form.depositAmount ? parseFloat(form.depositAmount) : null,
    minRentalDays: parseInt(form.minRentalDays) || 1,
    isActive: form.isActive,
    images: images.map((img) => ({
      productImageId: img.draftId,
      imageUrl: img.imageUrl,
      sortOrder: img.sortOrder,
      isPrimary: img.isPrimary,
    })),
    availableStock: 0,
    averageRating: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function useProductForm(initial?: ProductResponse) {
  const [form, setForm] = useState<ProductFormData>(
    initial ? productToForm(initial) : EMPTY_FORM,
  );
  const [images, setImages] = useState<DraftImage[]>(
    initial ? imagesToDrafts(initial.images) : [],
  );

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

  /* ─── Validation ─── */
  const errors: Partial<Record<keyof ProductFormData, string>> = {};
  if (!form.categoryId) errors.categoryId = 'Vui lòng chọn danh mục';
  if (!form.name.trim()) errors.name = 'Vui lòng nhập tên sản phẩm';
  if (
    !form.dailyPrice ||
    isNaN(parseFloat(form.dailyPrice)) ||
    parseFloat(form.dailyPrice) <= 0
  ) {
    errors.dailyPrice = 'Giá thuê phải lớn hơn 0';
  }
  if (
    form.oldDailyPrice &&
    parseFloat(form.oldDailyPrice) < parseFloat(form.dailyPrice)
  ) {
    errors.oldDailyPrice = 'Giá gốc phải >= giá thuê hiện tại';
  }
  if (
    form.depositAmount !== '' &&
    !isNaN(parseFloat(form.depositAmount)) &&
    parseFloat(form.depositAmount) < 0
  ) {
    errors.depositAmount = 'Tiền đặt cọc phải >= 0';
  }
  if (!form.minRentalDays || parseInt(form.minRentalDays) < 1) {
    errors.minRentalDays = 'Tối thiểu 1 ngày';
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
    errors,
    isValid,
  };
}
