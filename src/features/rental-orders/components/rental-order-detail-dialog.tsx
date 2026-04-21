'use client';

import { FileText, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RentalOrderDetailView } from './rental-order-detail-view';
import {
  STATUS_LABELS,
  STATUS_STYLES,
  type RentalOrderStatus,
  type RentalOrderResponse,
} from '../types';
import { cn } from '@/lib/utils';

function StatusBadge({ status }: { status: RentalOrderStatus }) {
  const s = STATUS_STYLES[status] ?? {
    dot: 'bg-gray-400',
    cls: 'text-gray-600 bg-gray-100 border-gray-200',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold whitespace-nowrap',
        s.cls,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', s.dot)} />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

interface RentalOrderDetailDialogProps {
  order: RentalOrderResponse | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function RentalOrderDetailDialog({
  order,
  open,
  onOpenChange,
}: RentalOrderDetailDialogProps) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-6xl! w-full max-h-[92vh] flex flex-col gap-0 p-0 overflow-hidden'>
        {/* Header cố định */}
        <DialogHeader className='shrink-0 px-6 pt-5 pb-4 border-b border-gray-100 dark:border-white/8'>
          <DialogTitle className='flex items-center justify-between gap-3'>
            <div className='flex items-center gap-3 min-w-0'>
              <FileText className='w-5 h-5 text-theme-primary-start shrink-0' />
              <div className='min-w-0'>
                <div className='flex items-center gap-2.5 flex-wrap'>
                  <span className='text-base font-bold text-text-main'>
                    Chi tiết đơn thuê
                  </span>
                  <span className='font-mono text-sm font-semibold text-theme-primary-start'>
                    #{order.rentalOrderId.slice(0, 8).toUpperCase()}
                  </span>
                  <StatusBadge status={order.status} />
                </div>
                <p className='text-xs text-text-sub mt-0.5 truncate'>
                  {order.userAddress?.recipientName ?? 'N/A'}
                  {order.userAddress?.phoneNumber
                    ? ` · ${order.userAddress.phoneNumber}`
                    : ''}
                </p>
              </div>
            </div>

            <a
              href={`/dashboard/rental-orders/${order.rentalOrderId}`}
              target='_blank'
              rel='noopener noreferrer'
              onClick={(e) => e.stopPropagation()}
              title='Mở trang chi tiết riêng'
              className='shrink-0 p-2 rounded-lg text-text-sub hover:bg-gray-100 dark:hover:bg-white/10 transition-colors'
            >
              <ExternalLink className='w-4 h-4' />
            </a>
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable content */}
        <div className='flex-1 overflow-y-auto min-h-0'>
          <RentalOrderDetailView rentalOrderId={order.rentalOrderId} isDialog />
        </div>
      </DialogContent>
    </Dialog>
  );
}
