'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CalendarClock,
  ExternalLink,
  FileText,
  ShieldCheck,
} from 'lucide-react';

import { Layout } from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePoliciesQuery } from '@/hooks/api/use-policies';
import type { PolicyDocumentResponse } from '@/api/policies';
import { cn } from '@/lib/utils';

const POLICY_CODE_LABELS: Record<string, string> = {
  RENTAL_TERMS: 'Điều khoản thuê',
  PRIVACY_POLICY: 'Chính sách bảo mật',
  RETURN_POLICY: 'Chính sách hoàn trả',
};

function getPolicyLabel(code: string): string {
  return POLICY_CODE_LABELS[code] ?? code;
}

function formatPolicyDate(value: string): string {
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(parsed);
  }

  return value;
}

function comparePolicies(
  left: PolicyDocumentResponse,
  right: PolicyDocumentResponse,
): number {
  if (left.code !== right.code) {
    return left.code.localeCompare(right.code);
  }

  return right.policyVersion - left.policyVersion;
}

export default function PoliciesPage() {
  const searchParams = useSearchParams();
  const highlightedCode = (searchParams.get('code') ?? '').toUpperCase().trim();

  const {
    data: policies = [],
    isLoading,
    isError,
    refetch,
  } = usePoliciesQuery({
    page: 1,
    size: 50,
    filter: 'isActive:true',
    sort: 'code,asc',
  });

  const orderedPolicies = useMemo(() => {
    const items = [...policies].sort(comparePolicies);
    if (!highlightedCode) return items;

    return items.sort((left, right) => {
      const leftMatched = left.code === highlightedCode;
      const rightMatched = right.code === highlightedCode;

      if (leftMatched && !rightMatched) return -1;
      if (!leftMatched && rightMatched) return 1;
      return 0;
    });
  }, [highlightedCode, policies]);

  return (
    <Layout stickyHeader>
      <div className='bg-background pb-14 pt-10'>
        <section className='mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10'>
          <div className='rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8'>
            <div className='flex flex-wrap items-start justify-between gap-4'>
              <div>
                <div className='mb-3 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 dark:border-rose-400/30 dark:bg-rose-900/20 dark:text-rose-300'>
                  <ShieldCheck className='size-3.5' />
                  Chính sách công ty
                </div>
                <h1 className='text-2xl font-bold tracking-tight text-foreground sm:text-3xl'>
                  Trung tâm chính sách
                </h1>
                <p className='mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base'>
                  Trang này tổng hợp toàn bộ chính sách đang có hiệu lực của
                  Swiftera để bạn dễ theo dõi trước khi thuê sản phẩm.
                </p>
              </div>
              <Badge variant='secondary' className='text-xs'>
                {orderedPolicies.length} chính sách
              </Badge>
            </div>

            {isLoading && (
              <div className='mt-8 grid grid-cols-1 gap-4 md:grid-cols-2'>
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`policy-skeleton-${index}`}
                    className='space-y-3 rounded-2xl border border-border/60 p-5'
                  >
                    <Skeleton className='h-5 w-36' />
                    <Skeleton className='h-6 w-4/5' />
                    <Skeleton className='h-4 w-3/5' />
                    <Skeleton className='h-9 w-28' />
                  </div>
                ))}
              </div>
            )}

            {isError && !isLoading && (
              <div className='mt-8 rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive'>
                <p className='font-medium'>Không thể tải danh sách chính sách.</p>
                <p className='mt-1'>
                  Vui lòng thử lại sau hoặc bấm nút tải lại bên dưới.
                </p>
                <Button
                  variant='outline'
                  size='sm'
                  className='mt-3'
                  onClick={() => void refetch()}
                >
                  Tải lại
                </Button>
              </div>
            )}

            {!isLoading && !isError && orderedPolicies.length === 0 && (
              <div className='mt-8 rounded-2xl border border-border/60 bg-muted/30 p-5 text-sm text-muted-foreground'>
                Hiện chưa có chính sách nào được công bố.
              </div>
            )}

            {!isLoading && !isError && orderedPolicies.length > 0 && (
              <div className='mt-8 grid grid-cols-1 gap-4 md:grid-cols-2'>
                {orderedPolicies.map((policy) => {
                  const isHighlighted =
                    highlightedCode.length > 0 && policy.code === highlightedCode;

                  return (
                    <article
                      key={policy.policyDocumentId}
                      className={cn(
                        'rounded-2xl border border-border/60 bg-background p-5 transition-shadow hover:shadow-md',
                        isHighlighted &&
                          'border-rose-300 shadow-sm ring-1 ring-rose-200 dark:border-rose-400/40 dark:ring-rose-400/30',
                      )}
                    >
                      <div className='mb-3 flex flex-wrap items-center gap-2'>
                        <Badge variant='secondary'>{getPolicyLabel(policy.code)}</Badge>
                        <Badge variant='outline'>Phiên bản {policy.policyVersion}</Badge>
                        {isHighlighted && (
                          <Badge className='bg-rose-600 text-white'>Đang chọn</Badge>
                        )}
                      </div>

                      <h2 className='text-base font-semibold text-foreground sm:text-lg'>
                        {policy.title}
                      </h2>

                      <p className='mt-2 flex items-center gap-2 text-xs text-muted-foreground sm:text-sm'>
                        <CalendarClock className='size-3.5' />
                        Hiệu lực từ: {formatPolicyDate(policy.effectiveFrom)}
                      </p>

                      <div className='mt-4 flex flex-wrap items-center gap-2'>
                        {policy.pdfUrl ? (
                          <Button asChild size='sm' className='gap-1.5'>
                            <Link
                              href={policy.pdfUrl}
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              <FileText className='size-4' />
                              Xem chính sách
                              <ExternalLink className='size-3.5' />
                            </Link>
                          </Button>
                        ) : (
                          <span className='rounded-md border border-border/60 px-3 py-1.5 text-xs text-muted-foreground'>
                            Chưa có bản PDF
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
