'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Star,
  Upload,
  Link as LinkIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useProductForm,
  draftToProductPreview,
  type DraftImage,
} from './use-product-form';
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from '@/features/products/hooks/use-product-management';
import { useCategoryTreeQuery } from '@/features/categories/hooks/use-category-tree';
import { CategoryTreeSelect } from '../categories/category-tree-select';
import type { ProductResponse } from '@/features/products/types';
import { ProductCard } from '@/components/home/product-card';
import { ColorPickerList } from './color-picker-list';
import RichEditor from '@/components/feedback/rich-editor';
import {
  VoucherPriceCalculator,
  type PriceValues,
} from './voucher-price-calculator';
import { InventorySection } from './inventory-section';
import {
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
} from '@/features/products/hooks/use-inventory-items';
import { useUploadFileMutation } from '@/features/files/hooks/use-files';
import { toast } from 'sonner';

// ─── Helper format VND ────────────────────────────────────────────
function formatVND(val: string) {
  const num = parseInt(val.replace(/\D/g, ''), 10);
  if (isNaN(num)) return '';
  return num.toLocaleString('vi-VN');
}

function parseVND(val: string) {
  return val.replace(/\D/g, '');
}

// ─── Shared UI primitives ─────────────────────────────────────────
function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className='rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card'>
      <div className='border-b border-gray-100 dark:border-white/8 px-5 py-3.5'>
        <h3 className='text-sm font-semibold text-text-main'>{title}</h3>
      </div>
      <div className='px-5 py-5'>{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  error,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className='flex flex-col gap-1.5'>
      <label className='text-sm font-medium text-text-main'>
        {label}
        {required && <span className='ml-0.5 text-red-500'>*</span>}
      </label>
      {children}
      {hint && !error && <p className='text-xs text-text-sub'>{hint}</p>}
      {error && <p className='text-xs text-red-500'>{error}</p>}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'h-11 w-full rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-3 text-sm text-text-main placeholder:text-text-sub focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20',
        className,
      )}
    />
  );
}

// ─── Image item inside Section 3 ──────────────────────────────────
function ImageItem({
  img,
  onSetPrimary,
  onRemove,
  onUpdateUrl,
}: {
  img: DraftImage;
  onSetPrimary: () => void;
  onRemove: () => void;
  onUpdateUrl: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [urlMode, setUrlMode] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const uploadMutation = useUploadFileMutation();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // reset input để có thể upload lại cùng file
    e.target.value = '';
    setIsUploading(true);
    try {
      const result = await uploadMutation.mutateAsync({
        file,
        folder: 'products',
      });
      onUpdateUrl(result.fileUrl);
      setUrlMode(false);
    } catch {
      toast.error('Tải ảnh lên thất bại. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className='flex gap-3 rounded-md border border-gray-200 dark:border-white/8 bg-gray-50 dark:bg-white/4 p-3'>
        {/* Preview thumbnail */}
        <div className='relative size-20 shrink-0 overflow-hidden rounded-md bg-white dark:bg-surface-card border border-gray-200 dark:border-white/8'>
          {isUploading ? (
            <div className='flex h-full w-full flex-col items-center justify-center gap-1 text-xs text-text-sub'>
              <span className='animate-spin text-base'>⏳</span>
              <span>Đang tải...</span>
            </div>
          ) : img.imageUrl ? (
            <Image
              src={img.imageUrl}
              alt='preview'
              fill
              sizes='80px'
              className='object-contain'
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center text-xs text-text-sub'>
              Chưa có
            </div>
          )}
          {img.isPrimary && !isUploading && (
            <span className='absolute bottom-0 left-0 right-0 bg-theme-primary-start/80 py-0.5 text-center text-[10px] text-white'>
              Chính
            </span>
          )}
        </div>

        {/* Controls */}
        <div className='flex flex-1 flex-col gap-2.5'>
          {/* URL / Upload toggle */}
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={() => setUrlMode(true)}
              className={cn(
                'flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition',
                urlMode
                  ? 'border-theme-primary-start bg-theme-primary-start/5 text-theme-primary-start'
                  : 'border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card text-text-sub hover:bg-gray-50 dark:hover:bg-white/8',
              )}
            >
              <LinkIcon size={12} />
              Nhập URL
            </button>
            <button
              type='button'
              onClick={() => fileRef.current?.click()}
              className={cn(
                'flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition',
                !urlMode
                  ? 'border-theme-primary-start bg-theme-primary-start/5 text-theme-primary-start'
                  : 'border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card text-text-sub hover:bg-gray-50 dark:hover:bg-white/8',
              )}
            >
              <Upload size={12} />
              Tải lên
            </button>
            <input
              ref={fileRef}
              type='file'
              accept='image/*'
              className='hidden'
              onChange={handleFileChange}
            />
          </div>

          {urlMode && (
            <input
              type='url'
              value={img.imageUrl}
              onChange={(e) => onUpdateUrl(e.target.value)}
              placeholder='https://example.com/image.jpg'
              className='h-10 w-full rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-3 text-sm text-text-main placeholder:text-text-sub focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20'
            />
          )}

          {/* Actions row */}
          <div className='flex items-center gap-2'>
            <button
              type='button'
              disabled={img.isPrimary}
              onClick={onSetPrimary}
              title='Đặt làm ảnh chính'
              className={cn(
                'flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition',
                img.isPrimary
                  ? 'cursor-default border-amber-200 bg-amber-50 text-amber-600'
                  : 'border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card text-text-sub hover:border-amber-300 hover:text-amber-600',
              )}
            >
              <Star
                size={12}
                className={img.isPrimary ? 'fill-amber-500 text-amber-500' : ''}
              />
              {img.isPrimary ? 'Ảnh chính' : 'Đặt làm chính'}
            </button>

            <button
              type='button'
              onClick={onRemove}
              className='ml-auto flex items-center gap-1.5 rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-3 py-1.5 text-xs font-medium text-red-500 transition hover:border-red-200 hover:bg-red-50'
            >
              <Trash2 size={12} />
              Xóa
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main shared form component ───────────────────────────────────
interface ProductFormPageProps {
  mode: 'new' | 'edit';
  initialProduct?: ProductResponse;
}

export function ProductFormPage({
  mode,
  initialProduct,
}: ProductFormPageProps) {
  const router = useRouter();
  const {
    form,
    setField,
    images,
    addImage,
    removeImage,
    setPrimary,
    updateImageUrl,
    draftInventoryItems,
    addDraftInventoryItem,
    updateDraftInventoryItem,
    removeDraftInventoryItem,
    errors,
    isValid,
  } = useProductForm(initialProduct);

  const [submitted, setSubmitted] = useState(false);

  // ── Voucher price state (tracks computed dailyPrice from calculator) ──
  const [priceValues, setPriceValues] = useState<PriceValues>({
    dailyPrice: initialProduct ? initialProduct.dailyPrice : 0,
    oldDailyPrice: initialProduct?.oldDailyPrice ?? undefined,
    selectedVoucherId: initialProduct?.voucherId ?? undefined,
  });

  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();
  const createInventoryItemMutation = useCreateInventoryItemMutation(
    form.productId || '',
  );
  const updateInventoryItemMutation = useUpdateInventoryItemMutation(
    form.productId || '',
  );

  // Fetch categories for tree select
  useCategoryTreeQuery();

  const previewProduct = draftToProductPreview(form, images);

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!isValid) return;

    // Ảnh: sort primary lên đầu, sau đó theo sortOrder → BE coi phần tử đầu tiên là primary
    const imageUrls = [...images]
      .sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return a.sortOrder - b.sortOrder;
      })
      .filter((img) => img.imageUrl)
      .map((img) => img.imageUrl);

    // Màu: lấy từ form.colors (mảng { name, code })
    const colors = form.colors.length > 0 ? form.colors : undefined;

    // Giá: lấy từ VoucherPriceCalculator
    const dailyPrice =
      priceValues.dailyPrice > 0
        ? priceValues.dailyPrice
        : parseFloat(form.dailyPrice) || 0;
    const oldDailyPrice = priceValues.oldDailyPrice;

    if (mode === 'new') {
      createMutation.mutate(
        {
          categoryId: form.categoryId,
          name: form.name,
          dailyPrice,
          depositAmount: form.depositAmount
            ? parseFloat(form.depositAmount)
            : 0,
          brand: form.brand || undefined,
          voucherId: priceValues.selectedVoucherId || undefined,
          colors,
          description: form.description || undefined,
          shortDescription: form.shortDescription || undefined,
          oldDailyPrice,
          minRentalDays: parseInt(form.minRentalDays) || 1,
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        },
        {
          onSuccess: (newProduct) => {
            // Tạo inventory items cho product mới nếu có draft items
            const pendingItems = draftInventoryItems.filter(
              (item) => item.serialNumber && item.hubId,
            );
            if (pendingItems.length > 0) {
              // Build a map: hex color code → real productColorId from BE
              // Draft items store color.code (hex) as productColorId because
              // real UUIDs don't exist yet during create mode.
              const colorCodeToId = new Map<string, string>();
              for (const c of newProduct.colors ?? []) {
                colorCodeToId.set(c.code, c.productColorId);
              }

              Promise.all(
                pendingItems.map((item) => {
                  // Resolve draft colorId (hex code) → real UUID
                  const resolvedColorId = item.productColorId
                    ? (colorCodeToId.get(item.productColorId) ??
                      item.productColorId)
                    : undefined;

                  return createInventoryItemMutation.mutateAsync({
                    productId: newProduct.productId,
                    hubId: item.hubId,
                    serialNumber: item.serialNumber,
                    conditionGrade: item.conditionGrade,
                    staffNote: item.staffNote || undefined,
                    productColorId: resolvedColorId || undefined,
                  });
                }),
              ).finally(() => router.push('/dashboard/products'));
            } else {
              router.push('/dashboard/products');
            }
          },
        },
      );
    } else {
      if (!form.productId) return;
      updateMutation.mutate(
        {
          productId: form.productId,
          payload: {
            categoryId: form.categoryId,
            name: form.name,
            dailyPrice,
            depositAmount: form.depositAmount
              ? parseFloat(form.depositAmount)
              : 0,
            brand: form.brand || undefined,
            // Empty string = unlink voucher; undefined = no change (but we always send to keep in sync)
            voucherId: priceValues.selectedVoucherId ?? '',
            colors,
            description: form.description || undefined,
            shortDescription: form.shortDescription || undefined,
            oldDailyPrice,
            minRentalDays: parseInt(form.minRentalDays) || 1,
            imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
            isActive: form.isActive,
          },
        },
        {
          onSuccess: () => {
            // Phân loại draft items: mới tạo vs đã tồn tại
            const newDraftItems = draftInventoryItems.filter(
              (item) =>
                !item.inventoryItemId && item.serialNumber && item.hubId,
            );
            const existingItems = draftInventoryItems.filter(
              (item) => !!item.inventoryItemId,
            );

            const allOps = [
              ...newDraftItems.map((item) =>
                createInventoryItemMutation.mutateAsync({
                  productId: form.productId,
                  hubId: item.hubId,
                  serialNumber: item.serialNumber,
                  conditionGrade: item.conditionGrade,
                  staffNote: item.staffNote || undefined,
                  productColorId: item.productColorId || undefined,
                }),
              ),
              ...existingItems.flatMap((item) => {
                // Diff against _original — only send changed fields
                const orig = item._original;
                const patch: {
                  hubId?: string;
                  conditionGrade?: typeof item.conditionGrade;
                  staffNote?: string;
                  productColorId?: string;
                  status?: typeof item.status;
                } = {};

                if (!orig || item.hubId !== orig.hubId)
                  patch.hubId = item.hubId || undefined;
                if (!orig || item.conditionGrade !== orig.conditionGrade)
                  patch.conditionGrade = item.conditionGrade;
                if (!orig || item.staffNote !== orig.staffNote)
                  patch.staffNote = item.staffNote || undefined;
                if (!orig || item.productColorId !== orig.productColorId)
                  patch.productColorId = item.productColorId || undefined;
                if (!orig || item.status !== orig.status)
                  patch.status = item.status;

                // Nothing changed — skip API call
                if (Object.keys(patch).length === 0) return [];

                return [
                  updateInventoryItemMutation.mutateAsync({
                    inventoryItemId: item.inventoryItemId!,
                    payload: patch,
                  }),
                ];
              }),
            ];

            if (allOps.length > 0) {
              Promise.all(allOps).finally(() =>
                router.push('/dashboard/products'),
              );
            } else {
              router.push('/dashboard/products');
            }
          },
        },
      );
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const showError = (key: keyof typeof errors) =>
    submitted ? errors[key] : undefined;

  return (
    <div className='flex h-full gap-6 p-6'>
      {/* ── CỘT TRÁI: Form ── */}
      <div className='flex min-w-0 flex-1 flex-col gap-5 overflow-y-auto pb-8'>
        {/* Back button */}
        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={() => router.push('/dashboard/products')}
            className='flex items-center gap-2 text-sm text-text-sub transition hover:text-text-main'
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>
          <span className='text-text-sub'>/</span>
          <h2 className='text-base font-semibold text-text-main'>
            {mode === 'new' ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'}
          </h2>
        </div>

        {/* ── SECTION 1: Thông tin cơ bản ── */}
        <FormSection title='Thông tin cơ bản'>
          <div className='flex flex-col gap-4'>
            {/* Danh mục */}
            <Field label='Danh mục' required error={showError('categoryId')}>
              <CategoryTreeSelect
                value={form.categoryId}
                onChange={(id) => setField('categoryId', id)}
                placeholder='— Chọn danh mục —'
              />
            </Field>

            {/* Tên sản phẩm */}
            <Field label='Tên sản phẩm' required error={showError('name')}>
              <TextInput
                value={form.name}
                onChange={(v) => setField('name', v)}
                placeholder='VD: Canon EOS R50'
              />
            </Field>

            {/* Mô tả ngắn */}
            <Field
              label='Mô tả ngắn (shortDescription)'
              hint='Dòng giới thiệu ngắn hiển thị trên card sản phẩm, VD: "Mã MACBOOK-05 - MacBook Air cho công việc sáng tạo"'
            >
              <TextInput
                value={form.shortDescription}
                onChange={(v) => setField('shortDescription', v)}
                placeholder='VD: Mã CAM-001 - Canon EOS R50 dành cho người mới bắt đầu'
              />
            </Field>

            {/* Thương hiệu + Màu sắc */}
            <div className='grid grid-cols-1 gap-4'>
              <Field label='Thương hiệu' hint='VD: Canon, Sony, Fujifilm'>
                <TextInput
                  value={form.brand}
                  onChange={(v) => setField('brand', v)}
                  placeholder='VD: Canon'
                />
              </Field>
              <Field
                label='Màu sắc sản phẩm'
                hint='Chọn hoặc thêm màu — mỗi inventory item sẽ được gắn với một màu'
              >
                <ColorPickerList
                  colors={form.colors}
                  onChange={(c) => setField('colors', c)}
                />
              </Field>
            </div>

            {/* Mô tả */}
            <Field label='Mô tả'>
              <RichEditor
                placeholder='Mô tả ngắn gọn về sản phẩm...'
                minHeight='160px'
                initialContent={form.description}
                onChange={(html) =>
                  setField('description', html === '<br>' ? '' : html)
                }
              />
            </Field>

            {/* Giá thuê — dùng VoucherPriceCalculator thay cho 2 input thủ công */}
            <Field
              label='Giá thuê & Voucher giảm giá'
              required
              error={showError('dailyPrice')}
              hint='Nhập giá gốc rồi chọn voucher để tự động tính giá thuê cuối'
            >
              <VoucherPriceCalculator
                oldDailyPrice={form.oldDailyPrice || form.dailyPrice}
                onOldDailyPriceChange={(v) => {
                  setField('oldDailyPrice', v);
                  setField('dailyPrice', v); // sync để validation
                }}
                selectedVoucherId={priceValues.selectedVoucherId}
                onVoucherChange={(id) => {
                  setPriceValues((prev) => ({
                    ...prev,
                    selectedVoucherId: id,
                  }));
                  setField('voucherId', id ?? '');
                }}
                onValueChange={setPriceValues}
              />
            </Field>

            {/* Đặt cọc + Thuê tối thiểu (2 cột) */}
            <div className='grid grid-cols-2 gap-4'>
              <Field
                label='Tiền đặt cọc'
                error={showError('depositAmount')}
                hint='Đơn vị: VNĐ'
              >
                <div className='relative'>
                  <TextInput
                    value={formatVND(form.depositAmount)}
                    onChange={(v) => setField('depositAmount', parseVND(v))}
                    placeholder='3.000.000'
                  />
                  <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-sub'>
                    ₫
                  </span>
                </div>
              </Field>
              <Field
                label='Số ngày thuê tối thiểu'
                required
                error={showError('minRentalDays')}
              >
                <div className='flex h-11 overflow-hidden rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card focus-within:border-theme-primary-start focus-within:ring-2 focus-within:ring-theme-primary-start/20'>
                  <button
                    type='button'
                    onClick={() => {
                      const cur = parseInt(form.minRentalDays) || 1;
                      if (cur > 1) setField('minRentalDays', String(cur - 1));
                    }}
                    className='flex w-10 shrink-0 items-center justify-center border-r border-gray-200 dark:border-white/8 text-lg font-medium text-text-sub transition hover:bg-gray-50 dark:hover:bg-white/8 hover:text-text-main select-none'
                  >
                    −
                  </button>
                  <input
                    type='number'
                    min={1}
                    value={form.minRentalDays}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '');
                      setField(
                        'minRentalDays',
                        raw === '' ? '' : String(Math.max(1, parseInt(raw))),
                      );
                    }}
                    onWheel={(e) => e.currentTarget.blur()}
                    onKeyDown={(e) => {
                      if (
                        !/^[0-9]$/.test(e.key) &&
                        ![
                          'Backspace',
                          'Delete',
                          'ArrowUp',
                          'ArrowDown',
                          'Tab',
                        ].includes(e.key)
                      ) {
                        e.preventDefault();
                      }
                    }}
                    placeholder='1'
                    className='min-w-0 flex-1 bg-transparent text-center text-sm text-text-main placeholder:text-text-sub focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                  />
                  <button
                    type='button'
                    onClick={() => {
                      const cur = parseInt(form.minRentalDays) || 0;
                      setField('minRentalDays', String(cur + 1));
                    }}
                    className='flex w-10 shrink-0 items-center justify-center border-l border-gray-200 dark:border-white/8 text-lg font-medium text-text-sub transition hover:bg-gray-50 dark:hover:bg-white/8 hover:text-text-main select-none'
                  >
                    +
                  </button>
                </div>
              </Field>
            </div>

            {/* Trạng thái hoạt động — chỉ hiển thị trong edit mode */}
            {mode === 'edit' && (
              <Field
                label='Trạng thái'
                hint='Tắt sẽ ẩn sản phẩm khỏi danh sách cho thuê'
              >
                <label className='flex cursor-pointer items-center gap-3'>
                  <div className='relative'>
                    <input
                      type='checkbox'
                      checked={form.isActive}
                      onChange={(e) => setField('isActive', e.target.checked)}
                      className='sr-only'
                    />
                    <div
                      className={cn(
                        'h-6 w-11 rounded-full transition-colors',
                        form.isActive
                          ? 'bg-theme-primary-start'
                          : 'bg-gray-300 dark:bg-white/20',
                      )}
                    />
                    <div
                      className={cn(
                        'absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform',
                        form.isActive ? 'translate-x-5' : 'translate-x-0.5',
                      )}
                    />
                  </div>
                  <span className='text-sm text-text-main'>
                    {form.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                  </span>
                </label>
              </Field>
            )}
          </div>
        </FormSection>

        {/* ── SECTION 2: Hình ảnh ── */}
        <FormSection title='Hình ảnh sản phẩm'>
          <div className='flex flex-col gap-3'>
            {images.length === 0 && (
              <p className='text-center text-sm text-text-sub py-4'>
                Chưa có ảnh nào. Thêm ảnh để hiển thị trên card sản phẩm.
              </p>
            )}

            {images.map((img) => (
              <ImageItem
                key={img.draftId}
                img={img}
                onSetPrimary={() => setPrimary(img.draftId)}
                onRemove={() => removeImage(img.draftId)}
                onUpdateUrl={(url: string) => updateImageUrl(img.draftId, url)}
              />
            ))}

            <button
              type='button'
              onClick={() => addImage('')}
              className='flex h-11 items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 dark:border-white/15 bg-gray-50 dark:bg-white/3 text-sm text-text-sub transition hover:border-theme-primary-start hover:bg-theme-primary-start/5 hover:text-theme-primary-start'
            >
              <Plus size={16} />
              Thêm ảnh
            </button>
          </div>
        </FormSection>

        {/* ── SECTION 3: Inventory Items ── */}
        <FormSection title='Thiết bị vật lý (Inventory Items)'>
          <p className='mb-4 text-xs text-text-sub'>
            {mode === 'new'
              ? 'Thêm thiết bị vật lý ngay khi tạo sản phẩm. Mỗi thiết bị cần có Hub và Serial Number. Các thiết bị này sẽ được tạo sau khi sản phẩm được lưu thành công.'
              : 'Thêm từng thiết bị vật lý theo số serial. Mỗi thiết bị cần có Hub ID và Serial Number. Nhấn "Lưu thay đổi" để gửi các thiết bị mới lên server.'}
          </p>
          <InventorySection
            items={draftInventoryItems}
            productColors={form.colors}
            onAdd={addDraftInventoryItem}
            onRemove={removeDraftInventoryItem}
            onUpdate={updateDraftInventoryItem}
          />
        </FormSection>

        {/* ── Submit ── */}
        <div className='flex items-center justify-end gap-3 pt-2'>
          <button
            type='button'
            onClick={() => router.push('/dashboard/products')}
            className='rounded-md border border-gray-200 dark:border-white/8 px-6 py-2.5 text-sm font-medium text-text-main transition hover:bg-gray-50 dark:hover:bg-white/8'
          >
            Hủy bỏ
          </button>
          <button
            type='button'
            onClick={handleSubmit}
            disabled={isSaving}
            className='flex items-center gap-2 rounded-md bg-theme-primary-start px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed'
          >
            <Save size={16} />
            {isSaving
              ? 'Đang lưu...'
              : mode === 'new'
                ? 'Tạo sản phẩm'
                : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      {/* ── CỘT PHẢI: Live preview ── */}
      <aside className='hidden w-72 shrink-0 xl:block'>
        <div className='sticky top-6'>
          <p className='mb-3 text-xs font-semibold uppercase tracking-wider text-text-sub'>
            Xem trước
          </p>
          <ProductCard product={previewProduct} variant='preview' />
          <p className='mt-2 text-center text-xs text-text-sub'>
            Card hiển thị ngoài trang chủ
          </p>
        </div>
      </aside>
    </div>
  );
}
