'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ListOrdered } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SpotlightCard } from '@/components/common/spotlight-card';
import { ContractPdfStack } from '@/components/checkout/contract-pdf-stack';
import { PdfViewerDialog } from '@/components/orders/pdf-viewer-dialog';
import { useRentalOrderStore } from '@/stores/rental-order-store';
import { lineDepositTotal, lineRentalAfterVoucher, rentalSubtotalLine } from '@/stores/rental-cart-store';
import { computeVoucherDiscount } from '@/lib/rental-voucher';
import type { ContractPdfInput } from '@/lib/generate-contract-pdf';

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function paymentLabel(m: string) {
  if (m === 'e_wallet') return 'Ví điện tử';
  return 'Chuyển khoản ngân hàng';
}

export default function OrderDetailPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const order = useRentalOrderStore((s) => (id ? s.orders.find((o) => o.id === id) : undefined));

  if (!order) {
    return (
      <div className='min-h-screen bg-transparent px-3 pb-16 pt-24 font-sans sm:pt-28'>
        <div className='mx-auto max-w-lg text-center'>
          <p className='text-lg font-semibold text-foreground'>Không tìm thấy đơn</p>
          <p className='mt-1 text-sm text-muted-foreground'>Mã có thể đã hết hạn hoặc không tồn tại trên thiết bị này.</p>
          <Button className='mt-6' variant='outline' render={<Link href='/orders' />}>
            Danh sách đơn
          </Button>
        </div>
      </div>
    );
  }

  const pdfInput = useMemo<ContractPdfInput>(
    () => ({
      orderCode: order.orderCode,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      createdAt: formatDate(order.createdAt),
      paymentMethod: order.paymentMethod,
      lines: order.lines.map((l) => ({
        name: l.name,
        variantLabel: l.variantLabel,
        durationLabel: l.durationLabel,
        quantity: l.quantity,
        rentalAfterVoucher: lineRentalAfterVoucher(l),
        depositTotal: lineDepositTotal(l),
      })),
      totals: {
        rentalSubtotal: order.totals.rentalSubtotal,
        totalVoucherDiscount: order.totals.voucherDiscount,
        totalDeposit: order.totals.depositTotal,
        grandTotal: order.totals.grandTotal,
      },
    }),
    [order],
  );

  return (
    <div className='min-h-screen bg-transparent px-3 pb-16 pt-20 font-sans sm:px-4 sm:pt-24 md:px-6 md:pt-28'>
      <div className='mx-auto max-w-4xl'>
        <Button variant='ghost' size='sm' className='mb-4 gap-1 text-muted-foreground' render={<Link href='/orders' />}>
          <ArrowLeft className='size-4' />
          Tất cả đơn
        </Button>

        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div>
            <p className='font-mono text-sm font-bold text-teal-600 dark:text-teal-400'>{order.orderCode}</p>
            <h1 className='mt-1 text-2xl font-extrabold text-foreground'>Chi tiết đơn &amp; hợp đồng</h1>
            <p className='mt-1 text-sm text-muted-foreground'>{formatDate(order.createdAt)}</p>
          </div>
          <p className='text-sm text-muted-foreground'>
            Thanh toán: <span className='font-medium text-foreground'>{paymentLabel(order.paymentMethod)}</span>
          </p>
        </div>

        <div className='mt-8 grid gap-8 lg:grid-cols-2 lg:gap-10'>
          <SpotlightCard
            className='rounded-2xl border border-border/60 bg-card/85 p-5 dark:bg-card/75'
            spotlightColor='rgba(99, 102, 241, 0.08)'
          >
            <div className='flex items-center gap-2 font-bold text-foreground'>
              <ListOrdered className='size-5 text-teal-600 dark:text-teal-400' />
              Sản phẩm
            </div>
            <ul className='mt-4 space-y-4'>
              {order.lines.map((line) => {
                const sub = rentalSubtotalLine(line);
                const disc = line.voucher ? computeVoucherDiscount(sub, line.voucher) : 0;
                return (
                  <li key={line.lineId} className='border-b border-border/50 pb-3 text-sm last:border-0 last:pb-0'>
                    <p className='font-medium text-foreground'>{line.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      {line.variantLabel && `${line.variantLabel} · `}
                      {line.durationLabel} × {line.quantity}
                    </p>
                    {line.voucher && disc > 0 && (
                      <p className='mt-1 text-xs text-teal-600 dark:text-teal-400'>
                        {line.voucher.code} · −{disc.toLocaleString('vi-VN')}₫
                      </p>
                    )}
                    <p className='mt-2 tabular-nums text-muted-foreground'>
                      Thuê sau giảm:{' '}
                      <span className='font-semibold text-foreground'>
                        {lineRentalAfterVoucher(line).toLocaleString('vi-VN')}₫
                      </span>
                      {' · '}
                      Cọc:{' '}
                      <span className='font-semibold text-foreground'>
                        {lineDepositTotal(line).toLocaleString('vi-VN')}₫
                      </span>
                    </p>
                  </li>
                );
              })}
            </ul>
            <div className='mt-4 space-y-1 border-t border-border pt-4 text-sm'>
              <div className='flex justify-between gap-2'>
                <span className='text-muted-foreground'>Tổng thanh toán</span>
                <span className='font-bold tabular-nums text-teal-600 dark:text-teal-400'>
                  {order.totals.grandTotal.toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>
            <p className='mt-3 text-xs text-muted-foreground'>
              Khách hàng: <span className='font-medium text-foreground'>{order.customerName}</span> —{' '}
              {order.customerPhone}
            </p>

            <div className='mt-5 border-t border-border pt-5'>
              <PdfViewerDialog input={pdfInput} />
            </div>
          </SpotlightCard>

          <div>
            <h2 className='mb-4 text-center text-sm font-semibold uppercase tracking-wide text-muted-foreground'>
              Hợp đồng (xem trước)
            </h2>
            <ContractPdfStack
              orderCode={order.orderCode}
              customerName={order.customerName}
              customerPhone={order.customerPhone}
              grandTotal={order.totals.grandTotal}
              signedAtLabel={formatDate(order.createdAt)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
