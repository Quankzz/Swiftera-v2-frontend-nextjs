'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  Tag,
  CalendarDays,
  Wallet,
  ImageOff,
  Package,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutGrid,
  Boxes,
  CheckCircle2,
  CircleDot,
  Wrench,
  ShieldAlert,
  Archive,
  BookmarkCheck,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  ProductResponse,
  ProductImageResponse,
  InventoryItemResponse,
  InventoryItemInProduct,
} from '@/features/products/types';
import { useInventoryItemsQuery } from '@/features/products/hooks/use-inventory-items';
import { useProductQuery } from '@/features/products/hooks/use-product-management';

const formatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

function getSalePercent(daily: number, oldDaily: number) {
  return Math.round(((oldDaily - daily) / oldDaily) * 100);
}

type Tab = 'overview' | 'description' | 'inventory';

interface ProductViewDialogProps {
  product: ProductResponse | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (product: ProductResponse) => void;
}

// ─── Image gallery with navigation ───────────────────────────────
function ImageGallery({
  images,
  name,
}: {
  images: ProductImageResponse[];
  name: string;
}) {
  const [activeIdx, setActiveIdx] = useState(
    Math.max(
      0,
      images.findIndex((i) => i.isPrimary),
    ),
  );

  if (images.length === 0) {
    return (
      <div className='flex h-72 w-full flex-col items-center justify-center gap-2 rounded-xl bg-gray-100 dark:bg-white/5 text-text-sub'>
        <ImageOff size={36} className='opacity-30' />
        <span className='text-sm'>Không có ảnh</span>
      </div>
    );
  }
  const active = images[activeIdx];
  return (
    <div className='flex flex-col gap-3'>
      {/* Main image */}
      <div className='relative flex h-72 w-full items-center justify-center overflow-hidden rounded-xl bg-gray-50 dark:bg-white/3'>
        <Image
          src={active.imageUrl}
          alt={name}
          fill
          className='object-contain'
          sizes='600px'
        />
        {images.length > 1 && (
          <>
            <button
              type='button'
              onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
              disabled={activeIdx === 0}
              className='absolute left-2 flex size-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50 disabled:opacity-20'
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type='button'
              onClick={() =>
                setActiveIdx((i) => Math.min(images.length - 1, i + 1))
              }
              disabled={activeIdx === images.length - 1}
              className='absolute right-2 flex size-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50 disabled:opacity-20'
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
        <span className='absolute bottom-2 right-2 rounded-full bg-black/40 px-2 py-0.5 text-xs text-white backdrop-blur-sm'>
          {activeIdx + 1} / {images.length}
        </span>
      </div>
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className='flex gap-2 overflow-x-auto pb-1'>
          {images.map((img, i) => (
            <button
              key={img.productImageId ?? i}
              type='button'
              onClick={() => setActiveIdx(i)}
              className={cn(
                'relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition',
                i === activeIdx
                  ? 'border-theme-primary-start'
                  : 'border-gray-200 dark:border-white/8 opacity-60 hover:opacity-100',
              )}
            >
              <Image
                src={img.imageUrl}
                alt={`Ảnh ${i + 1}`}
                fill
                className='object-cover'
                sizes='64px'
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className='flex items-start gap-2.5 rounded-lg border border-gray-100 dark:border-white/8 bg-white dark:bg-white/3 px-3 py-2.5'>
      <Icon size={14} className='mt-0.5 shrink-0 text-text-sub' />
      <div className='min-w-0'>
        <p className='text-xs text-text-sub'>{label}</p>
        <p className='truncate text-sm font-medium text-text-main'>{value}</p>
      </div>
    </div>
  );
}

// ─── Tab: Tổng quan ───────────────────────────────────────────────
function OverviewTab({ product }: { product: ProductResponse }) {
  const salePercent =
    product.oldDailyPrice && product.oldDailyPrice > product.dailyPrice
      ? getSalePercent(product.dailyPrice, product.oldDailyPrice)
      : null;

  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
      {/* Left: image gallery */}
      <ImageGallery images={product.images} name={product.name} />

      {/* Right: details */}
      <div className='flex flex-col gap-5'>
        {/* Title + sale badge */}
        <div>
          {salePercent !== null && (
            <span className='btn-gradient-accent mb-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold text-white'>
              Giảm {salePercent}%
            </span>
          )}
          {!product.isActive && (
            <span className='mb-2 ml-2 inline-block rounded-full bg-gray-100 dark:bg-white/8 border border-gray-200 dark:border-white/8 px-2.5 py-0.5 text-xs font-medium text-text-sub'>
              Tạm ngưng
            </span>
          )}
          <h3 className='text-2xl font-bold text-text-main'>{product.name}</h3>
          <p className='mt-1 text-sm text-text-sub'>{product.categoryName}</p>
        </div>

        {/* Price */}
        <div className='rounded-xl border border-gray-100 dark:border-white/8 bg-gray-50 dark:bg-white/3 px-5 py-4'>
          <p className='mb-1 text-xs font-medium text-text-sub uppercase tracking-wider'>
            Giá thuê
          </p>
          <div className='flex items-baseline gap-2'>
            <span className='text-3xl font-bold text-theme-accent-start'>
              {formatter.format(product.dailyPrice)}
            </span>
            <span className='text-sm text-text-sub'>/ ngày</span>
          </div>
          {product.oldDailyPrice && (
            <p className='mt-0.5 text-sm text-text-sub line-through'>
              {formatter.format(product.oldDailyPrice)} / ngày
            </p>
          )}
        </div>

        {/* Meta grid */}
        <div className='grid grid-cols-2 gap-3'>
          <MetaItem icon={Tag} label='Danh mục' value={product.categoryName} />
          <MetaItem
            icon={CalendarDays}
            label='Thuê tối thiểu'
            value={`${product.minRentalDays} ngày`}
          />
          {product.depositAmount != null && (
            <MetaItem
              icon={Wallet}
              label='Đặt cọc'
              value={formatter.format(product.depositAmount)}
            />
          )}
          <MetaItem
            icon={Package}
            label='Sẵn sàng cho thuê'
            value={`${product.availableStock} thiết bị`}
          />
        </div>

        {/* Brand + Color */}
        {(product.brand || product.color) && (
          <div className='flex flex-wrap gap-3'>
            {product.brand && (
              <div className='rounded-lg border border-gray-100 dark:border-white/8 bg-white dark:bg-white/3 px-3 py-2'>
                <p className='text-xs text-text-sub'>Thương hiệu</p>
                <p className='text-sm font-medium text-text-main'>
                  {product.brand}
                </p>
              </div>
            )}
            {product.color && (
              <div className='rounded-lg border border-gray-100 dark:border-white/8 bg-white dark:bg-white/3 px-3 py-2'>
                <p className='text-xs text-text-sub'>Màu sắc</p>
                <p className='text-sm font-medium text-text-main'>
                  {product.color}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Mô tả HTML ──────────────────────────────────────────────
function DescriptionTab({ description }: { description: string | null }) {
  if (!description) {
    return (
      <p className='text-sm text-text-sub italic'>Chưa có mô tả chi tiết.</p>
    );
  }
  return (
    <div
      className='rich-content max-w-none text-sm text-text-main leading-relaxed'
      dangerouslySetInnerHTML={{ __html: description }}
    />
  );
}

// ─── Inventory helpers ────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  AVAILABLE: {
    label: 'Sẵn sàng',
    className:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: CheckCircle2,
  },
  RESERVED: {
    label: 'Đã đặt trước',
    className:
      'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    icon: BookmarkCheck,
  },
  RENTED: {
    label: 'Đang cho thuê',
    className:
      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: CircleDot,
  },
  MAINTENANCE: {
    label: 'Bảo trì',
    className:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon: Wrench,
  },
  DAMAGED: {
    label: 'Hỏng',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: ShieldAlert,
  },
  RETIRED: {
    label: 'Ngừng sử dụng',
    className: 'bg-gray-100 text-gray-500 dark:bg-white/8 dark:text-gray-400',
    icon: Archive,
  },
};

const CONDITION_LABEL: Record<string, string> = {
  NEW: 'Mới - Như hộp',
  GOOD: 'Tốt - Vài vết nhỏ',
  FAIR: 'Trung bình - Dùng nhiều',
  POOR: 'Kém - Cần kiểm tra',
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-500',
    icon: AlertCircle,
  };
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        cfg.className,
      )}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

/** Union item type - InventoryCard works with both embedded and standalone types */
type InventoryItem = InventoryItemResponse | InventoryItemInProduct;

function InventoryCard({ item }: { item: InventoryItem }) {
  return (
    <div className='rounded-xl border border-gray-100 dark:border-white/8 bg-white dark:bg-white/3 p-4 flex flex-col gap-2'>
      {/* Top row: serial + status */}
      <div className='flex items-center justify-between gap-2 flex-wrap'>
        <span className='font-mono text-sm font-semibold text-text-main tracking-wide'>
          {item.serialNumber}
        </span>
        <StatusBadge status={item.status} />
      </div>
      {/* Mid row: hub + condition */}
      <div className='flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-sub'>
        <span>
          📦{' '}
          <span className='font-medium text-text-main'>
            {item.hubName ?? item.hubId}
          </span>
        </span>
        {item.conditionGrade && (
          <span>
            🔖 {CONDITION_LABEL[item.conditionGrade] ?? item.conditionGrade}
          </span>
        )}
        {item.colorName && (
          <span className='flex items-center gap-1'>
            <span
              className='inline-block h-2.5 w-2.5 rounded-full border border-white/50 shadow-sm'
              style={{ backgroundColor: item.colorCode ?? undefined }}
            />
            {item.colorName}
          </span>
        )}
      </div>
      {/* Staff note */}
      {item.staffNote && (
        <p className='text-xs text-text-sub italic border-t border-gray-100 dark:border-white/8 pt-2'>
          {item.staffNote}
        </p>
      )}
      {/* Timestamps - only available from standalone InventoryItemResponse */}
      {'createdAt' in item && item.createdAt && (
        <p className='text-[11px] text-text-sub/60 border-t border-gray-100 dark:border-white/8 pt-1.5'>
          Thêm vào:{' '}
          {new Intl.DateTimeFormat('vi-VN', {
            dateStyle: 'short',
            timeStyle: 'short',
          }).format(new Date(item.createdAt))}
        </p>
      )}
    </div>
  );
}

// Counts per status
function InventorySummaryBar({ items }: { items: InventoryItem[] }) {
  const counts = items.reduce<Record<string, number>>((acc, it) => {
    acc[it.status] = (acc[it.status] ?? 0) + 1;
    return acc;
  }, {});

  const chips = Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
    key,
    label: cfg.label,
    className: cfg.className,
    count: counts[key] ?? 0,
  }));

  return (
    <div className='flex flex-wrap gap-2 pb-1'>
      {chips
        .filter((c) => c.count > 0)
        .map((c) => (
          <span
            key={c.key}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
              c.className,
            )}
          >
            {c.label}
            <span className='font-bold'>{c.count}</span>
          </span>
        ))}
    </div>
  );
}

// ─── Tab: Thiết bị ────────────────────────────────────────────────
function InventoryTab({ productId }: { productId: string }) {
  // Strategy: use product detail (PUBLIC, always works, has embedded inventoryItems)
  // as primary source. Fall back to standalone inventory API if embedded list is missing.
  const productQuery = useProductQuery(productId);
  const inventoryQuery = useInventoryItemsQuery(
    // Only call standalone API if product detail has no embedded inventoryItems
    productQuery.data && !productQuery.data.inventoryItems
      ? productId
      : undefined,
  );

  const isLoading = productQuery.isLoading || inventoryQuery.isLoading;
  const isError = productQuery.isError && inventoryQuery.isError;

  // Prefer embedded items from product detail; fall back to standalone API
  const items: InventoryItem[] =
    productQuery.data?.inventoryItems ?? inventoryQuery.data?.content ?? [];

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className='h-28 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5'
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className='flex flex-col items-center gap-2 py-12 text-text-sub'>
        <AlertCircle size={32} className='text-red-400 opacity-60' />
        <p className='text-sm'>Không thể tải danh sách thiết bị.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className='flex flex-col items-center gap-3 py-16 text-text-sub'>
        <Boxes size={40} className='opacity-20' />
        <p className='text-sm'>Chưa có thiết bị nào được thêm.</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <p className='text-sm font-medium text-text-main'>
          Tổng cộng{' '}
          <span className='font-bold text-theme-primary-start'>
            {items.length}
          </span>{' '}
          thiết bị
        </p>
        <InventorySummaryBar items={items} />
      </div>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {items.map((item) => (
          <InventoryCard key={item.inventoryItemId} item={item} />
        ))}
      </div>
    </div>
  );
}

// ─── Main dialog ──────────────────────────────────────────────────
export function ProductViewDialog({
  product,
  open,
  onClose,
  onEdit,
}: ProductViewDialogProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open || !product) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6 lg:p-8'>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black/60 backdrop-blur-sm'
        onClick={onClose}
      />
      {/* key resets tab state when product changes */}
      <ProductViewContent
        key={product.productId}
        product={product}
        onClose={onClose}
        onEdit={onEdit}
      />
    </div>
  );
}

function ProductViewContent({
  product,
  onClose,
  onEdit,
}: {
  product: ProductResponse;
  onClose: () => void;
  onEdit?: (product: ProductResponse) => void;
}) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutGrid },
    { id: 'description', label: 'Mô tả chi tiết', icon: FileText },
    { id: 'inventory', label: 'Thiết bị', icon: Boxes },
  ];

  return (
    <>
      <div className='relative z-10 flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white dark:bg-surface-card shadow-2xl dark:shadow-black/60 my-auto'>
        {/* ── Top header ── */}
        <div className='flex items-center justify-between border-b border-gray-100 dark:border-white/8 px-6 py-4'>
          <div className='flex min-w-0 items-center gap-3'>
            <div className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-theme-primary-start/10'>
              <Package size={16} className='text-theme-primary-start' />
            </div>
            <div className='min-w-0'>
              <h2 className='truncate text-base font-semibold text-text-main'>
                {product.name}
              </h2>
              <p className='text-xs text-text-sub'>#{product.productId}</p>
            </div>
          </div>
          <div className='flex items-center gap-2 shrink-0'>
            {onEdit && (
              <button
                type='button'
                onClick={() => {
                  onClose();
                  onEdit(product);
                }}
                className='rounded-lg border border-gray-200 dark:border-white/8 px-3 py-1.5 text-xs font-medium text-text-main transition hover:bg-gray-50 dark:hover:bg-white/8'
              >
                Chỉnh sửa
              </button>
            )}
            <button
              type='button'
              onClick={onClose}
              className='flex size-8 items-center justify-center rounded-lg text-text-sub transition hover:bg-gray-100 dark:hover:bg-white/8 hover:text-text-main'
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className='flex gap-1 border-b border-gray-100 dark:border-white/8 px-6 pt-3'>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type='button'
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px',
                activeTab === id
                  ? 'border-theme-primary-start text-theme-primary-start'
                  : 'border-transparent text-text-sub hover:text-text-main hover:bg-gray-50 dark:hover:bg-white/5',
              )}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div
          className='flex-1 overflow-y-auto px-6 py-6'
          style={{ maxHeight: 'calc(90vh - 130px)' }}
        >
          {activeTab === 'overview' && <OverviewTab product={product} />}
          {activeTab === 'description' && (
            <DescriptionTab description={product.description} />
          )}
          {activeTab === 'inventory' && (
            <InventoryTab productId={product.productId} />
          )}
        </div>

        {/* ── Footer ── */}
        <div className='flex items-center justify-between border-t border-gray-100 dark:border-white/8 px-6 py-4'>
          <p className='text-xs text-text-sub'>
            {product.availableStock > 0
              ? `${product.availableStock} thiết bị sẵn sàng cho thuê`
              : 'Hiện không có thiết bị sẵn sàng'}
          </p>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg border border-gray-200 dark:border-white/8 px-5 py-2 text-sm font-medium text-text-main transition hover:bg-gray-50 dark:hover:bg-white/8'
          >
            Đóng
          </button>
        </div>
      </div>
    </>
  );
}
