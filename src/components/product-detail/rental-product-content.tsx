'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* ---------- Mô tả (mở rộng) ---------- */

interface RentalProductDescriptionProps {
  text: string;
  maxHeight?: number;
  className?: string;
}

export function RentalProductDescription({
  text,
  maxHeight = 200,
  className,
}: RentalProductDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn('relative font-sans', className)}>
      <div
        className={cn(
          'prose prose-sm prose-neutral max-w-none text-foreground transition-all duration-300 whitespace-pre-wrap sm:prose-base dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-muted-foreground prose-strong:text-foreground',
          !isExpanded && 'overflow-hidden'
        )}
        style={{
          maxHeight: !isExpanded ? `${maxHeight}px` : undefined,
          WebkitMaskImage: !isExpanded
            ? 'linear-gradient(to bottom, rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0) 100%)'
            : 'none',
        }}
      >
        {text}
      </div>
      <div className="flex justify-center mt-4">
        <Button
          variant="ghost"
          className="flex items-center justify-center font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Thu gọn' : 'Xem thêm'}
        </Button>
      </div>
    </div>
  );
}

/* ---------- Thông số ---------- */

export interface RentalSpecificationRow {
  label: string;
  value: string;
}

interface RentalSpecificationsProps {
  specifications?: RentalSpecificationRow[];
}

const defaultSpecifications: RentalSpecificationRow[] = [
  { label: 'Thương hiệu', value: 'Sony' },
  { label: 'Model', value: 'PlayStation 5 Slim' },
  { label: 'Tình trạng', value: 'Mới 99% - Đầy đủ phụ kiện' },
  { label: 'Bảo hành', value: 'Hỗ trợ đổi máy trong 24h nếu lỗi' },
  { label: 'Phụ kiện kèm theo', value: '1 Tay cầm, Dây HDMI, Dây nguồn, Hộp đựng' },
  { label: 'Tiền cọc', value: '2,000,000₫ (hoàn trả khi trả máy)' },
  { label: 'Khu vực cho thuê', value: 'TP.HCM, Hà Nội' },
  { label: 'Giao hàng', value: 'Giao tận nơi hoặc nhận tại cửa hàng' },
];

export function RentalSpecifications({ specifications = defaultSpecifications }: RentalSpecificationsProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 font-sans ambient-glow sm:p-5">
      <h2 className="mb-3 text-base font-bold tracking-tight text-foreground sm:mb-4 sm:text-lg">Thông tin chi tiết</h2>
      <div className="divide-y divide-border">
        {specifications.map((spec, index) => (
          <div
            key={index}
            className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4 sm:py-3.5"
          >
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:text-sm sm:font-normal sm:normal-case sm:tracking-normal">
              {spec.label}
            </dt>
            <dd className="text-sm font-medium leading-snug text-foreground sm:col-span-2">{spec.value}</dd>
          </div>
        ))}
      </div>
    </div>
  );
}
