'use client';

import Link from 'next/link';
import { Package, ChevronRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SpotlightCard } from '@/components/common/spotlight-card';
import { useRentalOrderStore } from '@/stores/rental-order-store';

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function OrdersPage() {
  const orders = useRentalOrderStore((s) => s.orders);

  return (
    <div className='min-h-screen bg-transparent px-3 pb-16 pt-20 font-sans sm:px-4 sm:pt-24 md:px-6 md:pt-28'>
      <div className='mx-auto max-w-3xl'>
        <h1 className='text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl'>Đơn đã thanh toán</h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          Xem lại từng lần thanh toán và hợp đồng cho thuê (lưu trên trình duyệt — demo).
        </p>

        {orders.length === 0 ? (
          <SpotlightCard
            className='mt-8 rounded-2xl border border-dashed border-border/70 bg-card/80 p-10 text-center'
            spotlightColor='rgba(99, 102, 241, 0.12)'
          >
            <Package className='mx-auto size-12 text-muted-foreground/60' />
            <p className='mt-4 font-semibold text-foreground'>Chưa có đơn nào</p>
            <p className='mt-1 text-sm text-muted-foreground'>Thanh toán từ giỏ hàng để đơn xuất hiện tại đây.</p>
            <Button className='kinetic-gradient mt-6 rounded-xl text-white' render={<Link href='/cart' />}>
              Đi tới giỏ hàng
            </Button>
          </SpotlightCard>
        ) : (
          <ul className='mt-8 space-y-3'>
            {orders.map((o) => (
              <li key={o.id}>
                <SpotlightCard
                  className='rounded-2xl border border-border/60 bg-card/85 shadow-sm dark:bg-card/70'
                  spotlightColor='rgba(45, 212, 191, 0.08)'
                >
                  <Link
                    href={`/orders/${o.id}`}
                    className='flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5'
                  >
                    <div className='flex min-w-0 items-start gap-3'>
                      <div className='flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400'>
                        <FileText className='size-5' />
                      </div>
                      <div className='min-w-0'>
                        <p className='font-mono text-sm font-bold text-teal-700 dark:text-teal-300'>{o.orderCode}</p>
                        <p className='text-xs text-muted-foreground'>{formatDate(o.createdAt)}</p>
                        <p className='mt-1 text-sm text-foreground'>
                          {o.lines.length} dòng ·{' '}
                          <span className='font-semibold tabular-nums'>
                            {o.totals.grandTotal.toLocaleString('vi-VN')}₫
                          </span>
                        </p>
                      </div>
                    </div>
                    <span className='inline-flex items-center gap-1 text-sm font-medium text-teal-600 dark:text-teal-400'>
                      Chi tiết &amp; hợp đồng
                      <ChevronRight className='size-4' />
                    </span>
                  </Link>
                </SpotlightCard>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
