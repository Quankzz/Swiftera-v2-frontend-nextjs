'use client';

import { useMemo, useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/dashboard/ui/data-table';
import {
  useRentalOrdersQuery,
  useCompleteOrderMutation,
  useReportIssueMutation,
} from '@/features/rental-orders/hooks/use-rental-order-management';
import {
  STATUS_LABELS,
  STATUS_STYLES,
  STATUS_ORDER,
  type RentalOrderResponse,
  type RentalOrderStatus,
  type RentalOrderListParams,
} from '@/features/rental-orders/types';
import {
  Truck,
  MapPin,
  User2,
  ClipboardList,
  Calendar,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Status badge ──────────────────────────────────────────────────
function StatusBadge({ status }: { status: RentalOrderStatus }) {
  const s = STATUS_STYLES[status] ?? {
    dot: 'bg-gray-400',
    cls: 'text-gray-600 bg-gray-100 border-gray-200',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium whitespace-nowrap',
        s.cls,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', s.dot)} />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(v);
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ─── Toolbar ────────────────────────────────────────────────────────
function StatusFilter({
  statusFilter,
  onStatusChange,
}: {
  statusFilter: RentalOrderStatus | '';
  onStatusChange: (v: RentalOrderStatus | '') => void;
}) {
  return (
    <select
      value={statusFilter}
      onChange={(e) => onStatusChange(e.target.value as RentalOrderStatus | '')}
      className='h-9 rounded-lg border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-3 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20 focus:border-theme-primary-start transition'
    >
      <option value=''>Tất cả trạng thái</option>
      {STATUS_ORDER.map((status) => (
        <option key={status} value={status}>
          {STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
}

function SearchInput({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange: (v: string) => void;
}) {
  return (
    <div className='relative'>
      <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-sub pointer-events-none' />
      <input
        type='text'
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder='Tìm khách hàng, SĐT...'
        className='h-9 w-56 rounded-lg border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card pl-8 pr-3 text-sm text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20 focus:border-theme-primary-start transition'
      />
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────
interface OrdersTableProps {
  onAssign: (order: RentalOrderResponse) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Confirm Complete Dialog
// ─────────────────────────────────────────────────────────────────────────────

function ConfirmCompleteDialog({
  orderId,
  open,
  onOpenChange,
}: {
  orderId: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const completeMutation = useCompleteOrderMutation();

  const handleConfirm = () => {
    if (!orderId) return;
    completeMutation.mutate(orderId, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Xác nhận hoàn tất đơn thuê</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn hoàn tất đơn thuê này? Thao tác không thể hoàn
            tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            render={<Button variant='outline' />}
            disabled={completeMutation.isPending}
          >
            Hủy
          </DialogClose>
          <Button
            onClick={handleConfirm}
            disabled={completeMutation.isPending}
            className='bg-green-600 hover:bg-green-700 text-white'
          >
            {completeMutation.isPending && (
              <Loader2 className='w-4 h-4 animate-spin mr-1.5' />
            )}
            Xác nhận hoàn tất
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Report Issue Dialog
// ─────────────────────────────────────────────────────────────────────────────

function ReportIssueDialog({
  orderId,
  open,
  onOpenChange,
}: {
  orderId: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [issueNote, setIssueNote] = useState('');
  const reportIssueMutation = useReportIssueMutation();

  const handleConfirm = () => {
    if (!orderId) return;
    if (!issueNote.trim()) {
      toast.warning('Vui lòng nhập ghi chú sự cố.');
      return;
    }
    reportIssueMutation.mutate(
      {
        rentalOrderId: orderId,
        payload: { status: 'PENDING_PICKUP', issueNote: issueNote.trim() },
      },
      {
        onSuccess: () => {
          setIssueNote('');
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setIssueNote('');
        onOpenChange(v);
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Thu hồi sớm do sự cố</DialogTitle>
          <DialogDescription>
            Ghi chú sự cố để chuyển đơn sang trạng thái chờ thu hồi.
          </DialogDescription>
        </DialogHeader>
        <div className='py-2'>
          <label
            htmlFor='issue-note'
            className='block text-sm font-medium text-foreground mb-1.5'
          >
            Ghi chú sự cố <span className='text-red-500'>*</span>
          </label>
          <textarea
            id='issue-note'
            value={issueNote}
            onChange={(e) => setIssueNote(e.target.value)}
            placeholder='Mô tả sự cố cần thu hồi...'
            rows={3}
            className='w-full rounded-lg border border-gray-200 dark:border-white/12 bg-white dark:bg-surface-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition resize-none'
          />
        </div>
        <DialogFooter>
          <DialogClose
            render={<Button variant='outline' />}
            disabled={reportIssueMutation.isPending}
          >
            Hủy
          </DialogClose>
          <Button
            onClick={handleConfirm}
            disabled={reportIssueMutation.isPending || !issueNote.trim()}
            className='bg-amber-600 hover:bg-amber-700 text-white'
          >
            {reportIssueMutation.isPending && (
              <Loader2 className='w-4 h-4 animate-spin mr-1.5' />
            )}
            Xác nhận thu hồi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export function RentalOrdersTable({ onAssign }: OrdersTableProps) {
  const [page, setPage] = useState(0); // 0-based cho DataTable UI; gửi page+1 lên BE
  const [size] = useState(10);
  const [statusFilter, setStatusFilter] = useState<RentalOrderStatus | ''>('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Dialog state
  const [completeOrderId, setCompleteOrderId] = useState<string | null>(null);
  const [reportIssueOrderId, setReportIssueOrderId] = useState<string | null>(
    null,
  );

  // Debounce 400ms — chờ user ngừng gõ mới gọi API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Build SpringFilter DSL — dùng ~~ cho LIKE/contains
  const filter = useMemo(() => {
    const parts: string[] = [];
    if (statusFilter) parts.push(`status:'${statusFilter}'`);
    if (debouncedSearch.trim()) {
      const term = debouncedSearch.trim();
      parts.push(
        `(userAddress.recipientName~~'*${term}*' or userAddress.phoneNumber~~'*${term}*')`,
      );
    }
    return parts.length ? parts.join(' and ') : undefined;
  }, [statusFilter, debouncedSearch]);

  const params: RentalOrderListParams = {
    page: page + 1, // BE expects 1-based
    size,
    sort: 'placedAt,desc',
    ...(filter ? { filter } : {}),
  };

  const { data, isLoading, isError } = useRentalOrdersQuery(params);

  const orders = data?.content ?? [];
  const totalPages = data?.meta ? Math.ceil(data.meta.totalElements / size) : 1;

  const handleStatusChange = (v: RentalOrderStatus | '') => {
    setStatusFilter(v);
    setPage(0);
  };

  const handleSearchChange = (v: string) => {
    setSearch(v);
    // page reset handled by debounce effect
  };

  const columns = useMemo<ColumnDef<RentalOrderResponse>[]>(
    () => [
      // Mã đơn + ngày đặt
      {
        accessorKey: 'rentalOrderId',
        header: 'Đơn hàng',
        cell: ({ row }) => (
          <div className='min-w-28'>
            <div className='flex items-center gap-1.5 mb-1'>
              <ClipboardList className='w-3.5 h-3.5 text-blue-500 shrink-0' />
              <span className='font-mono text-xs font-semibold text-gray-800 dark:text-gray-200 tracking-tight'>
                {row.original.rentalOrderId.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <p className='text-xs text-gray-400 dark:text-gray-500'>
              {formatDate(row.original.placedAt)}
            </p>
          </div>
        ),
      },
      // Khách hàng
      {
        id: 'customer',
        header: 'Khách hàng',
        cell: ({ row }) => {
          const addr = row.original.userAddress;
          const name = addr?.recipientName ?? '';
          const phone = addr?.phoneNumber ?? '';
          return (
            <div className='flex items-center gap-2.5 min-w-40'>
              <div className='w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0'>
                {name.charAt(0).toUpperCase() || '?'}
              </div>
              <div className='min-w-0'>
                <p className='font-medium text-sm text-gray-800 dark:text-gray-200 truncate'>
                  {name || <span className='italic text-gray-400'>—</span>}
                </p>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  {phone || '—'}
                </p>
              </div>
            </div>
          );
        },
      },
      // Địa chỉ giao
      {
        id: 'address',
        header: 'Địa chỉ giao',
        cell: ({ row }) => {
          const addr = row.original.userAddress;
          return (
            <div className='flex items-start gap-1.5 min-w-35 max-w-50'>
              <MapPin className='w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0' />
              <div className='min-w-0'>
                <p className='text-xs text-gray-700 dark:text-gray-300 line-clamp-1'>
                  {addr?.addressLine || '—'}
                </p>
                <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>
                  {[addr?.district, addr?.city].filter(Boolean).join(', ') ||
                    '—'}
                </p>
              </div>
            </div>
          );
        },
      },
      // Ngày dự kiến giao & kết thúc
      {
        accessorKey: 'expectedDeliveryDate',
        header: 'Ngày thuê',
        cell: ({ row }) => (
          <div className='min-w-28'>
            <div className='flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300 font-medium'>
              <Calendar className='w-3 h-3 text-gray-400' />
              {formatDate(row.original.expectedDeliveryDate)}
            </div>
            <p className='text-xs text-gray-400 mt-0.5 pl-4'>
              → {formatDate(row.original.expectedRentalEndDate)}
            </p>
          </div>
        ),
      },
      // Thanh toán
      {
        accessorKey: 'totalPayableAmount',
        header: 'Thanh toán',
        cell: ({ row }) => (
          <div className='min-w-30'>
            <p className='font-semibold text-sm text-gray-800 dark:text-gray-100'>
              {formatCurrency(row.original.totalPayableAmount)}
            </p>
            <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>
              Cọc: {formatCurrency(row.original.depositHoldAmount)}
            </p>
          </div>
        ),
      },
      // Hub / Nhân viên
      {
        id: 'hub',
        header: 'Hub / Nhân viên',
        cell: ({ row }) => {
          const { hubCode, hubName, deliveryStaff, pickupStaff } = row.original;
          if (!hubName) {
            return (
              <span className='inline-flex items-center gap-1 text-xs text-gray-400 italic'>
                <span className='w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600' />
                Chưa gán
              </span>
            );
          }
          return (
            <div className='min-w-35'>
              <div className='flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400'>
                <MapPin className='w-3 h-3 shrink-0' />
                <span className='line-clamp-1'>
                  {hubCode ? `[${hubCode}] ` : ''}
                  {hubName}
                </span>
              </div>
              {deliveryStaff && (
                <div className='flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                  <User2 className='w-3 h-3 shrink-0' />
                  <span>
                    <span className='text-cyan-600'>Giao</span>
                    {pickupStaff ? (
                      <span className='text-purple-600'>
                        {' '}
                        <span className='text-gray-500 dark:text-gray-400'>
                          {' '}
                          +{' '}
                        </span>{' '}
                        Thu hồi
                      </span>
                    ) : (
                      ''
                    )}
                  </span>
                </div>
              )}
            </div>
          );
        },
      },
      // Trạng thái
      {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      // Actions
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const status = row.original.status;
          const canAssign = status === 'PAID' || status === 'PREPARING';
          const canComplete = status === 'PICKED_UP';
          const canReportIssue = status === 'DELIVERED' || status === 'IN_USE';

          return (
            <div className='flex items-center gap-1.5'>
              {/* Gán đơn / Xem */}
              <Button
                size='sm'
                variant={canAssign ? 'default' : 'ghost'}
                onClick={() => onAssign(row.original)}
                className={cn(
                  'flex items-center gap-1.5 text-xs h-8 px-3 whitespace-nowrap',
                  !canAssign &&
                    'text-text-sub border border-gray-200 dark:border-white/8',
                )}
              >
                <Truck className='w-3.5 h-3.5' />
                {canAssign ? 'Gán đơn' : 'Xem'}
              </Button>

              {/* Hoàn tất đơn hàng — chỉ khi PICKED_UP */}
              {canComplete && (
                <Button
                  size='sm'
                  variant='default'
                  onClick={() => setCompleteOrderId(row.original.rentalOrderId)}
                  className='flex items-center gap-1.5 text-xs h-8 px-3 whitespace-nowrap bg-green-600 hover:bg-green-700'
                >
                  <CheckCircle2 className='w-3.5 h-3.5' />
                  Hoàn tất
                </Button>
              )}

              {/* Thu hồi sớm do sự cố — DELIVERED/IN_USE, ADMIN */}
              {canReportIssue && (
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() =>
                    setReportIssueOrderId(row.original.rentalOrderId)
                  }
                  className='flex items-center gap-1.5 text-xs h-8 px-3 whitespace-nowrap text-amber-700 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-500/40 dark:hover:bg-amber-900/20'
                >
                  <AlertTriangle className='w-3.5 h-3.5' />
                  Thu hồi
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [onAssign, setCompleteOrderId, setReportIssueOrderId],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        isError={isError}
        errorMessage='Không thể tải danh sách đơn thuê. Vui lòng thử lại.'
        emptyMessage='Chưa có đơn thuê nào.'
        totalLabel='đơn thuê'
        manualPagination
        pageIndex={page}
        pageCount={totalPages}
        onPageChange={(p) => setPage(p)}
        pageSize={size}
        totalRows={data?.meta?.totalElements}
        toolbarLeft={
          <SearchInput search={search} onSearchChange={handleSearchChange} />
        }
        toolbarRight={
          <StatusFilter
            statusFilter={statusFilter}
            onStatusChange={handleStatusChange}
          />
        }
      />

      {/* Confirm Complete Dialog */}
      <ConfirmCompleteDialog
        orderId={completeOrderId}
        open={!!completeOrderId}
        onOpenChange={(v) => {
          if (!v) setCompleteOrderId(null);
        }}
      />

      {/* Report Issue Dialog */}
      <ReportIssueDialog
        orderId={reportIssueOrderId}
        open={!!reportIssueOrderId}
        onOpenChange={(v) => {
          if (!v) setReportIssueOrderId(null);
        }}
      />
    </>
  );
}
