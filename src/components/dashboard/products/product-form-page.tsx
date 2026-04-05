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
import { ImageCropModal } from './image-crop-modal';
import {
  useProductForm,
  draftToProductPreview,
  type DraftImage,
} from './use-product-form';
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from '@/features/products/hooks/use-product-management';
import { useCategoriesQuery } from '@/features/categories/hooks/use-category-management';
import type { ProductResponse } from '@/features/products/types';
import RichEditor from '@/components/feedback/rich-editor';
import { ColorPickerList } from './color-picker-list';
import {
  VoucherPriceCalculator,
  type PriceValues,
} from './voucher-price-calculator';
import { InventorySection } from './inventory-section';
import { useCreateInventoryItemMutation } from '@/features/products/hooks/use-inventory-items';
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
function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
  return new File([bytes], filename, { type: mime });
}

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
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [urlMode, setUrlMode] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const uploadMutation = useUploadFileMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
    // reset input để có thể upload lại cùng file
    e.target.value = '';
  };

  return (
    <>
      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          onCancel={() => setCropSrc(null)}
          onComplete={async (dataUrl) => {
            setCropSrc(null);
            setIsUploading(true);
            try {
              const file = dataUrlToFile(
                dataUrl,
                `product-image-${Date.now()}.jpg`,
              );
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
          }}
        />
      )}

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
              Tải lên + Cắt
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

  // ── Color picker state (multi-color UI, BE only needs first/joined string) ──
  // Initialize from initialProduct.color (comma-split if stored as comma-joined)
  const [colors, setColors] = useState<string[]>(() => {
    if (!initialProduct?.color) return [];
    return initialProduct.color
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
  });

  // ── Voucher price state (tracks computed dailyPrice from calculator) ──
  const [priceValues, setPriceValues] = useState<PriceValues>({
    dailyPrice: initialProduct ? initialProduct.dailyPrice : 0,
    oldDailyPrice: initialProduct?.oldDailyPrice ?? undefined,
    selectedVoucherId: undefined,
  });

  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();
  const createInventoryItemMutation = useCreateInventoryItemMutation(
    form.productId || '',
  );

  // Fetch categories for dropdown
  const { data: categoriesData, isLoading: loadingCategories } =
    useCategoriesQuery({ page: 0, size: 100 });
  const categoryList = categoriesData?.content ?? [];

  // Find categoryName for preview
  const selectedCategory = categoryList.find(
    (c) => c.categoryId === form.categoryId,
  );
  const previewProduct = draftToProductPreview(
    form,
    images,
    selectedCategory?.name,
  );

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!isValid) return;

    const imageUrls = images
      .filter((img) => img.imageUrl)
      .map((img) => img.imageUrl);

    // Màu: join nhiều màu thành 1 string (BE nhận single string)
    const colorString = colors.length > 0 ? colors.join(',') : undefined;

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
          color: colorString,
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
              Promise.all(
                pendingItems.map((item) =>
                  createInventoryItemMutation.mutateAsync({
                    productId: newProduct.productId,
                    hubId: item.hubId,
                    serialNumber: item.serialNumber,
                    conditionGrade: item.conditionGrade,
                    staffNote: item.staffNote || undefined,
                  }),
                ),
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
            color: colorString,
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
            // Tạo các inventory item draft mới (chưa có inventoryItemId)
            const newDraftItems = draftInventoryItems.filter(
              (item) =>
                !item.inventoryItemId && item.serialNumber && item.hubId,
            );
            if (newDraftItems.length > 0) {
              Promise.all(
                newDraftItems.map((item) =>
                  createInventoryItemMutation.mutateAsync({
                    productId: form.productId,
                    hubId: item.hubId,
                    serialNumber: item.serialNumber,
                    conditionGrade: item.conditionGrade,
                    staffNote: item.staffNote || undefined,
                  }),
                ),
              ).finally(() => router.push('/dashboard/products'));
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
              <select
                value={form.categoryId}
                onChange={(e) => setField('categoryId', e.target.value)}
                disabled={loadingCategories}
                className='h-11 w-full rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-3 text-sm text-text-main focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20 disabled:opacity-60'
              >
                <option value=''>
                  {loadingCategories ? 'Đang tải...' : '— Chọn danh mục —'}
                </option>
                {categoryList.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.name}
                  </option>
                ))}
              </select>
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

            {/* Thương hiệu + Màu sắc (2 cột) */}
            <div className='grid grid-cols-2 gap-4'>
              <Field label='Thương hiệu' hint='VD: Canon, Sony, Fujifilm'>
                <TextInput
                  value={form.brand}
                  onChange={(v) => setField('brand', v)}
                  placeholder='VD: Canon'
                />
              </Field>
              <Field
                label='Màu sắc'
                hint='Chọn 1 hoặc nhiều màu (BE nhận màu đầu tiên / các màu join bằng dấu phẩy)'
              >
                <ColorPickerList
                  colors={colors}
                  onChange={setColors}
                  maxColors={5}
                />
              </Field>
            </div>

            {/* Mô tả */}
            <Field label='Mô tả'>
              <RichEditor
                placeholder='Mô tả ngắn gọn về sản phẩm...'
                minHeight='160px'
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
                onVoucherChange={(id) =>
                  setPriceValues((prev) => ({
                    ...prev,
                    selectedVoucherId: id,
                  }))
                }
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
                onUpdateUrl={(url) => updateImageUrl(img.draftId, url)}
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

        {/* ── SECTION 3: Inventory Items (chỉ hiện ở edit mode) ── */}
        {mode === 'edit' && (
          <FormSection title='Thiết bị vật lý (Inventory Items)'>
            <p className='mb-4 text-xs text-text-sub'>
              Thêm từng thiết bị vật lý theo số serial. Mỗi thiết bị cần có Hub
              ID và Serial Number. Nhấn &quot;Lưu thay đổi&quot; để gửi các
              thiết bị mới lên server.
            </p>
            <InventorySection
              items={draftInventoryItems}
              onAdd={addDraftInventoryItem}
              onRemove={removeDraftInventoryItem}
              onUpdate={updateDraftInventoryItem}
            />
          </FormSection>
        )}

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
          <ProductPreviewCard product={previewProduct} />
          <p className='mt-2 text-center text-xs text-text-sub'>
            Card hiển thị ngoài trang chủ
          </p>
        </div>
      </aside>
    </div>
  );
}

// ─── Inline preview card (dashboard-only) ─────────────────────────
const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

function ProductPreviewCard({ product }: { product: ProductResponse }) {
  const primaryImage =
    product.images.find((img) => img.isPrimary) ?? product.images[0];
  const salePercent =
    product.oldDailyPrice && product.oldDailyPrice > product.dailyPrice
      ? Math.round(
          ((product.oldDailyPrice - product.dailyPrice) /
            product.oldDailyPrice) *
            100,
        )
      : null;

  return (
    <article className='relative flex flex-col overflow-hidden rounded-xl border border-border/75 dark:border-white/6 bg-white dark:bg-surface-card p-5 shadow-sm dark:shadow-black/30'>
      {salePercent !== null && (
        <span className='btn-gradient-accent absolute left-3 top-3 z-10 text-xs font-semibold text-white shadow-sm px-2 py-0.5 rounded-full'>
          -{salePercent}%
        </span>
      )}

      <header className='mt-2 mb-3 text-center'>
        <h3 className='line-clamp-2 text-base font-semibold text-text-main'>
          {product.name || (
            <span className='italic text-text-sub opacity-50'>
              Tên sản phẩm
            </span>
          )}
        </h3>
        {product.brand && (
          <p className='mt-0.5 text-xs text-text-sub'>{product.brand}</p>
        )}
      </header>

      <div className='relative h-44 w-full'>
        {primaryImage?.imageUrl ? (
          <Image
            src={primaryImage.imageUrl}
            alt={product.name}
            fill
            sizes='280px'
            className='object-contain'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center rounded-md bg-gray-100 dark:bg-white/8 text-xs text-text-sub'>
            Chưa có ảnh
          </div>
        )}
      </div>

      <div className='mt-3 flex flex-col gap-1'>
        {product.color && (
          <p className='text-center text-xs text-text-sub'>
            Màu: {product.color}
          </p>
        )}
        <div className='text-center'>
          <span className='text-lg font-bold text-theme-accent-start'>
            {product.dailyPrice ? (
              vndFormatter.format(product.dailyPrice)
            ) : (
              <span className='text-text-sub italic text-sm'>—</span>
            )}
          </span>
          {product.oldDailyPrice != null && (
            <span className='ml-2 text-sm text-text-sub line-through'>
              {vndFormatter.format(product.oldDailyPrice)}
            </span>
          )}
          <p className='text-xs text-text-sub'>/ngày</p>
        </div>
      </div>
    </article>
  );
}
