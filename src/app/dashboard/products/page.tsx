'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Search,
  Package,
  CheckCircle2,
  Wrench,
  LayoutGrid,
  LayoutList,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_PRODUCTS } from '@/data/mockDashboard';
import type {
  DashboardProduct,
  ProductStatus,
  ProductCondition,
} from '@/types/dashboard.types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    v,
  );

const STATUS_CONFIG: Record<
  ProductStatus,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    dot: string;
    icon: React.ElementType;
  }
> = {
  AVAILABLE: {
    label: 'Sẵn sàng',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/20',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  RENTED: {
    label: 'Đang cho thuê',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    border: 'border-blue-200 dark:border-blue-500/20',
    dot: 'bg-blue-500',
    icon: Package,
  },
  MAINTENANCE: {
    label: 'Bảo trì',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/20',
    dot: 'bg-amber-500',
    icon: Wrench,
  },
};

const CONDITION_CONFIG: Record<
  ProductCondition,
  { label: string; color: string }
> = {
  EXCELLENT: { label: 'Xuất sắc', color: 'text-emerald-500' },
  GOOD: { label: 'Tốt', color: 'text-teal-500' },
  FAIR: { label: 'Khá', color: 'text-amber-500' },
  POOR: { label: 'Kém', color: 'text-red-500' },
};

const STATUS_FILTERS: Array<{ value: ProductStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'AVAILABLE', label: 'Sẵn sàng' },
  { value: 'RENTED', label: 'Đang thuê' },
  { value: 'MAINTENANCE', label: 'Bảo trì' },
];

const CATEGORIES = [
  'Tất cả',
  ...Array.from(new Set(MOCK_PRODUCTS.map((p) => p.category))),
];

function ProductCard({ product }: { product: DashboardProduct }) {
  const statusCfg = STATUS_CONFIG[product.status];
  const conditionCfg = CONDITION_CONFIG[product.condition];

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border/20 bg-card transition-all hover:border-border/40 hover:shadow-md">
      <div className="relative aspect-4/3 overflow-hidden bg-muted/40">
        <Image
          src={product.image_url}
          alt={product.product_name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm',
              statusCfg.bg,
              statusCfg.color,
              statusCfg.border,
            )}
          >
            <span className={cn('size-1.5 rounded-full', statusCfg.dot)} />
            {statusCfg.label}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {product.category}
          </span>
        </div>
        <h3 className="mb-0.5 text-sm font-semibold text-foreground leading-tight line-clamp-2">
          {product.product_name}
        </h3>
        <p className="mb-3 font-mono text-[10px] text-muted-foreground">
          SN: {product.serial_number}
        </p>

        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Giá/ngày</span>
            <span className="text-sm font-bold text-foreground">
              {formatCurrency(product.current_daily_price)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Đặt cọc</span>
            <span className="text-xs font-medium text-foreground">
              {formatCurrency(product.deposit_amount)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-border/10 pt-2">
            <span className="text-xs text-muted-foreground">Tình trạng</span>
            <span className={cn('text-xs font-semibold', conditionCfg.color)}>
              {conditionCfg.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductRow({ product }: { product: DashboardProduct }) {
  const statusCfg = STATUS_CONFIG[product.status];
  const conditionCfg = CONDITION_CONFIG[product.condition];

  return (
    <tr className="border-b border-border/10 transition-colors hover:bg-muted/20">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-lg">
            <Image
              fill
              src={product.image_url}
              alt={product.product_name}
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">
              {product.product_name}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">
              SN: {product.serial_number}
            </p>
          </div>
        </div>
      </td>
      <td className="hidden px-4 py-3 md:table-cell">
        <span className="text-xs text-muted-foreground">
          {product.category}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium',
            statusCfg.bg,
            statusCfg.color,
            statusCfg.border,
          )}
        >
          <span className={cn('size-1.5 rounded-full', statusCfg.dot)} />
          {statusCfg.label}
        </span>
      </td>
      <td className="hidden px-4 py-3 sm:table-cell">
        <span className={cn('text-xs font-medium', conditionCfg.color)}>
          {conditionCfg.label}
        </span>
      </td>
      <td className="hidden px-4 py-3 text-right lg:table-cell">
        <p className="text-xs font-semibold text-foreground">
          {formatCurrency(product.current_daily_price)}
        </p>
        <p className="text-[10px] text-muted-foreground">/ ngày</p>
      </td>
      <td className="hidden px-4 py-3 text-right md:table-cell">
        <p className="text-xs text-muted-foreground">
          {formatCurrency(product.deposit_amount)}
        </p>
      </td>
    </tr>
  );
}

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'ALL'>(
    'ALL',
  );
  const [categoryFilter, setCategoryFilter] = useState('Tất cả');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const filtered = useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => {
      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const matchCategory =
        categoryFilter === 'Tất cả' || p.category === categoryFilter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.product_name.toLowerCase().includes(q) ||
        p.serial_number.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchStatus && matchCategory && matchSearch;
    });
  }, [search, statusFilter, categoryFilter]);

  const counts = useMemo(
    () => ({
      total: MOCK_PRODUCTS.length,
      AVAILABLE: MOCK_PRODUCTS.filter((p) => p.status === 'AVAILABLE').length,
      RENTED: MOCK_PRODUCTS.filter((p) => p.status === 'RENTED').length,
      MAINTENANCE: MOCK_PRODUCTS.filter((p) => p.status === 'MAINTENANCE')
        .length,
    }),
    [],
  );

  return (
    <div className="flex h-full flex-col pb-16 lg:pb-0">
      {/* Toolbar */}
      <div className="border-b border-border/15 bg-background/50 px-6 py-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên, serial number, danh mục..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <Button
              variant={view === 'grid' ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={() => setView('grid')}
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={() => setView('list')}
            >
              <LayoutList className="size-4" />
            </Button>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-3 overflow-x-auto pb-0.5">
          {/* Status tabs */}
          <div className="flex items-center gap-1 shrink-0">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap',
                  statusFilter === f.value
                    ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                )}
              >
                {f.label}
                <span
                  className={cn(
                    'rounded-full px-1.5 text-[10px] leading-4',
                    statusFilter === f.value
                      ? 'bg-teal-500/20 text-teal-600 dark:text-teal-400'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {f.value === 'ALL'
                    ? counts.total
                    : (counts[f.value as ProductStatus] ?? 0)}
                </span>
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-border/30 shrink-0" />

          {/* Category filter */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0',
                  categoryFilter === cat
                    ? 'bg-slate-200 dark:bg-slate-700 text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
            <Package className="size-8 opacity-40" />
            <p className="text-sm">Không tìm thấy sản phẩm</p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.product_item_id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border/20 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/15 bg-muted/40">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Sản phẩm
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground md:table-cell">
                    Danh mục
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Trạng thái
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:table-cell">
                    Tình trạng
                  </th>
                  <th className="hidden px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:table-cell">
                    Giá thuê
                  </th>
                  <th className="hidden px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground md:table-cell">
                    Đặt cọc
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <ProductRow key={product.product_item_id} product={product} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
