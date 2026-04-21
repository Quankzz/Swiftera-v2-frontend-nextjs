'use client';

import { FileDown, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ContractPdfStackProps = {
  orderCode: string;
  customerName: string;
  customerPhone: string;
  grandTotal: number;
  signedAtLabel: string;
  className?: string;
};

/** Xem trước hợp đồng kiểu “PDF” với lớp giấy + vệt quét animation */
export function ContractPdfStack({
  orderCode,
  customerName,
  customerPhone,
  grandTotal,
  signedAtLabel,
  className,
}: ContractPdfStackProps) {
  const downloadMock = () => {
    const body = [
      'SWIFTERA - HỢP ĐỒNG CHO THUÊ (BẢN DEMO)',
      `Mã đơn: ${orderCode}`,
      `Khách hàng: ${customerName}`,
      `Điện thoại: ${customerPhone}`,
      `Tổng thanh toán: ${grandTotal.toLocaleString('vi-VN')}₫`,
      `Ngày ký: ${signedAtLabel}`,
      '',
      'Đây là file mẫu. Kết nối API sẽ xuất PDF chữ ký số thật.',
    ].join('\n');
    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Hop-dong-${orderCode}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn('mx-auto w-full max-w-md', className)}>
        <div className='relative perspective-distant'>
        {/* Lớp giấy sau */}
        <div
          className='absolute left-[6%] top-3 h-[min(52vh,420px)] w-[88%] rounded-lg border border-border/40 bg-card/90 shadow-md animate-contract-page-sway opacity-70'
          style={{ animationDelay: '-2s' }}
        />
        <div
          className='absolute left-[3%] top-6 h-[min(52vh,420px)] w-[88%] rounded-lg border border-border/30 bg-muted/80 shadow-sm opacity-50'
          style={{ transform: 'rotate(-2deg)' }}
        />

        {/* Trang chính - nội dung hợp đồng */}
        <div className='relative z-10 mx-auto w-[92%] animate-contract-pdf-float'>
          <div className='relative overflow-hidden rounded-xl border border-border bg-white shadow-2xl dark:bg-zinc-900 dark:shadow-black/40'>
            <div className='absolute inset-x-0 top-0 z-20 h-10 bg-linear-to-b from-rose-600/90 to-rose-700/80 dark:from-rose-700/90 dark:to-rose-900/90'>
              <div className='flex h-full items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-white'>
                <FileText className='size-4' />
                Hợp đồng cho thuê
              </div>
            </div>

            {/* Vệt quét giống máy scan PDF */}
            <div className='pointer-events-none absolute inset-0 top-10 z-30 overflow-hidden'>
              <div
                className='h-16 w-full bg-linear-to-b from-transparent via-rose-400/25 to-transparent dark:via-rose-300/20 animate-contract-pdf-scan'
              />
            </div>

            <div className='relative z-10 space-y-3 px-5 pb-6 pt-14 text-left text-xs leading-relaxed text-zinc-800 dark:text-zinc-200'>
              <p className='font-mono text-[11px] text-rose-700 dark:text-rose-300'>Mã hợp đồng: {orderCode}</p>
              <p>
                <span className='font-semibold'>Bên A (Swiftera):</span> Cung cấp dịch vụ cho thuê thiết bị theo điều khoản
                đăng tải trên website.
              </p>
              <p>
                <span className='font-semibold'>Bên B (Khách):</span> {customerName} - {customerPhone}
              </p>
              <p>
                <span className='font-semibold'>Tổng thanh toán (thuê + cọc):</span>{' '}
                <span className='tabular-nums font-bold text-rose-700 dark:text-rose-300'>
                  {grandTotal.toLocaleString('vi-VN')}₫
                </span>
              </p>
              <p className='text-muted-foreground'>
                Tiền cọc hoàn trả trong 24h sau khi trả thiết bị đúng hiện trạng. Phí vận chuyển &amp; VAT (nếu có) tính
                theo hóa đơn riêng.
              </p>
              <div className='flex flex-wrap gap-6 border-t border-dashed border-border pt-4'>
                <div>
                  <p className='text-[10px] uppercase text-muted-foreground'>Ngày ký</p>
                  <p className='font-medium'>{signedAtLabel}</p>
                </div>
                <div>
                  <p className='text-[10px] uppercase text-muted-foreground'>Chữ ký điện tử</p>
                <p className='text-lg italic text-rose-600/80 dark:text-rose-400/90'>Swiftera ✓</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
