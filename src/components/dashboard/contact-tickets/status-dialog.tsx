'use client';

import { useState, useEffect } from 'react';
import {
  X,
  MessageSquare,
  CheckCircle2,
  Clock,
  CircleDot,
  XCircle,
} from 'lucide-react';
import { ContactTicket, ContactTicketStatus } from '@/types/dashboard';
import { TICKET_STATUSES } from '@/api/contact-tickets';
import { useUpdateTicketStatusMutation } from '@/hooks/api/use-contact-tickets';
import { cn } from '@/lib/utils';

interface StatusDialogProps {
  ticket: ContactTicket | null;
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_META: Record<
  ContactTicketStatus,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    border: string;
  }
> = {
  pending: {
    label: 'Chờ xử lý',
    icon: Clock,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-500/30',
  },
  in_progress: {
    label: 'Đang xử lý',
    icon: CircleDot,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-500/30',
  },
  resolved: {
    label: 'Đã giải quyết',
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-500/30',
  },
  closed: {
    label: 'Đã đóng',
    icon: XCircle,
    color: 'text-gray-500 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-white/5',
    border: 'border-gray-200 dark:border-white/8',
  },
};

export function StatusBadge({ status }: { status: ContactTicketStatus }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
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
  );
}

export function TicketStatusDialog({
  ticket,
  isOpen,
  onClose,
}: StatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<ContactTicketStatus>(
    ticket?.status ?? 'pending',
  );
  const mutation = useUpdateTicketStatusMutation();

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen || !ticket) return null;

  const handleSave = async () => {
    await mutation.mutateAsync({
      id: ticket.contactTicketId,
      payload: { status: selectedStatus },
    });
    onClose();
  };

  const currentMeta = STATUS_META[ticket.status];
  const CurrentIcon = currentMeta.icon;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Panel */}
      <div className='relative bg-white dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/8 rounded-2xl shadow-2xl dark:shadow-black/50 w-full max-w-lg mx-4 overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/8'>
          <div className='flex items-center gap-2.5'>
            <div className='p-2 rounded-lg bg-theme-primary-start/10'>
              <MessageSquare size={16} className='text-theme-primary-start' />
            </div>
            <div>
              <h2 className='text-base font-semibold text-text-main'>
                Cập nhật trạng thái
              </h2>
              <p className='text-xs text-text-sub mt-0.5'>
                #{ticket.contactTicketId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-1.5 rounded-lg text-text-sub hover:text-text-main hover:bg-gray-100 dark:hover:bg-white/8 transition-colors'
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className='px-6 py-5 space-y-5'>
          {/* Ticket info summary */}
          <div className='rounded-xl border border-gray-100 dark:border-white/8 bg-gray-50 dark:bg-white/3 px-4 py-3 space-y-2'>
            <p className='text-sm font-medium text-text-main line-clamp-2'>
              {ticket.subject}
            </p>
            <div className='flex flex-wrap items-center gap-3 text-xs text-text-sub'>
              {ticket.userFullName && <span>👤 {ticket.userFullName}</span>}
              {ticket.rentalOrderId && <span>📦 #{ticket.rentalOrderId}</span>}
              <span>
                📅{' '}
                {new Date(ticket.createdAt).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className='flex items-center gap-2 text-xs text-text-sub'>
              <span>Trạng thái hiện tại:</span>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium',
                  currentMeta.bg,
                  currentMeta.border,
                  currentMeta.color,
                )}
              >
                <CurrentIcon size={10} />
                {currentMeta.label}
              </span>
            </div>
          </div>

          {/* Request message preview */}
          <div>
            <p className='text-xs font-medium text-text-sub mb-2'>
              Nội dung yêu cầu
            </p>
            <div
              className='rich-content text-sm text-text-main bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/8 rounded-lg px-4 py-3 leading-relaxed max-h-48 overflow-y-auto'
              dangerouslySetInnerHTML={{ __html: ticket.requestMessage }}
            />
          </div>

          {/* Status selector */}
          <div>
            <p className='text-xs font-medium text-text-sub mb-2.5'>
              Chọn trạng thái mới
            </p>
            <div className='grid grid-cols-2 gap-2'>
              {TICKET_STATUSES.map(({ value }) => {
                const meta = STATUS_META[value];
                const Icon = meta.icon;
                const isSelected = selectedStatus === value;
                return (
                  <button
                    key={value}
                    type='button'
                    onClick={() => setSelectedStatus(value)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all',
                      isSelected
                        ? cn(
                            meta.bg,
                            meta.border,
                            meta.color,
                            'ring-2 ring-offset-1 dark:ring-offset-[#1a1a1f]',
                            value === 'pending'
                              ? 'ring-amber-400/50'
                              : value === 'in_progress'
                                ? 'ring-blue-400/50'
                                : value === 'resolved'
                                  ? 'ring-green-400/50'
                                  : 'ring-gray-400/50',
                          )
                        : 'border-gray-200 dark:border-white/8 text-text-sub hover:bg-gray-50 dark:hover:bg-white/5',
                    )}
                  >
                    <Icon
                      size={16}
                      className={isSelected ? meta.color : 'text-text-sub'}
                    />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-white/8'>
          <button
            type='button'
            onClick={onClose}
            className='px-4 py-2 rounded-lg border border-gray-200 dark:border-white/8 text-sm font-medium text-text-main hover:bg-gray-50 dark:hover:bg-white/8 transition-colors'
          >
            Hủy
          </button>
          <button
            type='button'
            onClick={handleSave}
            disabled={selectedStatus === ticket.status || mutation.isPending}
            className='px-5 py-2 rounded-lg bg-theme-primary-start text-sm font-medium text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity'
          >
            {mutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
}
