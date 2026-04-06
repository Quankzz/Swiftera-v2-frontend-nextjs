'use client';

/**
 * TicketListTable — Admin table for contact tickets
 *
 * Props:
 *   onView(ticket) — open detail modal
 */

import { useState } from 'react';
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useTickets } from '../hooks/useTickets';
import { TICKET_STATUS_LABELS, TICKET_STATUS_STYLES } from '../types';
import type { ContactTicketResponse, ContactTicketStatus } from '../types';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ContactTicketStatus }) {
  const s = TICKET_STATUS_STYLES[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
        s.badge,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />
      {TICKET_STATUS_LABELS[status]}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter tabs
// ─────────────────────────────────────────────────────────────────────────────

const FILTER_TABS: { label: string; value: ContactTicketStatus | 'ALL' }[] = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Mở', value: 'OPEN' },
  { label: 'Đang xử lý', value: 'IN_PROGRESS' },
  { label: 'Đã phản hồi', value: 'REPLIED' },
  { label: 'Đã giải quyết', value: 'RESOLVED' },
  { label: 'Đã đóng', value: 'CLOSED' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

interface TicketListTableProps {
  onView: (ticket: ContactTicketResponse) => void;
}

const PAGE_SIZE = 15;

export function TicketListTable({ onView }: TicketListTableProps) {
  const [activeStatus, setActiveStatus] = useState<ContactTicketStatus | 'ALL'>(
    'ALL',
  );
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useTickets({
    page,
    size: PAGE_SIZE,
    status: activeStatus === 'ALL' ? undefined : activeStatus,
    sort: 'createdAt,desc',
  });

  const tickets = data?.content ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 0;

  // Reset to page 0 when switching filters
  const handleStatusChange = (s: ContactTicketStatus | 'ALL') => {
    setActiveStatus(s);
    setPage(0);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className='flex flex-col gap-0 rounded-xl border border-gray-100 dark:border-white/8 bg-white dark:bg-black/20 overflow-hidden'>
      {/* Filter tabs */}
      <div className='flex items-center gap-1 px-4 pt-4 pb-2 border-b border-gray-100 dark:border-white/8 overflow-x-auto'>
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleStatusChange(tab.value)}
            className={cn(
              'shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
              activeStatus === tab.value
                ? 'bg-theme-primary-start text-white'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table wrapper */}
      <div className='overflow-x-auto'>
        <table className='w-full text-sm text-left'>
          <thead>
            <tr className='border-b border-gray-100 dark:border-white/8 bg-gray-50/60 dark:bg-white/3'>
              <th className='px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap'>
                Mã ticket
              </th>
              <th className='px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
                Tiêu đề
              </th>
              <th className='px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap'>
                Khách hàng
              </th>
              <th className='px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap'>
                Trạng thái
              </th>
              <th className='px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap'>
                Ngày tạo
              </th>
              <th className='px-4 py-3' />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className='px-4 py-12 text-center'>
                  <Loader2
                    size={20}
                    className='animate-spin text-gray-400 mx-auto'
                  />
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={6} className='px-4 py-12 text-center'>
                  <div className='flex flex-col items-center gap-2 text-gray-400'>
                    <AlertCircle size={20} />
                    <p className='text-sm'>Không thể tải dữ liệu</p>
                  </div>
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className='px-4 py-12 text-center text-sm text-gray-400'
                >
                  Không có ticket nào
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <TicketRow
                  key={ticket.contactTicketId}
                  ticket={ticket}
                  onView={onView}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-white/8'>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            Trang {(meta?.currentPage ?? 0) + 1} / {totalPages}
            {meta && <> &middot; {meta.totalElements} ticket</>}
          </p>
          <div className='flex items-center gap-1'>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/8 disabled:opacity-40 disabled:cursor-not-allowed'
            >
              <ChevronLeft
                size={16}
                className='text-gray-600 dark:text-gray-400'
              />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/8 disabled:opacity-40 disabled:cursor-not-allowed'
            >
              <ChevronRight
                size={16}
                className='text-gray-600 dark:text-gray-400'
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Row sub-component
// ─────────────────────────────────────────────────────────────────────────────

function TicketRow({
  ticket,
  onView,
}: {
  ticket: ContactTicketResponse;
  onView: (ticket: ContactTicketResponse) => void;
}) {
  const shortId = ticket.contactTicketId.slice(0, 8).toUpperCase();
  const date = new Date(ticket.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <tr className='border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/60 dark:hover:bg-white/3 transition-colors'>
      {/* Ticket ID */}
      <td className='px-4 py-3 whitespace-nowrap'>
        <span className='font-mono text-xs text-gray-500 dark:text-gray-400'>
          #{shortId}
        </span>
      </td>

      {/* Subject */}
      <td className='px-4 py-3 max-w-xs'>
        <p className='truncate text-sm font-medium text-gray-900 dark:text-white'>
          {ticket.subject}
        </p>
      </td>

      {/* Customer */}
      <td className='px-4 py-3 whitespace-nowrap'>
        <p className='text-sm text-gray-700 dark:text-gray-300'>
          {ticket.fullName ?? '—'}
        </p>
        <p className='text-xs text-gray-400 truncate max-w-40'>
          {ticket.email ?? ''}
        </p>
      </td>

      {/* Status */}
      <td className='px-4 py-3 whitespace-nowrap'>
        <StatusBadge status={ticket.status} />
      </td>

      {/* Date */}
      <td className='px-4 py-3 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400'>
        {date}
      </td>

      {/* Action */}
      <td className='px-4 py-3'>
        <button
          onClick={() => onView(ticket)}
          className='flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-theme-primary-start hover:bg-theme-primary-start/8 dark:hover:bg-theme-primary-start/15 transition-colors'
        >
          <Eye size={13} />
          Xem
        </button>
      </td>
    </tr>
  );
}
