'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  QrCode,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Phone,
  Mail,
  Calendar,
  Package,
  ThumbsUp,
  Ban,
  PartyPopper,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_ORDERS } from '@/data/mockDashboard';
import type { DashboardOrder, OrderStatus } from '@/types/dashboard.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    v,
  );

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ElementType;
  }
> = {
  PENDING: {
    label: 'Chờ xử lý',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/20',
    icon: Clock,
  },
  ACTIVE: {
    label: 'Đang thuê',
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-500/10',
    border: 'border-teal-200 dark:border-teal-500/20',
    icon: CheckCircle2,
  },
  COMPLETED: {
    label: 'Hoàn thành',
    color: 'text-slate-500',
    bg: 'bg-slate-100 dark:bg-slate-500/10',
    border: 'border-slate-200 dark:border-slate-500/20',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-500/10',
    border: 'border-red-200 dark:border-red-500/20',
    icon: XCircle,
  },
  OVERDUE: {
    label: 'Quá hạn',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-500/10',
    border: 'border-red-200 dark:border-red-500/20',
    icon: AlertCircle,
  },
};

const PAYMENT_CONFIG = {
  PAID: {
    label: 'Đã thanh toán',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/20',
  },
  PENDING: {
    label: 'Chờ thanh toán',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/20',
  },
  PARTIAL: {
    label: 'Thanh toán một phần',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    border: 'border-blue-200 dark:border-blue-500/20',
  },
};

const STATUS_TABS: { value: OrderStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ xử lý' },
  { value: 'ACTIVE', label: 'Đang thuê' },
  { value: 'OVERDUE', label: 'Quá hạn' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
}: {
  order: DashboardOrder;
  onClose: () => void;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}) {
  const statusCfg = STATUS_CONFIG[order.status];
  const paymentCfg = PAYMENT_CONFIG[order.payment_status];

  const daysRemaining = () => {
    const end = new Date(order.end_date);
    const now = new Date();
    const diff = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-border/20 bg-background shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/15 bg-muted/30 p-5">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              Đơn hàng
            </p>
            <h2 className="text-lg font-bold text-foreground">
              {order.order_code}
            </h2>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                  statusCfg.bg,
                  statusCfg.color,
                  statusCfg.border,
                )}
              >
                <statusCfg.icon className="size-3" />
                {statusCfg.label}
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                  paymentCfg.bg,
                  paymentCfg.color,
                  paymentCfg.border,
                )}
              >
                {paymentCfg.label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <XCircle className="size-5" />
          </button>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          {/* Renter info */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Thông tin khách thuê
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-foreground overflow-hidden">
                  {order.renter.avatar_url ? (
                    <Image
                      src={order.renter.avatar_url}
                      className="object-cover"
                      alt=""
                      fill
                    />
                  ) : (
                    order.renter.full_name.charAt(0)
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {order.renter.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    CCCD: {order.renter.cccd_number}
                  </p>
                </div>
              </div>
              <div className="rounded-lg bg-muted/40 p-3 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="size-3.5 shrink-0" />
                  <span>{order.renter.phone_number}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-3.5 shrink-0" />
                  <span>{order.renter.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rental period */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Thời gian thuê
            </p>
            <div className="rounded-lg bg-muted/40 p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày bắt đầu</span>
                <span className="font-medium text-foreground">
                  {formatDate(order.start_date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày kết thúc</span>
                <span className="font-medium text-foreground">
                  {formatDate(order.end_date)}
                </span>
              </div>
              <div className="flex justify-between border-t border-border/15 pt-2">
                <span className="text-muted-foreground">
                  {order.status === 'OVERDUE' ? 'Quá hạn' : 'Còn lại'}
                </span>
                <span
                  className={cn(
                    'font-semibold',
                    order.status === 'OVERDUE'
                      ? 'text-red-500'
                      : 'text-teal-500',
                  )}
                >
                  {Math.abs(daysRemaining())} ngày
                </span>
              </div>
            </div>
            <div className="mt-2 rounded-lg bg-muted/40 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phí thuê</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(order.total_rental_fee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Đặt cọc</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(order.total_deposit)}
                </span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="md:col-span-2">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Sản phẩm thuê ({order.items.length})
            </p>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.item_id}
                  className="flex items-center gap-3 rounded-lg border border-border/15 bg-muted/20 p-3"
                >
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={item.image_url}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      SN: {item.serial_number}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.category}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(item.daily_price)}/ngày
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Cọc: {formatCurrency(item.deposit_amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {order.notes && (
            <div className="md:col-span-2">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Ghi chú
              </p>
              <p className="rounded-lg bg-muted/40 p-3 text-xs text-foreground">
                {order.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-border/15 bg-muted/20 px-5 py-3.5">
          <p className="text-xs text-muted-foreground">
            Tạo lúc: {formatDate(order.created_at)}
          </p>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>
              Đóng
            </Button>
            {order.status === 'PENDING' && (
              <Link href="/dashboard/scanner">
                <Button size="sm" variant="outline" className="gap-1.5">
                  <QrCode className="size-3.5" />
                  Quét QR
                </Button>
              </Link>
            )}
            {order.status === 'PENDING' && (
              <Button
                size="sm"
                className="gap-1.5 bg-red-500 hover:bg-red-600 text-white border-0"
                onClick={() => {
                  onStatusChange(order.rental_order_id, 'CANCELLED');
                  onClose();
                }}
              >
                <Ban className="size-3.5" />
                Hủy đơn
              </Button>
            )}
            {order.status === 'PENDING' && (
              <Button
                size="sm"
                className="gap-1.5 bg-teal-500 hover:bg-teal-600 text-white border-0"
                onClick={() => {
                  onStatusChange(order.rental_order_id, 'ACTIVE');
                  onClose();
                }}
              >
                <ThumbsUp className="size-3.5" />
                Xác nhận thuê
              </Button>
            )}
            {(order.status === 'ACTIVE' || order.status === 'OVERDUE') && (
              <Button
                size="sm"
                className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                onClick={() => {
                  onStatusChange(order.rental_order_id, 'COMPLETED');
                  onClose();
                }}
              >
                <PartyPopper className="size-3.5" />
                Hoàn thành
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<DashboardOrder[]>(MOCK_ORDERS);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<OrderStatus | 'ALL'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<DashboardOrder | null>(
    null,
  );

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.rental_order_id === orderId ? { ...o, status: newStatus } : o,
      ),
    );
  };

  const filtered = useMemo(() => {
    const q = search?.toLowerCase().trim() || '';

    return orders.filter((order) => {
      const matchStatus = activeTab === 'ALL' || order.status === activeTab;

      const matchSearch =
        !q ||
        order.order_code?.toLowerCase().includes(q) ||
        order.renter?.full_name?.toLowerCase().includes(q) ||
        order.renter?.phone_number?.includes(q) ||
        order.items?.some((i) => i.product_name?.toLowerCase().includes(q));

      return matchStatus && matchSearch;
    });
  }, [orders, search, activeTab]);

  const tabCounts = useMemo(
    () =>
      STATUS_TABS.reduce(
        (acc, tab) => {
          acc[tab.value] =
            tab.value === 'ALL'
              ? orders.length
              : orders.filter((o) => o.status === tab.value).length;
          return acc;
        },
        {} as Record<string, number>,
      ),
    [orders],
  );

  return (
    <div className="flex h-full flex-col pb-16 lg:pb-0">
      {/* Toolbar */}
      <div className="border-b border-border/15 bg-background/50 px-6 py-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã đơn, tên khách, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Link href="/dashboard/scanner">
            <Button
              size="sm"
              className="gap-2 shrink-0 bg-teal-500 hover:bg-teal-600 text-white border-0"
            >
              <QrCode className="size-3.5" />
              Quét QR
            </Button>
          </Link>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap',
                activeTab === tab.value
                  ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
              )}
            >
              {tab.label}
              {tabCounts[tab.value] > 0 && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0 text-[10px] leading-4',
                    activeTab === tab.value
                      ? 'bg-teal-500/20 text-teal-600 dark:text-teal-400'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {tabCounts[tab.value]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {filtered.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
            <Package className="size-8 opacity-40" />
            <p className="text-sm">Không tìm thấy đơn hàng</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border/20 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/15 bg-muted/40">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Mã đơn
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Khách thuê
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground md:table-cell">
                    Sản phẩm
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:table-cell">
                    Thời gian thuê
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Trạng thái
                  </th>
                  <th className="hidden px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:table-cell">
                    Phí thuê
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {filtered.map((order) => {
                  const cfg = STATUS_CONFIG[order.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <tr
                      key={order.rental_order_id}
                      className={cn(
                        'transition-colors hover:bg-muted/20',
                        order.status === 'OVERDUE' && 'bg-red-500/3',
                      )}
                    >
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs font-medium text-foreground">
                          {order.order_code}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(order.created_at).toLocaleDateString(
                            'vi-VN',
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground overflow-hidden">
                            {order.renter.avatar_url ? (
                              <Image
                                src={order.renter.avatar_url}
                                className="object-cover"
                                alt=""
                                fill
                              />
                            ) : (
                              order.renter.full_name.charAt(0)
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground truncate max-w-30">
                              {order.renter.full_name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {order.renter.phone_number}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <p className="text-xs text-foreground">
                          {order.items[0].product_name}
                          {order.items.length > 1 && (
                            <span className="ml-1 rounded bg-muted px-1 py-0.5 text-[10px] text-muted-foreground">
                              +{order.items.length - 1}
                            </span>
                          )}
                        </p>
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="size-3" />
                          <span>
                            {formatDate(order.start_date)} –{' '}
                            {formatDate(order.end_date)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium',
                            cfg.bg,
                            cfg.color,
                            cfg.border,
                          )}
                        >
                          <StatusIcon className="size-2.5" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-right sm:table-cell">
                        <p className="text-xs font-semibold text-foreground">
                          {formatCurrency(order.total_rental_fee)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Cọc: {formatCurrency(order.total_deposit)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="size-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
