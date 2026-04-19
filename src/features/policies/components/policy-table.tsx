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
  Loader2,
  Eye,
  BookOpen,
  X,
  ExternalLink,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
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
  useActivatePolicyMutation,
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
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const activateMutation = useActivatePolicyMutation();
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

  // ── Toggle active/inactive ─────────────────────────────────────────────────
  const handleToggle = async (policy: PolicyDocumentResponse) => {
    setTogglingId(policy.policyDocumentId);
    try {
      if (policy.isActive) {
        await deactivateMutation.mutateAsync(policy.policyDocumentId);
        toast.success(`Đã vô hiệu hóa "${policy.title}".`);
      } else {
        await activateMutation.mutateAsync(policy.policyDocumentId);
        toast.success(`Đã kích hoạt "${policy.title}".`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Thay đổi trạng thái thất bại.');
    } finally {
      setTogglingId(null);
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
        cell: ({ row }) => {
          const policy = row.original;
          const isToggling = togglingId === policy.policyDocumentId;
          return (
            <div className='flex items-center gap-2'>
              <Switch
                checked={policy.isActive}
                disabled={isToggling}
                onCheckedChange={() => handleToggle(policy)}
                className={cn(
                  'data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-gray-200',
                  isToggling && 'opacity-50 cursor-not-allowed',
                )}
              />
              {isToggling && (
                <Loader2 className='w-3.5 h-3.5 animate-spin text-gray-400' />
              )}
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const policy = row.original;
          const isToggling = togglingId === policy.policyDocumentId;
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
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [togglingId, editingPolicy],
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
