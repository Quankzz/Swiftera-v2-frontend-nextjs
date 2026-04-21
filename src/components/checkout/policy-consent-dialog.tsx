'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  ScrollText,
  ShieldCheck,
  BookOpen,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  usePoliciesQuery,
  useMyConsentsQuery,
  useRecordConsentMutation,
} from '@/hooks/api/use-policies';
import type { PolicyDocumentResponse } from '@/api/policies';
import { toast } from 'sonner';
import { PolicyPdfPreview } from '@/features/policies/components/policy-pdf-preview';

/* ─── PDF viewer dialog ──────────────────────────────────────────────────────── */

function PdfViewerDialog({
  open,
  onOpenChange,
  url,
  title,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  url: string;
  title: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-6xl w-full gap-4'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-base'>
            <BookOpen className='size-4 text-blue-500' />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className='max-h-[80vh] overflow-y-auto rounded-xl bg-muted/20 p-4'>
          <PolicyPdfPreview pdfUrl={url} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Single policy item ──────────────────────────────────────────────────────── */

function PolicyItem({
  policy,
  checked,
  onToggle,
  alreadyConsented,
}: {
  policy: PolicyDocumentResponse;
  checked: boolean;
  onToggle: () => void;
  alreadyConsented: boolean;
}) {
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          'rounded-xl border transition-colors duration-150',
          checked || alreadyConsented
            ? 'border-blue-500/40 bg-blue-50/40 dark:border-blue-500/30 dark:bg-blue-950/20'
            : 'border-border/70 bg-card/60 dark:bg-card/40',
        )}
      >
        <div className='flex items-start gap-3 p-4'>
          {/* Checkbox */}
          <button
            type='button'
            onClick={onToggle}
            aria-checked={checked || alreadyConsented}
            role='checkbox'
            className='mt-0.5 shrink-0 focus-visible:outline-none'
            aria-label={`Đồng ý ${policy.title}`}
          >
            <span
              className={cn(
                'flex size-5.5 items-center justify-center rounded-full border-2 transition-all duration-150',
                checked || alreadyConsented
                  ? alreadyConsented
                    ? 'border-blue-400 bg-blue-400/60'
                    : 'border-blue-500 bg-blue-500 shadow-sm shadow-blue-200 dark:shadow-blue-900/40'
                  : 'border-muted-foreground/30 hover:border-blue-400',
              )}
            >
              {(checked || alreadyConsented) && (
                <svg
                  viewBox='0 0 24 24'
                  className='size-3 text-white'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='3.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <polyline points='20 6 9 17 4 12' />
                </svg>
              )}
            </span>
          </button>

          {/* Content */}
          <div className='min-w-0 flex-1'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='text-sm font-semibold text-foreground'>
                {policy.title}
              </span>
              <Badge
                variant='secondary'
                className='rounded-md px-1.5 py-0 text-[10px] font-medium'
              >
                v{policy.policyVersion}
              </Badge>
              {alreadyConsented && (
                <Badge className='rounded-md border-0 bg-emerald-100 px-1.5 py-0 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'>
                  Đã đồng ý
                </Badge>
              )}
            </div>

            <p className='mt-0.5 text-xs text-muted-foreground'>
              Có hiệu lực từ:{' '}
              <span className='font-medium'>{policy.effectiveFrom}</span>
            </p>

            {/* Actions */}
            <div className='mt-2.5 flex flex-wrap items-center gap-2'>
              {policy.pdfUrl ? (
                <button
                  type='button'
                  onClick={() => setPdfViewerOpen(true)}
                  className='flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-950/50'
                >
                  <BookOpen className='size-3' />
                  Xem điều khoản
                </button>
              ) : (
                <span className='text-xs italic text-muted-foreground/60'>
                  Chưa có tài liệu PDF
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PDF viewer dialog - nested outside the main dialog via portal */}
      {policy.pdfUrl && (
        <PdfViewerDialog
          open={pdfViewerOpen}
          onOpenChange={setPdfViewerOpen}
          url={policy.pdfUrl}
          title={policy.title}
        />
      )}
    </>
  );
}

/* ─── Skeleton ────────────────────────────────────────────────────────────── */

function PolicySkeleton() {
  return (
    <div className='space-y-3'>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className='rounded-xl border border-border/60 p-4'>
          <div className='flex items-start gap-3'>
            <Skeleton className='mt-0.5 size-5.5 shrink-0 rounded-full' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='h-3 w-1/2' />
              <Skeleton className='h-6 w-28 rounded-lg' />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main consent dialog ────────────────────────────────────────────────────── */

export interface PolicyConsentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAllConsented: () => void;
}

export function PolicyConsentDialog({
  open,
  onOpenChange,
  onAllConsented,
}: PolicyConsentDialogProps) {
  const {
    data: policies = [],
    isLoading: loadingPolicies,
    isError: errorPolicies,
  } = usePoliciesQuery({ filter: 'isActive:true', size: 20 });

  const { data: myConsents = [], isLoading: loadingConsents } =
    useMyConsentsQuery(open);

  const recordConsent = useRecordConsentMutation();

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = loadingPolicies || loadingConsents;

  const alreadyConsentedIds = new Set(
    myConsents
      .filter((c) =>
        policies.some(
          (p) =>
            p.policyDocumentId === c.policyDocumentId &&
            p.policyVersion === c.policyVersion,
        ),
      )
      .map((c) => c.policyDocumentId),
  );

  const needsConsentPolicies = policies.filter(
    (p) => !alreadyConsentedIds.has(p.policyDocumentId),
  );

  const allChecked =
    needsConsentPolicies.length === 0 ||
    needsConsentPolicies.every((p) => checked.has(p.policyDocumentId));

  function toggleCheck(policyId: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(policyId) ? next.delete(policyId) : next.add(policyId);
      return next;
    });
  }

  function toggleAll() {
    setChecked(
      allChecked
        ? new Set()
        : new Set(needsConsentPolicies.map((p) => p.policyDocumentId)),
    );
  }

  async function handleConfirm() {
    if (!allChecked) return;
    setIsSubmitting(true);

    const toConsent = needsConsentPolicies.filter((p) =>
      checked.has(p.policyDocumentId),
    );

    try {
      await Promise.all(
        toConsent.map((p) =>
          recordConsent.mutateAsync({
            policyId: p.policyDocumentId,
            data: { consentType: 'ACCEPTED', consentContext: 'CHECKOUT' },
          }),
        ),
      );
      onOpenChange(false);
      onAllConsented();
    } catch {
      toast.error('Không thể ghi nhận đồng ý. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[min(90dvh,680px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg'>
        {/* Header */}
        <DialogHeader className='shrink-0 border-b border-border px-5 py-4'>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/50'>
              <ScrollText className='size-4 text-blue-600 dark:text-blue-400' />
            </div>
            <div>
              <DialogTitle className='text-base font-bold'>
                Điều khoản &amp; Điều kiện
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Vui lòng đọc và đồng ý trước khi tiến hành thuê.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable content */}
        <div className='flex-1 overflow-y-auto px-5 py-4'>
          {isLoading ? (
            <PolicySkeleton />
          ) : errorPolicies ? (
            <div className='flex flex-col items-center gap-3 py-8 text-center'>
              <AlertCircle className='size-8 text-destructive' />
              <p className='text-sm text-muted-foreground'>
                Không thể tải điều khoản. Vui lòng thử lại.
              </p>
            </div>
          ) : policies.length === 0 ? (
            <div className='flex flex-col items-center gap-3 py-8 text-center'>
              <ShieldCheck className='size-8 text-emerald-500' />
              <p className='text-sm text-muted-foreground'>
                Không có điều khoản nào cần xác nhận.
              </p>
            </div>
          ) : (
            <div className='space-y-3'>
              {/* Select all */}
              {needsConsentPolicies.length > 1 && (
                <button
                  type='button'
                  onClick={toggleAll}
                  className='flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                >
                  <span
                    className={cn(
                      'flex size-4 items-center justify-center rounded border-2 transition-all',
                      allChecked
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-muted-foreground/40',
                    )}
                  >
                    {allChecked && (
                      <svg
                        viewBox='0 0 24 24'
                        className='size-2.5 text-white'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='3.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <polyline points='20 6 9 17 4 12' />
                      </svg>
                    )}
                  </span>
                  {allChecked ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </button>
              )}

              {/* Policy list */}
              {policies.map((policy) => (
                <PolicyItem
                  key={policy.policyDocumentId}
                  policy={policy}
                  checked={checked.has(policy.policyDocumentId)}
                  onToggle={() => toggleCheck(policy.policyDocumentId)}
                  alreadyConsented={alreadyConsentedIds.has(
                    policy.policyDocumentId,
                  )}
                />
              ))}

              <p className='pt-1 text-xs leading-relaxed text-muted-foreground'>
                Bằng cách đồng ý, bạn xác nhận đã đọc hiểu và chấp nhận tất cả
                điều khoản thuê thiết bị của Swiftera.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='shrink-0 border-t border-border bg-muted/20 px-5 py-4'>
          <div className='flex flex-col gap-2.5 sm:flex-row-reverse'>
            <Button
              type='button'
              className='h-11 flex-1 gap-2 rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600'
              disabled={
                isLoading ||
                isSubmitting ||
                (!allChecked && needsConsentPolicies.length > 0)
              }
              onClick={() => void handleConfirm()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='size-4 animate-spin' />
                  Đang xử lý…
                </>
              ) : (
                <>
                  <ShieldCheck className='size-4' />
                  Xác nhận &amp; Tiến hành thuê
                </>
              )}
            </Button>
            <Button
              type='button'
              variant='outline'
              className='h-11 flex-1 rounded-xl border-border/70'
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Quay lại
            </Button>
          </div>

          {!isLoading && needsConsentPolicies.length > 0 && (
            <p className='mt-2.5 text-center text-xs text-muted-foreground'>
              {checked.size} / {needsConsentPolicies.length} điều khoản đã chọn
              {alreadyConsentedIds.size > 0 && (
                <span className='ml-1 text-emerald-600 dark:text-emerald-400'>
                  · {alreadyConsentedIds.size} đã đồng ý trước đó
                </span>
              )}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
