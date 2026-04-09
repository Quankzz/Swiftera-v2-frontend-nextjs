'use client';

import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/dashboard/ui/data-table';
import { ContactTicket, ContactTicketStatus } from '@/types/dashboard';
import { useContactTicketsQuery } from '@/hooks/api/use-contact-tickets';
import { TICKET_STATUSES } from '@/api/contact-tickets';
import { StatusBadge } from './status-dialog';
import { Pencil, User2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TicketsTableProps {
  onUpdateStatus: (ticket: ContactTicket) => void;
}

function StatusFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: ContactTicketStatus | '') => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ContactTicketStatus | '')}
      className='h-9 rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-3 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20 focus:border-theme-primary-start transition'
    >
      <option value=''>Tất cả trạng thái</option>
      {TICKET_STATUSES.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}

export function ContactTicketsTable({ onUpdateStatus }: TicketsTableProps) {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<ContactTicketStatus | ''>(
    '',
  );

  const { data, isLoading, isError } = useContactTicketsQuery({
    page,
    limit,
    status: statusFilter,
  });

  const columns = useMemo<ColumnDef<ContactTicket>[]>(
    () => [
      {
        accessorKey: 'subject',
        header: 'Tiêu đề',
        cell: ({ row }) => {
          const plainText = row.original.requestMessage
            .replace(/<[^>]*>/g, '')
            .trim();
          return (
            <div className='max-w-xs'>
              <p className='font-medium text-text-main truncate'>
                {row.original.subject}
              </p>
              <p className='text-xs text-text-sub mt-0.5 line-clamp-1'>
                {plainText}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: 'userFullName',
        header: 'Người gửi',
        cell: ({ row }) => {
          const { userFullName, userEmail } = row.original;
          if (!userFullName && !userEmail) {
            return (
              <span className='inline-flex items-center gap-1.5 text-xs text-text-sub'>
                <User2 size={13} />
                Khách ẩn danh
              </span>
            );
          }
          return (
            <div>
              <p className='text-sm font-medium text-text-main'>
                {userFullName ?? '—'}
              </p>
              {userEmail && (
                <p className='text-xs text-text-sub'>{userEmail}</p>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'rentalOrderId',
        header: 'Đơn hàng',
        cell: ({ row }) =>
          row.original.rentalOrderId ? (
            <span className='inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/8 px-2.5 py-0.5 text-xs text-text-main'>
              <Package size={11} />#{row.original.rentalOrderId}
            </span>
          ) : (
            <span className='text-xs text-text-sub'>—</span>
          ),
      },
      {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => (
          <StatusBadge status={row.original.status as ContactTicketStatus} />
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Ngày gửi',
        cell: ({ row }) => (
          <span className='text-xs text-text-sub whitespace-nowrap'>
            {new Date(row.original.createdAt).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className='flex justify-end'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onUpdateStatus(row.original)}
              className='flex items-center gap-1.5 border-gray-200 dark:border-white/8 text-text-sub hover:text-text-main dark:hover:bg-white/8 h-8 px-3 text-xs'
            >
              <Pencil size={12} />
              Cập nhật
            </Button>
          </div>
        ),
      },
    ],
    [onUpdateStatus],
  );

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <DataTable
      columns={columns}
      data={data?.data ?? []}
      isLoading={isLoading}
      isError={isError}
      errorMessage='Không thể tải danh sách phản hồi. Vui lòng thử lại.'
      emptyMessage='Chưa có phản hồi nào.'
      searchPlaceholder='Tìm theo tiêu đề, người gửi...'
      searchColumn='subject'
      totalLabel={`phản hồi`} //${data?.total ?? 0}
      manualPagination
      pageIndex={page}
      pageCount={totalPages}
      onPageChange={(p) => setPage(p + 1)}
      pageSize={limit}
      totalRows={data?.total}
      toolbarRight={
        <StatusFilter value={statusFilter} onChange={setStatusFilter} />
      }
    />
  );
}
