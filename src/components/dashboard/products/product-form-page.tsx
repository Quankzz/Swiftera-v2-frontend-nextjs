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
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/home/product-card';
import { ImageCropModal } from './image-crop-modal';
import { useProductForm, type DraftImage } from './use-product-form';
import { categories } from '@/data/categories';
import type { Product, ProductColor } from '@/types/catalog';

// Top-level danh mục
const topCategories = categories.filter((c) => c.parentId === null);

// ─── Màu thường gặp ───────────────────────────────────────────────
const PRESET_COLORS: ProductColor[] = [
  { name: 'Trắng', value: '#FFFFFF' },
  { name: 'Bạc', value: '#C0C0C0' },
  { name: 'Xám', value: '#6B7280' },
  { name: 'Đen', value: '#111111' },
  { name: 'Đỏ', value: '#EF4444' },
  { name: 'Cam', value: '#F97316' },
  { name: 'Vàng', value: '#EAB308' },
  { name: 'Xanh lá', value: '#22C55E' },
  { name: 'Xanh dương', value: '#3B82F6' },
  { name: 'Tím', value: '#A855F7' },
  { name: 'Hồng', value: '#EC4899' },
  { name: 'Vàng gold', value: '#D4AF37' },
];

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
    <section className='rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-[#1a1a1f]'>
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
        'h-11 w-full rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-[#1a1a1f] px-3 text-sm text-text-main placeholder:text-text-sub focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20',
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
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [urlMode, setUrlMode] = useState(!img.imageUrl.startsWith('data:'));

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
          onComplete={(dataUrl) => {
            onUpdateUrl(dataUrl);
            setCropSrc(null);
            setUrlMode(false);
          }}
        />
      )}

      <div className='flex gap-3 rounded-md border border-gray-200 dark:border-white/8 bg-gray-50 dark:bg-white/4 p-3'>
        {/* Preview thumbnail */}
        <div className='relative size-20 shrink-0 overflow-hidden rounded-md bg-white dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/8'>
          {img.imageUrl ? (
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
          {img.isPrimary && (
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
                  : 'border-gray-200 dark:border-white/8 bg-white dark:bg-[#1a1a1f] text-text-sub hover:bg-gray-50 dark:hover:bg-white/8',
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
                  : 'border-gray-200 dark:border-white/8 bg-white dark:bg-[#1a1a1f] text-text-sub hover:bg-gray-50 dark:hover:bg-white/8',
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
              value={img.imageUrl.startsWith('data:') ? '' : img.imageUrl}
              onChange={(e) => onUpdateUrl(e.target.value)}
              placeholder='https://example.com/image.jpg'
              className='h-10 w-full rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-[#1a1a1f] px-3 text-sm text-text-main placeholder:text-text-sub focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20'
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
                  : 'border-gray-200 dark:border-white/8 bg-white dark:bg-[#1a1a1f] text-text-sub hover:border-amber-300 hover:text-amber-600',
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
              className='ml-auto flex items-center gap-1.5 rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-[#1a1a1f] px-3 py-1.5 text-xs font-medium text-red-500 transition hover:border-red-200 hover:bg-red-50'
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
  initialProduct?: Product;
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
    colors,
    addColor,
    removeColor,
    previewProduct,
    errors,
    isValid,
  } = useProductForm(initialProduct);

  const [customColor, setCustomColor] = useState<{
    name: string;
    value: string;
  }>({
    name: '',
    value: '#000000',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    if (!isValid) return;
    // TODO: gọi API tạo / cập nhật
    console.log('Submit:', form, images, colors);
    router.push('/dashboard/products');
  };

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
                className='h-11 w-full rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-[#1a1a1f] px-3 text-sm text-text-main focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20'
              >
                <option value=''>— Chọn danh mục —</option>
                {topCategories.map((c) => (
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
                placeholder='VD: iPhone 15 Pro Max'
              />
            </Field>

            {/* Mô tả */}
            <Field label='Mô tả' required error={showError('description')}>
              <textarea
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder='Mô tả ngắn gọn về sản phẩm...'
                rows={3}
                className='w-full resize-none rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-[#1a1a1f] px-3 py-2.5 text-sm text-text-main placeholder:text-text-sub focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20'
              />
            </Field>

            {/* Giá thuê + Giá gốc (2 cột) */}
            <div className='grid grid-cols-2 gap-4'>
              <Field
                label='Giá thuê / ngày'
                required
                error={showError('dailyPrice')}
                hint='Đơn vị: VNĐ'
              >
                <div className='relative'>
                  <TextInput
                    value={formatVND(form.dailyPrice)}
                    onChange={(v) => setField('dailyPrice', parseVND(v))}
                    placeholder='350.000'
                  />
                  <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-sub'>
                    ₫
                  </span>
                </div>
              </Field>
              <Field label='Giá gốc (tuỳ chọn)' hint='Để hiển thị % giảm giá'>
                <div className='relative'>
                  <TextInput
                    value={formatVND(form.oldDailyPrice)}
                    onChange={(v) => setField('oldDailyPrice', parseVND(v))}
                    placeholder='450.000'
                  />
                  <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-sub'>
                    ₫
                  </span>
                </div>
              </Field>
            </div>

            {/* Đặt cọc + Thuê tối thiểu (2 cột) */}
            <div className='grid grid-cols-2 gap-4'>
              <Field label='Tiền đặt cọc (tuỳ chọn)' hint='Đơn vị: VNĐ'>
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
                <div className='flex h-11 overflow-hidden rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-[#1a1a1f] focus-within:border-theme-primary-start focus-within:ring-2 focus-within:ring-theme-primary-start/20'>
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
          </div>
        </FormSection>

        {/* ── SECTION 2: Màu sắc ── */}
        <FormSection title='Màu sắc (tuỳ chọn)'>
          <div className='flex flex-col gap-4'>
            {/* Màu đã chọn */}
            {colors.length > 0 && (
              <div className='flex flex-wrap gap-2'>
                {colors.map((c) => (
                  <div
                    key={c.value}
                    className='flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-white/8 bg-gray-50 dark:bg-white/5 pl-1.5 pr-2.5 py-1'
                  >
                    <span
                      className='size-4 rounded-full border border-white shadow ring-1 ring-black/10 shrink-0'
                      style={{ backgroundColor: c.value }}
                    />
                    <span className='text-xs text-text-main'>{c.name}</span>
                    <button
                      type='button'
                      onClick={() => removeColor(c.value)}
                      className='ml-0.5 text-text-sub hover:text-red-500 transition'
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Preset colors */}
            <div>
              <p className='mb-2 text-xs font-medium text-text-sub'>
                Màu thường gặp
              </p>
              <div className='flex flex-wrap gap-2'>
                {PRESET_COLORS.map((c) => {
                  const selected = colors.some((col) => col.value === c.value);
                  return (
                    <button
                      key={c.value}
                      type='button'
                      title={c.name}
                      onClick={() =>
                        selected ? removeColor(c.value) : addColor(c)
                      }
                      className={cn(
                        'size-8 rounded-full border-2 shadow transition hover:scale-110',
                        selected
                          ? 'border-theme-primary-start ring-2 ring-theme-primary-start/40'
                          : 'border-white ring-1 ring-black/10',
                      )}
                      style={{ backgroundColor: c.value }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Custom color */}
            <div className='rounded-md border border-gray-200 dark:border-white/8 bg-gray-50 dark:bg-white/5 p-3'>
              <p className='mb-2.5 text-xs font-medium text-text-sub'>
                Thêm màu tùy chỉnh
              </p>
              <div className='flex items-end gap-3'>
                <div className='flex flex-1 flex-col gap-1.5'>
                  <label className='text-xs text-text-sub'>Tên màu</label>
                  <input
                    type='text'
                    value={customColor.name}
                    onChange={(e) =>
                      setCustomColor((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder='VD: Blue Titanium'
                    className='h-10 w-full rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-[#1a1a1f] px-3 text-sm focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20'
                  />
                </div>
                {/* Styled color picker */}
                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs text-text-sub'>Chọn màu</label>
                  <label
                    title='Bấm để chọn màu'
                    className='relative flex h-10 w-28 cursor-pointer items-center gap-2 rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-[#1a1a1f] px-2.5 transition hover:border-gray-300 dark:hover:border-white/20'
                  >
                    {/* Color swatch */}
                    <span
                      className='size-5 shrink-0 rounded-full border border-white shadow ring-1 ring-black/15'
                      style={{ backgroundColor: customColor.value }}
                    />
                    {/* Hex label */}
                    <span className='flex-1 text-center font-mono text-xs text-text-main uppercase'>
                      {customColor.value.toUpperCase()}
                    </span>
                    {/* Hidden native input */}
                    <input
                      type='color'
                      value={customColor.value}
                      onChange={(e) =>
                        setCustomColor((p) => ({ ...p, value: e.target.value }))
                      }
                      className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
                    />
                  </label>
                </div>
                <button
                  type='button'
                  onClick={() => {
                    if (!customColor.name.trim()) return;
                    addColor({
                      name: customColor.name.trim(),
                      value: customColor.value,
                    });
                    setCustomColor({ name: '', value: '#000000' });
                  }}
                  className='flex h-10 items-center gap-1.5 rounded-md bg-theme-primary-start px-4 text-sm font-medium text-white transition hover:opacity-90'
                >
                  <Plus size={14} />
                  Thêm
                </button>
              </div>
            </div>
          </div>
        </FormSection>

        {/* ── SECTION 3: Hình ảnh ── */}
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
            className='flex items-center gap-2 rounded-md bg-theme-primary-start px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90'
          >
            <Save size={16} />
            {mode === 'new' ? 'Tạo sản phẩm' : 'Lưu thay đổi'}
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
