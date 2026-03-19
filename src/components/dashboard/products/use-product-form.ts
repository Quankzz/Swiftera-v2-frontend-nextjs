'use client';

import { useState, useCallback } from 'react';
import type { Product, ProductImage, ProductColor } from '@/types/catalog';

/** Dạng draft của một ảnh trong form (chưa có productImageId) */
export interface DraftImage {
  /** id tạm thời dùng trong UI */
  draftId: string;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductFormData {
  productId: string;
  categoryId: string;
  name: string;
  description: string;
  dailyPrice: string; // string vì input text
  oldDailyPrice: string;
  depositAmount: string;
  minRentalDays: string;
}

const EMPTY_FORM: ProductFormData = {
  productId: '',
  categoryId: '',
  name: '',
  description: '',
  dailyPrice: '',
  oldDailyPrice: '',
  depositAmount: '',
  minRentalDays: '1',
};

function productToForm(p: Product): ProductFormData {
  return {
    productId: p.productId,
    categoryId: p.categoryId,
    name: p.name,
    description: p.description,
    dailyPrice: String(p.dailyPrice),
    oldDailyPrice: p.oldDailyPrice ? String(p.oldDailyPrice) : '',
    depositAmount: p.depositAmount ? String(p.depositAmount) : '',
    minRentalDays: String(p.minRentalDays),
  };
}

function imagesToDrafts(images: ProductImage[]): DraftImage[] {
  return images.map((img, i) => ({
    draftId: img.productImageId ?? `draft-${Date.now()}-${i}`,
    imageUrl: img.imageUrl,
    isPrimary: img.isPrimary,
    sortOrder: img.sortOrder,
  }));
}

/** Chuyển DraftImage[] + colors[] về Product shape để hiển thị live preview */
export function draftToProduct(
  form: ProductFormData,
  images: DraftImage[],
  colors: ProductColor[],
): Product {
  return {
    productId: form.productId || 'preview',
    categoryId: form.categoryId,
    name: form.name,
    description: form.description,
    dailyPrice: parseFloat(form.dailyPrice) || 0,
    oldDailyPrice: form.oldDailyPrice
      ? parseFloat(form.oldDailyPrice)
      : undefined,
    depositAmount: form.depositAmount
      ? parseFloat(form.depositAmount)
      : undefined,
    minRentalDays: parseInt(form.minRentalDays) || 1,
    productImages: images.map((img) => ({
      productId: form.productId || 'preview',
      imageUrl: img.imageUrl,
      sortOrder: img.sortOrder,
      isPrimary: img.isPrimary,
      productImageId: img.draftId,
    })),
    colors: colors.length > 0 ? colors : undefined,
  };
}

export function useProductForm(initial?: Product) {
  const [form, setForm] = useState<ProductFormData>(
    initial ? productToForm(initial) : EMPTY_FORM,
  );
  const [images, setImages] = useState<DraftImage[]>(
    initial ? imagesToDrafts(initial.productImages) : [],
  );
  const [colors, setColors] = useState<ProductColor[]>(initial?.colors ?? []);

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
      // nếu ảnh bị xóa là primary, gán primary cho ảnh đầu tiên còn lại
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

  /* ─── Color handlers ─── */
  const addColor = useCallback((color: ProductColor) => {
    setColors((prev) => {
      // không thêm trùng value
      if (prev.some((c) => c.value === color.value)) return prev;
      return [...prev, color];
    });
  }, []);

  const removeColor = useCallback((value: string) => {
    setColors((prev) => prev.filter((c) => c.value !== value));
  }, []);

  const updateColor = useCallback((index: number, updated: ProductColor) => {
    setColors((prev) => prev.map((c, i) => (i === index ? updated : c)));
  }, []);

  /* ─── Derived live preview product ─── */
  const previewProduct = draftToProduct(form, images, colors);

  /* ─── Validation ─── */
  const errors: Partial<Record<keyof ProductFormData, string>> = {};
  if (!form.categoryId) errors.categoryId = 'Vui lòng chọn danh mục';
  if (!form.name.trim()) errors.name = 'Vui lòng nhập tên sản phẩm';
  if (
    !form.dailyPrice ||
    isNaN(parseFloat(form.dailyPrice)) ||
    parseFloat(form.dailyPrice) <= 0
  )
    errors.dailyPrice = 'Giá thuê phải lớn hơn 0';
  if (!form.description.trim()) errors.description = 'Vui lòng nhập mô tả';
  if (!form.minRentalDays || parseInt(form.minRentalDays) < 1)
    errors.minRentalDays = 'Tối thiểu 1 ngày';

  const isValid = Object.keys(errors).length === 0;

  return {
    form,
    setField,
    images,
    addImage,
    removeImage,
    setPrimary,
    updateImageUrl,
    colors,
    addColor,
    removeColor,
    updateColor,
    previewProduct,
    errors,
    isValid,
  };
}
