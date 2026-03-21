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
    color: 'text-success',
    bg: 'bg-success-muted',
    border: 'border-success-border',
    dot: 'bg-success',
    icon: CheckCircle2,
  },
  RENTED: {
    label: 'Đang cho thuê',
    color: 'text-info',
    bg: 'bg-info-muted',
    border: 'border-info-border',
    dot: 'bg-info',
    icon: Package,
  },
  MAINTENANCE: {
    label: 'Bảo trì',
    color: 'text-warning',
    bg: 'bg-warning-muted',
    border: 'border-warning-border',
    dot: 'bg-warning',
    icon: Wrench,
  },
};

const CONDITION_CONFIG: Record<
  ProductCondition,
  { label: string; color: string }
> = {
  EXCELLENT: { label: 'Xuất sắc', color: 'text-success' },
  GOOD: { label: 'Tốt', color: 'text-info' },
  FAIR: { label: 'Khá', color: 'text-warning' },
  POOR: { label: 'Kém', color: 'text-destructive' },
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
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/20 bg-card transition-all hover:border-border/40 hover:shadow-md">
      <div className="relative aspect-4/3 overflow-hidden bg-muted/40">
        <Image
          src={product.image_url}
          alt={product.product_name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-2.5 top-2.5">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur-sm',
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
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {product.category}
          </span>
        </div>
        <h3 className="mb-1 text-base font-bold text-foreground leading-tight line-clamp-2">
          {product.product_name}
        </h3>
        <p className="mb-4 font-mono text-xs text-muted-foreground">
          SN: {product.serial_number}
        </p>

        <div className="mt-auto space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Giá/ngày</span>
            <span className="text-base font-bold text-foreground">
              {formatCurrency(product.current_daily_price)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Đặt cọc</span>
            <span className="text-sm font-semibold text-foreground">
              {formatCurrency(product.deposit_amount)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-border/10 pt-2.5">
            <span className="text-sm text-muted-foreground">Tình trạng</span>
            <span className={cn('text-sm font-bold', conditionCfg.color)}>
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
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="relative size-11 shrink-0 overflow-hidden rounded-xl">
            <Image
              fill
              src={product.image_url}
              alt={product.product_name}
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              {product.product_name}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              SN: {product.serial_number}
            </p>
          </div>
        </div>
      </td>
      <td className="hidden px-4 py-3.5 md:table-cell">
        <span className="text-sm text-muted-foreground">
          {product.category}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold',
            statusCfg.bg,
            statusCfg.color,
            statusCfg.border,
          )}
        >
          <span className={cn('size-1.5 rounded-full', statusCfg.dot)} />
          {statusCfg.label}
        </span>
      </td>
      <td className="hidden px-4 py-3.5 sm:table-cell">
        <span className={cn('text-sm font-semibold', conditionCfg.color)}>
          {conditionCfg.label}
        </span>
      </td>
      <td className="hidden px-4 py-3.5 text-right lg:table-cell">
        <p className="text-sm font-bold text-foreground">
          {formatCurrency(product.current_daily_price)}
        </p>
        <p className="text-xs text-muted-foreground">/ ngày</p>
      </td>
      <td className="hidden px-4 py-3.5 text-right md:table-cell">
        <p className="text-sm text-muted-foreground">
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
      <div className="border-b border-border/15 bg-background/50 px-5 py-5 md:px-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên, serial number, danh mục..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10"
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
                  'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors whitespace-nowrap',
                  statusFilter === f.value
                    ? 'bg-theme-primary-start/15 text-theme-primary-start'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                )}
              >
                {f.label}
                <span
                  className={cn(
                    'rounded-full px-1.5 text-xs leading-4 font-bold',
                    statusFilter === f.value
                      ? 'bg-theme-primary-start/20 text-theme-primary-start'
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

          <div className="h-5 w-px bg-border/30 shrink-0" />

          {/* Category filter */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-semibold transition-colors whitespace-nowrap shrink-0',
                  categoryFilter === cat
                    ? 'bg-secondary text-foreground'
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
      <div className="flex-1 overflow-auto p-5 md:p-8">
        {filtered.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-3 text-muted-foreground">
            <Package className="size-10 opacity-40" />
            <p className="text-base">Không tìm thấy sản phẩm</p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.product_item_id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border/20 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/15 bg-muted/40">
                  <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Sản phẩm
                  </th>
                  <th className="hidden px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground md:table-cell">
                    Danh mục
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Trạng thái
                  </th>
                  <th className="hidden px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground sm:table-cell">
                    Tình trạng
                  </th>
                  <th className="hidden px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wide text-muted-foreground lg:table-cell">
                    Giá thuê
                  </th>
                  <th className="hidden px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wide text-muted-foreground md:table-cell">
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
