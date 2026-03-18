'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  FileText,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  User,
  Building2,
  Package,
  Camera,
  QrCode,
  PenLine,
  Zap,
  PartyPopper,
  Ban,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_CONTRACTS } from '@/data/mockDashboard';
import type { Contract, ContractStatus } from '@/types/dashboard.types';
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

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const STATUS_CONFIG: Record<
  ContractStatus,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ElementType;
  }
> = {
  DRAFT: {
    label: 'Bản nháp',
    color: 'text-slate-500',
    bg: 'bg-slate-100 dark:bg-slate-500/10',
    border: 'border-slate-200 dark:border-slate-500/20',
    icon: FileText,
  },
  SIGNED: {
    label: 'Đã ký',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    border: 'border-blue-200 dark:border-blue-500/20',
    icon: CheckCircle2,
  },
  ACTIVE: {
    label: 'Đang hiệu lực',
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-500/10',
    border: 'border-teal-200 dark:border-teal-500/20',
    icon: CheckCircle2,
  },
  COMPLETED: {
    label: 'Hoàn thành',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/20',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-500/10',
    border: 'border-red-200 dark:border-red-500/20',
    icon: XCircle,
  },
};

const STATUS_FILTERS: Array<{ value: ContractStatus | 'ALL'; label: string }> =
  [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'ACTIVE', label: 'Đang hiệu lực' },
    { value: 'SIGNED', label: 'Đã ký' },
    { value: 'COMPLETED', label: 'Hoàn thành' },
    { value: 'DRAFT', label: 'Bản nháp' },
    { value: 'CANCELLED', label: 'Đã hủy' },
  ];

function ContractDetailModal({
  contract,
  onClose,
  onStatusChange,
}: {
  contract: Contract;
  onClose: () => void;
  onStatusChange: (contractId: string, newStatus: ContractStatus) => void;
}) {
  const statusCfg = STATUS_CONFIG[contract.status];
  const totalPhotos = contract.items.reduce(
    (acc, item) => acc + item.photos.length,
    0,
  );

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
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Hợp đồng
            </p>
            <h2 className="text-lg font-bold text-foreground">
              {contract.contract_code}
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
              <span className="text-xs text-muted-foreground">
                Đơn: {contract.order_id}
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

        <div className="p-5 space-y-5">
          {/* Parties */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Bên A – Cho thuê
              </p>
              <div className="rounded-lg bg-muted/40 p-3 space-y-1 text-xs">
                <p className="font-semibold text-foreground">
                  {contract.hub.name}
                </p>
                <p className="text-muted-foreground">{contract.hub.address}</p>
                <p className="text-muted-foreground">{contract.hub.phone}</p>
                <p className="text-muted-foreground">
                  MST: {contract.hub.tax_code}
                </p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Bên B – Thuê
              </p>
              <div className="rounded-lg bg-muted/40 p-3 space-y-1 text-xs">
                <p className="font-semibold text-foreground">
                  {contract.renter.full_name}
                </p>
                <p className="text-muted-foreground">
                  CCCD: {contract.renter.cccd_number}
                </p>
                <p className="text-muted-foreground">{contract.renter.phone}</p>
                <p className="text-muted-foreground">
                  {contract.renter.address}
                </p>
              </div>
            </div>
          </div>

          {/* Staff */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Nhân viên phụ trách
            </p>
            <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
              {contract.staff.avatar_url ? (
                <div className="relative size-9 shrink-0 overflow-hidden rounded-full">
                  <Image
                    fill
                    src={contract.staff.avatar_url}
                    className="object-cover"
                    alt=""
                  />
                </div>
              ) : (
                <div className="flex size-9 items-center justify-center rounded-full bg-teal-500/10 text-teal-500 font-bold text-sm">
                  {contract.staff.full_name.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {contract.staff.full_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {contract.staff.email}
                </p>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="grid gap-3 rounded-lg bg-muted/40 p-4 md:grid-cols-3 text-xs">
            <div>
              <p className="text-muted-foreground">Ngày bắt đầu</p>
              <p className="font-semibold text-foreground mt-0.5">
                {formatDate(contract.start_date)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Ngày kết thúc</p>
              <p className="font-semibold text-foreground mt-0.5">
                {formatDate(contract.end_date)}
              </p>
            </div>
            {contract.signed_at && (
              <div>
                <p className="text-muted-foreground">Ngày ký</p>
                <p className="font-semibold text-foreground mt-0.5">
                  {formatDateTime(contract.signed_at)}
                </p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Phí thuê</p>
              <p className="font-semibold text-foreground mt-0.5">
                {formatCurrency(contract.total_rental_fee)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Đặt cọc</p>
              <p className="font-semibold text-foreground mt-0.5">
                {formatCurrency(contract.total_deposit)}
              </p>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Sản phẩm ({contract.items.length}) · {totalPhotos} ảnh minh chứng
            </p>
            <div className="space-y-2">
              {contract.items.map((item) => (
                <div
                  key={item.item_id}
                  className="rounded-lg border border-border/15 bg-muted/20 p-3"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        fill
                        src={item.image_url}
                        alt={item.product_name}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-foreground">
                        {item.product_name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        SN: {item.serial_number}
                      </p>
                    </div>
                  </div>
                  {item.photos.length > 0 && (
                    <div className="flex gap-1.5 overflow-x-auto">
                      {item.photos.map((photo) => (
                        <div
                          key={photo.id}
                          className="relative size-16 shrink-0 overflow-hidden rounded-lg"
                        >
                          <Image
                            fill
                            src={photo.url}
                            alt={photo.caption}
                            className="object-cover ring-1 ring-border/20"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {contract.notes && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Ghi chú
              </p>
              <p className="rounded-lg bg-muted/40 p-3 text-xs text-foreground">
                {contract.notes}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border/15 bg-muted/20 px-5 py-3.5">
          <p className="text-xs text-muted-foreground">
            Tạo: {formatDateTime(contract.created_at)}
          </p>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>
              Đóng
            </Button>
            {(contract.status === 'DRAFT' ||
              contract.status === 'SIGNED' ||
              contract.status === 'ACTIVE') && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 border-red-200 dark:border-red-500/30"
                onClick={() => {
                  onStatusChange(contract.contract_id, 'CANCELLED');
                  onClose();
                }}
              >
                <Ban className="size-3.5" />
                Hủy
              </Button>
            )}
            {contract.status === 'DRAFT' && (
              <Button
                size="sm"
                className="gap-1.5 bg-blue-500 hover:bg-blue-600 text-white border-0"
                onClick={() => {
                  onStatusChange(contract.contract_id, 'SIGNED');
                  onClose();
                }}
              >
                <PenLine className="size-3.5" />
                Ký hợp đồng
              </Button>
            )}
            {contract.status === 'SIGNED' && (
              <Button
                size="sm"
                className="gap-1.5 bg-teal-500 hover:bg-teal-600 text-white border-0"
                onClick={() => {
                  onStatusChange(contract.contract_id, 'ACTIVE');
                  onClose();
                }}
              >
                <Zap className="size-3.5" />
                Kích hoạt
              </Button>
            )}
            {contract.status === 'ACTIVE' && (
              <Button
                size="sm"
                className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                onClick={() => {
                  onStatusChange(contract.contract_id, 'COMPLETED');
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

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>(MOCK_CONTRACTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'ALL'>(
    'ALL',
  );
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null,
  );

  const handleStatusChange = (
    contractId: string,
    newStatus: ContractStatus,
  ) => {
    setContracts((prev) =>
      prev.map((c) =>
        c.contract_id === contractId ? { ...c, status: newStatus } : c,
      ),
    );
  };

  const filtered = useMemo(() => {
    return contracts.filter((c) => {
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        c.contract_code.toLowerCase().includes(q) ||
        c.renter.full_name.toLowerCase().includes(q) ||
        c.order_id.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [search, statusFilter, contracts]);

  const tabCounts = useMemo(
    () =>
      STATUS_FILTERS.reduce(
        (acc, tab) => {
          acc[tab.value] =
            tab.value === 'ALL'
              ? contracts.length
              : contracts.filter((c) => c.status === tab.value).length;
          return acc;
        },
        {} as Record<string, number>,
      ),
    [contracts],
  );

  return (
    <div className="flex h-full flex-col pb-16 lg:pb-0">
      {/* Toolbar */}
      <div className="border-b border-border/15 bg-background/50 px-6 py-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã hợp đồng, tên khách..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Link href="/dashboard/scanner" className="ml-auto">
            <Button
              size="sm"
              className="gap-2 shrink-0 bg-teal-500 hover:bg-teal-600 text-white border-0"
            >
              <QrCode className="size-3.5" />
              Tạo hợp đồng mới
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {STATUS_FILTERS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap',
                statusFilter === tab.value
                  ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
              )}
            >
              {tab.label}
              {tabCounts[tab.value] > 0 && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0 text-[10px] leading-4',
                    statusFilter === tab.value
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

      {/* Contract cards */}
      <div className="flex-1 overflow-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-3 text-muted-foreground">
            <FileText className="size-8 opacity-40" />
            <p className="text-sm">Chưa có hợp đồng nào</p>
            <Link href="/dashboard/scanner">
              <Button
                size="sm"
                className="gap-2 bg-teal-500 hover:bg-teal-600 text-white border-0"
              >
                <QrCode className="size-3.5" />
                Tạo hợp đồng từ QR
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((contract) => {
              const cfg = STATUS_CONFIG[contract.status];
              const StatusIcon = cfg.icon;
              const totalPhotos = contract.items.reduce(
                (a, i) => a + i.photos.length,
                0,
              );

              return (
                <div
                  key={contract.contract_id}
                  className="group flex items-start gap-4 rounded-xl border border-border/20 bg-card p-4 transition-all hover:border-border/40 hover:shadow-sm"
                >
                  {/* Icon */}
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/60">
                    <FileText className="size-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-mono text-sm font-bold text-foreground">
                          {contract.contract_code}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Đơn: {contract.order_id}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium shrink-0',
                          cfg.bg,
                          cfg.color,
                          cfg.border,
                        )}
                      >
                        <StatusIcon className="size-2.5" />
                        {cfg.label}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="size-3" />
                        {contract.renter.full_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="size-3" />
                        {contract.hub.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="size-3" />
                        {contract.items.length} sản phẩm
                      </span>
                      {totalPhotos > 0 && (
                        <span className="flex items-center gap-1 text-teal-500">
                          <Camera className="size-3" />
                          {totalPhotos} ảnh
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {formatDate(contract.start_date)} –{' '}
                        {formatDate(contract.end_date)}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-semibold text-foreground">
                          {formatCurrency(contract.total_rental_fee)}
                        </span>
                        <span className="text-muted-foreground">
                          Cọc: {formatCurrency(contract.total_deposit)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedContract(contract)}
                          className="gap-1.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="size-3" />
                          Xem chi tiết
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedContract && (
        <ContractDetailModal
          contract={selectedContract}
          onClose={() => setSelectedContract(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
