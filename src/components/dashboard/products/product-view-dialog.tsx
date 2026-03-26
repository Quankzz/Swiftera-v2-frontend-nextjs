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
  CheckCircle2,
  Wrench,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Layers,
  FileText,
  LayoutGrid,
  StickyNote,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  Product,
  InventoryItem,
  InventoryItemStatus,
} from '@/types/catalog';
import { categories } from '@/data/categories';

const formatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

// ─── Status meta ──────────────────────────────────────────────────
const STATUS_META: Record<
  InventoryItemStatus,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    border: string;
  }
> = {
  AVAILABLE: {
    label: 'Sẵn sàng',
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-500/30',
  },
  RENTED: {
    label: 'Đang cho thuê',
    icon: Package,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-500/30',
  },
  MAINTENANCE: {
    label: 'Đang bảo trì',
    icon: Wrench,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-500/30',
  },
  RETIRED: {
    label: 'Ngừng sử dụng',
    icon: XCircle,
    color: 'text-gray-500 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-white/5',
    border: 'border-gray-200 dark:border-white/8',
  },
};

const GRADE_LABEL: Record<string, string> = {
  A: 'A — Như mới',
  B: 'B — Tốt',
  C: 'C — Trung bình',
  D: 'D — Đã cũ',
};

type Tab = 'overview' | 'description' | 'inventory';

interface ProductViewDialogProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (product: Product) => void;
}

function getSalePercent(daily: number, oldDaily: number) {
  return Math.round(((oldDaily - daily) / oldDaily) * 100);
}

// ─── Image gallery with navigation ───────────────────────────────
function ImageGallery({
  images,
  name,
}: {
  images: Product['productImages'];
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

// ─── Tab: Tổng quan ───────────────────────────────────────────────
function OverviewTab({
  product,
  categoryName,
}: {
  product: Product;
  categoryName: string;
}) {
  const salePercent =
    product.oldDailyPrice && product.oldDailyPrice > product.dailyPrice
      ? getSalePercent(product.dailyPrice, product.oldDailyPrice)
      : null;
  const inv = product.inventoryItems ?? [];
  const available = inv.filter((i) => i.status === 'AVAILABLE').length;
  const rented = inv.filter((i) => i.status === 'RENTED').length;
  const maintenance = inv.filter((i) => i.status === 'MAINTENANCE').length;

  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
      {/* Left */}
      <ImageGallery images={product.productImages} name={product.name} />

      {/* Right */}
      <div className='flex flex-col gap-5'>
        {/* Title + sale */}
        <div>
          {salePercent !== null && (
            <span className='btn-gradient-accent mb-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold text-white'>
              Giảm {salePercent}%
            </span>
          )}
          <h3 className='text-2xl font-bold text-text-main'>{product.name}</h3>
          <p className='mt-1 text-sm text-text-sub'>{categoryName}</p>
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
          <MetaItem icon={Tag} label='Danh mục' value={categoryName} />
          <MetaItem
            icon={CalendarDays}
            label='Thuê tối thiểu'
            value={`${product.minRentalDays} ngày`}
          />
          {product.depositAmount && (
            <MetaItem
              icon={Wallet}
              label='Đặt cọc'
              value={formatter.format(product.depositAmount)}
            />
          )}
          {inv.length > 0 && (
            <MetaItem
              icon={Package}
              label='Kho'
              value={`${available}/${inv.length} sẵn sàng`}
            />
          )}
        </div>

        {/* Inventory quick stats */}
        {inv.length > 0 && (
          <div className='rounded-xl border border-gray-100 dark:border-white/8 bg-gray-50 dark:bg-white/3 px-5 py-4'>
            <p className='mb-3 text-xs font-medium text-text-sub uppercase tracking-wider'>
              Tình trạng kho
            </p>
            <div className='grid grid-cols-3 gap-2'>
              <MiniStat
                value={available}
                label='Sẵn sàng'
                colorCls='text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
              />
              <MiniStat
                value={rented}
                label='Đang thuê'
                colorCls='text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
              />
              <MiniStat
                value={maintenance}
                label='Bảo trì'
                colorCls='text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
              />
            </div>
          </div>
        )}

        {/* Colors */}
        {product.colors && product.colors.length > 0 && (
          <div>
            <p className='mb-2 text-xs font-medium text-text-sub uppercase tracking-wider'>
              Màu sắc
            </p>
            <div className='flex flex-wrap gap-2'>
              {product.colors.map((c) => (
                <div
                  key={c.value}
                  className='flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-white/8 bg-white dark:bg-white/5 px-3 py-1'
                >
                  <span
                    className='size-3.5 rounded-full border border-white shadow ring-1 ring-black/10'
                    style={{ backgroundColor: c.value }}
                  />
                  <span className='text-xs text-text-main'>{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
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

function MiniStat({
  value,
  label,
  colorCls,
}: {
  value: number;
  label: string;
  colorCls: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-lg py-2 px-1',
        colorCls,
      )}
    >
      <span className='text-xl font-bold'>{value}</span>
      <span className='text-xs opacity-80'>{label}</span>
    </div>
  );
}

// ─── Tab: Mô tả HTML ──────────────────────────────────────────────
function DescriptionTab({ description }: { description: string }) {
  return (
    <div
      className='rich-content max-w-none text-sm text-text-main leading-relaxed'
      dangerouslySetInnerHTML={{ __html: description }}
    />
  );
}

// ─── Tab: Kho thiết bị ───────────────────────────────────────────
function InventoryTab({ items }: { items: InventoryItem[] }) {
  if (items.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 dark:border-white/10 py-16 text-center'>
        <Package size={36} className='mb-3 text-text-sub/40' />
        <p className='text-sm font-medium text-text-main'>
          Chưa có thiết bị nào
        </p>
        <p className='mt-1 text-xs text-text-sub'>
          Hãy thêm serial trong trang chỉnh sửa sản phẩm
        </p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      {/* Summary row */}
      <div className='flex flex-wrap gap-2'>
        {(Object.keys(STATUS_META) as InventoryItemStatus[]).map((s) => {
          const count = items.filter((i) => i.status === s).length;
          if (count === 0) return null;
          const meta = STATUS_META[s];
          const Icon = meta.icon;
          return (
            <span
              key={s}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
                meta.bg,
                meta.border,
                meta.color,
              )}
            >
              <Icon size={12} />
              {count} {meta.label}
            </span>
          );
        })}
      </div>

      {/* Table */}
      <div className='overflow-hidden rounded-xl border border-gray-200 dark:border-white/8'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-gray-100 dark:border-white/8 bg-gray-50 dark:bg-white/3'>
              <th className='px-4 py-3 text-left text-xs font-semibold text-text-sub uppercase tracking-wider'>
                #
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold text-text-sub uppercase tracking-wider'>
                Số Serial
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold text-text-sub uppercase tracking-wider'>
                Trạng thái
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold text-text-sub uppercase tracking-wider'>
                Tình trạng
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold text-text-sub uppercase tracking-wider'>
                Ghi chú
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const meta = STATUS_META[item.status];
              const Icon = meta.icon;
              return (
                <tr
                  key={item.inventoryItemId}
                  className={cn(
                    'border-b border-gray-100 dark:border-white/8 last:border-0 transition-colors hover:bg-gray-50 dark:hover:bg-white/3',
                  )}
                >
                  <td className='px-4 py-3 text-xs text-text-sub'>{i + 1}</td>
                  <td className='px-4 py-3'>
                    <span className='font-mono text-sm font-medium text-text-main'>
                      {item.serialNumber}
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                        meta.bg,
                        meta.border,
                        meta.color,
                      )}
                    >
                      <Icon size={11} />
                      {meta.label}
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    <span className='rounded bg-gray-100 dark:bg-white/8 px-2 py-0.5 text-xs font-medium text-text-main'>
                      {GRADE_LABEL[item.conditionGrade] ?? item.conditionGrade}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-xs text-text-sub'>
                    {item.staffNote ? (
                      <span className='flex items-center gap-1.5'>
                        <StickyNote
                          size={12}
                          className='shrink-0 text-text-sub/60'
                        />
                        {item.staffNote}
                      </span>
                    ) : (
                      <span className='text-text-sub/40'>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
      {/* key resets tab state when product changes without needing useEffect */}
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
  product: Product;
  onClose: () => void;
  onEdit?: (product: Product) => void;
}) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const categoryName =
    categories.find((c) => c.categoryId === product.categoryId)?.name ??
    product.categoryId;
  const inventoryItems = product.inventoryItems ?? [];

  const tabs: {
    id: Tab;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[] = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutGrid },
    { id: 'description', label: 'Mô tả chi tiết', icon: FileText },
    {
      id: 'inventory',
      label: 'Kho thiết bị',
      icon: Layers,
      badge: inventoryItems.length,
    },
  ];

  return (
    <>
      {/* Panel — full-page feel */}
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
          {tabs.map(({ id, label, icon: Icon, badge }) => (
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
              {badge !== undefined && badge > 0 && (
                <span
                  className={cn(
                    'ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                    activeTab === id
                      ? 'bg-theme-primary-start/10 text-theme-primary-start'
                      : 'bg-gray-100 dark:bg-white/8 text-text-sub',
                  )}
                >
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div
          className='flex-1 overflow-y-auto px-6 py-6'
          style={{ maxHeight: 'calc(90vh - 130px)' }}
        >
          {activeTab === 'overview' && (
            <OverviewTab product={product} categoryName={categoryName} />
          )}
          {activeTab === 'description' && (
            <DescriptionTab description={product.description} />
          )}
          {activeTab === 'inventory' && <InventoryTab items={inventoryItems} />}
        </div>

        {/* ── Footer ── */}
        <div className='flex items-center justify-between border-t border-gray-100 dark:border-white/8 px-6 py-4'>
          <p className='text-xs text-text-sub'>
            {inventoryItems.length > 0
              ? `${inventoryItems.filter((i) => i.status === 'AVAILABLE').length} / ${inventoryItems.length} thiết bị sẵn sàng`
              : 'Chưa có thiết bị trong kho'}
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
