'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { ContactTicket } from '@/types/dashboard';
import { ContactTicketsTable } from '@/components/dashboard/contact-tickets/tickets-table';
import { TicketStatusDialog } from '@/components/dashboard/contact-tickets/status-dialog';

export default function ContactTicketsPage() {
  const [selectedTicket, setSelectedTicket] = useState<ContactTicket | null>(
    null,
  );
  const [isDialogOpen, setDialogOpen] = useState(false);

  const handleUpdateStatus = (ticket: ContactTicket) => {
    setSelectedTicket(ticket);
    setDialogOpen(true);
  };

  return (
    <div className='flex flex-col gap-6 w-full p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-start gap-4'>
          <div className='p-2.5 rounded-xl bg-theme-primary-start/10 mt-0.5'>
            <MessageSquare size={20} className='text-theme-primary-start' />
          </div>
          <div>
            <h2 className='text-2xl font-bold tracking-tight text-text-main'>
              Phản hồi khách hàng
            </h2>
            <p className='text-text-sub mt-1 text-sm'>
              Xem và cập nhật trạng thái xử lý các yêu cầu từ khách hàng. Việc
              phản hồi được thực hiện qua email hoặc điện thoại.
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <StatusSummary />

      {/* Table */}
      <div className='w-full'>
        <ContactTicketsTable onUpdateStatus={handleUpdateStatus} />
      </div>

      {/* Status update dialog — keyed by ticketId so state resets on each open */}
      <TicketStatusDialog
        key={selectedTicket?.contactTicketId ?? 'none'}
        ticket={selectedTicket}
        isOpen={isDialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedTicket(null);
        }}
      />
    </div>
  );
}

// ─── Mini status summary cards ────────────────────────────────────
import { useContactTicketsQuery } from '@/hooks/api/use-contact-tickets';
import { Clock, CircleDot, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

function StatusSummary() {
  const { data: pending } = useContactTicketsQuery({
    status: 'pending',
    limit: 1,
  });
  const { data: inProgress } = useContactTicketsQuery({
    status: 'in_progress',
    limit: 1,
  });
  const { data: resolved } = useContactTicketsQuery({
    status: 'resolved',
    limit: 1,
  });
  const { data: closed } = useContactTicketsQuery({
    status: 'closed',
    limit: 1,
  });

  const cards = [
    {
      label: 'Chờ xử lý',
      count: pending?.total ?? '—',
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-100 dark:border-amber-500/20',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    },
    {
      label: 'Đang xử lý',
      count: inProgress?.total ?? '—',
      icon: CircleDot,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-100 dark:border-blue-500/20',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Đã giải quyết',
      count: resolved?.total ?? '—',
      icon: CheckCircle2,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-100 dark:border-green-500/20',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      label: 'Đã đóng',
      count: closed?.total ?? '—',
      icon: XCircle,
      color: 'text-gray-500 dark:text-gray-400',
      bg: 'bg-gray-50 dark:bg-white/3',
      border: 'border-gray-100 dark:border-white/8',
      iconBg: 'bg-gray-100 dark:bg-white/8',
    },
  ];

  return (
    <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className={cn(
              'flex items-center gap-3 rounded-xl border px-4 py-3.5',
              c.bg,
              c.border,
            )}
          >
            <div className={cn('p-2 rounded-lg', c.iconBg)}>
              <Icon size={16} className={c.color} />
            </div>
            <div>
              <p className={cn('text-xl font-bold', c.color)}>{c.count}</p>
              <p className='text-xs text-text-sub mt-0.5'>{c.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
