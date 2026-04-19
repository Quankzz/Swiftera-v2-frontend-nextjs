'use client';

/**
 * PolicyTable
 * ─────────────────────────────────────────────────────────────────────────────
 * Bảng quản lý danh sách chính sách.
 * - Server-side pagination + search + filter (active/inactive)
 * - Xem trước PDF (PolicyPdfPreview trong dialog)
 * - Vô hiệu hóa chính sách (API-110)
 */

import { useMemo, useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/dashboard/ui/data-table';
import {
  Search,
  ShieldOff,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  BookOpen,
  X,
  ExternalLink,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  usePoliciesQuery,
  useDeactivatePolicyMutation,
} from '../hooks/use-policy-management';
import { PolicyPdfPreview } from './policy-pdf-preview';
import { PolicyEditDialog } from './policy-edit-dialog';
import type { PolicyDocumentResponse } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
}

// ─── Filter bar ───────────────────────────────────────────────────────────────
type ActiveFilter = 'all' | 'active' | 'inactive';

function FilterBar({
  value,
  onChange,
}: {
  value: ActiveFilter;
  onChange: (v: ActiveFilter) => void;
}) {
  const opts: { value: ActiveFilter; label: string }[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'active', label: 'Đang hoạt động' },
    { value: 'inactive', label: 'Đã vô hiệu' },
  ];
  return (
    <div className='flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/8'>
      {opts.map((opt) => (
        <button
          key={opt.value}
          type='button'
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
            value === opt.value
              ? 'bg-white dark:bg-gray-800 text-text-main shadow-sm'
              : 'text-text-sub hover:text-text-main',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── PDF Viewer Dialog ────────────────────────────────────────────────────────
function PdfViewerDialog({
  policy,
  onClose,
}: {
  policy: PolicyDocumentResponse | null;
  onClose: () => void;
}) {
  if (!policy) return null;
  return (
    <div className='fixed inset-0 z-60 flex items-center justify-center'>
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={onClose}
      />
      <div className='relative z-10 w-full max-w-4xl mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10 shrink-0'>
          <div className='flex items-center gap-3'>
            <BookOpen className='w-5 h-5 text-indigo-500' />
            <div>
              <p className='text-sm font-semibold text-text-main'>
                {policy.title}
              </p>
              <p className='text-xs text-text-sub'>
                {policy.code} · v{policy.policyVersion}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {policy.pdfUrl && (
              <a
                href={policy.pdfUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors'
              >
                <ExternalLink className='w-3.5 h-3.5' />
                Mở PDF
              </a>
            )}
            <button
              onClick={onClose}
              className='w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center transition-colors'
            >
              <X className='w-4 h-4 text-text-sub' />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className='flex-1 overflow-y-auto px-6 py-5'>
          {policy.pdfUrl ? (
            <PolicyPdfPreview pdfUrl={policy.pdfUrl} />
          ) : (
            <div className='flex flex-col items-center justify-center py-16 gap-3 text-text-sub'>
              <BookOpen className='w-10 h-10 opacity-30' />
              <p className='text-sm'>
                Chính sách này chưa có file PDF đính kèm.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export function PolicyTable() {
  const [page, setPage] = useState(0); // 0-based UI
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');
  const [previewPolicy, setPreviewPolicy] =
    useState<PolicyDocumentResponse | null>(null);
  const [editingPolicy, setEditingPolicy] =
    useState<PolicyDocumentResponse | null>(null);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);
  const [confirmDeactivatePolicy, setConfirmDeactivatePolicy] =
    useState<PolicyDocumentResponse | null>(null);

  const deactivateMutation = useDeactivatePolicyMutation();

  // ── Debounce search ────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(0);
  }, [activeFilter]);

  // ── SpringFilter ───────────────────────────────────────────────────────────
  const filter = useMemo(() => {
    const parts: string[] = [];
    if (activeFilter === 'active') parts.push(`isActive:true`);
    if (activeFilter === 'inactive') parts.push(`isActive:false`);
    if (debouncedSearch.trim()) {
      const t = debouncedSearch.trim();
      parts.push(`(title~~'*${t}*' or code~~'*${t}*')`);
    }
    return parts.length ? parts.join(' and ') : undefined;
  }, [activeFilter, debouncedSearch]);

  const { data, isLoading, isError } = usePoliciesQuery({
    page: page + 1, // BE 1-based
    size: PAGE_SIZE,
    sort: 'createdAt,desc',
    filter,
  });

  const policies = data?.content ?? [];
  const totalPages = data?.meta.totalPages ?? 0;
  const totalElements = data?.meta.totalElements ?? 0;

  // ── Deactivate ─────────────────────────────────────────────────────────────
  const handleDeactivate = async (policy: PolicyDocumentResponse) => {
    setConfirmDeactivatePolicy(policy);
  };

  const confirmDeactivate = async () => {
    if (!confirmDeactivatePolicy) return;
    setDeactivatingId(confirmDeactivatePolicy.policyDocumentId);
    try {
      await deactivateMutation.mutateAsync(
        confirmDeactivatePolicy.policyDocumentId,
      );
      toast.success(`Đã vô hiệu hóa "${confirmDeactivatePolicy.title}".`);
      setConfirmDeactivatePolicy(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Vô hiệu hóa thất bại.');
    } finally {
      setDeactivatingId(null);
    }
  };

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<PolicyDocumentResponse>[]>(
    () => [
      {
        accessorKey: 'code',
        header: 'Mã code',
        cell: ({ row }) => (
          <span className='font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-md'>
            {row.original.code}
          </span>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Tiêu đề',
        cell: ({ row }) => (
          <div className='max-w-65'>
            <p className='text-sm font-medium text-text-main truncate'>
              {row.original.title}
            </p>
            <p className='text-[11px] text-text-sub'>
              v{row.original.policyVersion}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'effectiveFrom',
        header: 'Ngày hiệu lực',
        cell: ({ row }) => (
          <span className='text-xs text-text-main'>
            {formatDate(row.original.effectiveFrom)}
          </span>
        ),
      },
      {
        accessorKey: 'pdfUrl',
        header: 'PDF',
        cell: ({ row }) =>
          row.original.pdfUrl ? (
            <span className='inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400'>
              <CheckCircle2 className='w-3.5 h-3.5' />
              Có file
            </span>
          ) : (
            <span className='text-xs text-text-sub italic'>Chưa có</span>
          ),
      },
      {
        accessorKey: 'isActive',
        header: 'Trạng thái',
        cell: ({ row }) =>
          row.original.isActive ? (
            <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-500/30'>
              <CheckCircle2 className='w-3 h-3' />
              Hoạt động
            </span>
          ) : (
            <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium text-gray-600 bg-gray-100 border-gray-200 dark:text-gray-400 dark:bg-white/5 dark:border-white/10'>
              <XCircle className='w-3 h-3' />
              Đã vô hiệu
            </span>
          ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const policy = row.original;
          const isDeactivating = deactivatingId === policy.policyDocumentId;
          return (
            <div className='flex items-center gap-1.5 justify-end'>
              {/* Chỉnh sửa */}
              {policy.isActive && (
                <button
                  type='button'
                  onClick={() => setEditingPolicy(policy)}
                  className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/15 transition-colors'
                  title='Chỉnh sửa'
                >
                  <Pencil className='w-3.5 h-3.5' />
                  Sửa
                </button>
              )}

              {/* Xem PDF */}
              <button
                type='button'
                onClick={() => setPreviewPolicy(policy)}
                className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors'
                title='Xem tài liệu'
              >
                <Eye className='w-3.5 h-3.5' />
                Xem
              </button>

              {/* Vô hiệu hóa */}
              {policy.isActive && (
                <button
                  type='button'
                  onClick={() => handleDeactivate(policy)}
                  disabled={isDeactivating}
                  className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/15 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                  title='Vô hiệu hóa'
                >
                  {isDeactivating ? (
                    <Loader2 className='w-3.5 h-3.5 animate-spin' />
                  ) : (
                    <ShieldOff className='w-3.5 h-3.5' />
                  )}
                  Vô hiệu
                </button>
              )}
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deactivatingId, editingPolicy],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={policies}
        isLoading={isLoading}
        isError={isError}
        errorMessage='Không thể tải danh sách chính sách.'
        emptyMessage='Chưa có chính sách nào.'
        manualPagination
        pageIndex={page}
        pageCount={totalPages}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
        totalRows={totalElements}
        totalLabel='chính sách'
        toolbarLeft={
          <div className='relative'>
            <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-sub' />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Tìm theo tiêu đề, mã code...'
              className='pl-8 pr-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm bg-white dark:bg-white/5 text-text-main outline-none focus:ring-2 focus:ring-indigo-300 w-64 transition-all'
            />
          </div>
        }
        toolbarRight={
          <FilterBar value={activeFilter} onChange={setActiveFilter} />
        }
      />

      {/* PDF Viewer */}
      <PdfViewerDialog
        policy={previewPolicy}
        onClose={() => setPreviewPolicy(null)}
      />

      {/* Edit Dialog */}
      {editingPolicy && (
        <PolicyEditDialog
          policy={editingPolicy}
          isOpen={!!editingPolicy}
          onClose={() => setEditingPolicy(null)}
        />
      )}
    </>
  );
}
