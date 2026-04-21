'use client';

import { useState } from 'react';
import { MessageSquare, CircleDot, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TicketListTable } from '@/features/tickets/components/TicketListTable';
import { TicketDetailModal } from '@/features/tickets/components/TicketDetailModal';
import { useTickets } from '@/features/tickets/hooks/useTickets';
import type {
  ContactTicketResponse,
  ContactTicketStatus,
} from '@/features/tickets/types';

// ─── Summary card ─────────────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string;
  status: ContactTicketStatus;
  icon: React.ElementType;
  colorCls: string;
  bgCls: string;
  borderCls: string;
  iconBgCls: string;
}

function SummaryCard({
  label,
  status,
  icon: Icon,
  colorCls,
  bgCls,
  borderCls,
  iconBgCls,
}: SummaryCardProps) {
  const { data } = useTickets({ status, size: 1 });
  const count = data?.meta?.totalElements ?? '-';

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border px-4 py-3.5',
        bgCls,
        borderCls,
      )}
    >
      <div className={cn('p-2 rounded-lg', iconBgCls)}>
        <Icon size={16} className={colorCls} />
      </div>
      <div>
        <p className={cn('text-xl font-bold', colorCls)}>{count}</p>
        <p className='text-xs text-text-sub mt-0.5'>{label}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContactTicketsPage() {
  const [selectedTicket, setSelectedTicket] =
    useState<ContactTicketResponse | null>(null);

  return (
    <div className='flex flex-col gap-6 w-full p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-start gap-4'>
          <div className='p-2.5 rounded-xl bg-blue-600/10 mt-0.5'>
            <MessageSquare size={20} className='text-blue-600' />
          </div>
          <div>
            <h2 className='text-2xl font-bold tracking-tight text-text-main'>
              Quản lý Ticket hỗ trợ
            </h2>
            <p className='text-text-sub mt-1 text-sm'>
              Xem, phản hồi và đóng các yêu cầu hỗ trợ từ khách hàng.
            </p>
          </div>
        </div>
      </div>

      {/* Summary row */}
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
        <SummaryCard
          label='Đang xử lý'
          status='IN_PROGRESS'
          icon={CircleDot}
          colorCls='text-amber-600 dark:text-amber-400'
          bgCls='bg-amber-50 dark:bg-amber-900/20'
          borderCls='border-amber-100 dark:border-amber-500/20'
          iconBgCls='bg-amber-100 dark:bg-amber-900/30'
        />
        <SummaryCard
          label='Đã giải quyết'
          status='RESOLVED'
          icon={CheckCircle2}
          colorCls='text-emerald-600 dark:text-emerald-400'
          bgCls='bg-emerald-50 dark:bg-emerald-900/20'
          borderCls='border-emerald-100 dark:border-emerald-500/20'
          iconBgCls='bg-emerald-100 dark:bg-emerald-900/30'
        />
        <SummaryCard
          label='Đã đóng'
          status='CLOSED'
          icon={XCircle}
          colorCls='text-gray-500 dark:text-gray-400'
          bgCls='bg-gray-50 dark:bg-white/3'
          borderCls='border-gray-100 dark:border-white/8'
          iconBgCls='bg-gray-100 dark:bg-white/8'
        />
      </div>

      {/* Table */}
      <TicketListTable
        onView={(ticket: ContactTicketResponse) => setSelectedTicket(ticket)}
      />

      {/* Detail modal / slide-over */}
      {selectedTicket && (
        <TicketDetailModal
          key={selectedTicket.contactTicketId}
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}
