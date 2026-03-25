'use client';

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  searchColumn?: string;
  totalLabel?: string;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  /** Nếu true: server-side pagination, truyền vào page/setPage/totalPages từ bên ngoài */
  manualPagination?: boolean;
  pageIndex?: number;
  pageCount?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  totalRows?: number;
  /** Thanh toolbar bên phải */
  toolbarRight?: React.ReactNode;
}

function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (sorted === 'asc')
    return <ChevronUp size={14} className='text-theme-primary-start' />;
  if (sorted === 'desc')
    return <ChevronDown size={14} className='text-theme-primary-start' />;
  return <ChevronsUpDown size={13} className='text-text-sub opacity-50' />;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = 'Tìm kiếm...',
  searchColumn,
  totalLabel = 'bản ghi',
  isLoading,
  isError,
  errorMessage = 'Không thể tải dữ liệu. Vui lòng thử lại sau.',
  emptyMessage = 'Không có dữ liệu',
  manualPagination = false,
  pageIndex = 0,
  pageCount,
  onPageChange,
  pageSize = 10,
  totalRows,
  toolbarRight,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      ...(manualPagination ? { pagination: { pageIndex, pageSize } } : {}),
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(manualPagination
      ? { manualPagination: true, pageCount: pageCount ?? -1 }
      : { getPaginationRowModel: getPaginationRowModel() }),
    initialState: { pagination: { pageSize } },
  });

  const currentPage = manualPagination
    ? pageIndex
    : table.getState().pagination.pageIndex;
  const totalPageCount = manualPagination
    ? (pageCount ?? 1)
    : table.getPageCount();

  const handlePrev = () => {
    if (manualPagination) onPageChange?.(currentPage - 1);
    else table.previousPage();
  };
  const handleNext = () => {
    if (manualPagination) onPageChange?.(currentPage + 1);
    else table.nextPage();
  };
  const canPrev = manualPagination
    ? currentPage > 0
    : table.getCanPreviousPage();
  const canNext = manualPagination
    ? currentPage < totalPageCount - 1
    : table.getCanNextPage();

  return (
    <div className='space-y-3'>
      {/* Toolbar */}
      <div className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-white/8 bg-white dark:bg-[#1a1a1f] px-4 py-3 shadow-sm'>
        <div className='flex items-center gap-2 flex-1 min-w-0'>
          {searchColumn && (
            <div className='relative max-w-xs w-full'>
              <Search
                size={14}
                className='absolute left-3 top-1/2 -translate-y-1/2 text-text-sub pointer-events-none'
              />
              <Input
                placeholder={searchPlaceholder}
                value={
                  (table.getColumn(searchColumn)?.getFilterValue() as string) ??
                  ''
                }
                onChange={(e) =>
                  table.getColumn(searchColumn)?.setFilterValue(e.target.value)
                }
                className='pl-9'
              />
            </div>
          )}
          {/* Sortable columns quick-sort buttons */}
          {sorting.length > 0 && (
            <button
              className='flex items-center gap-1 text-xs text-theme-primary-start border border-theme-primary-start/30 rounded-full px-2.5 py-1 hover:bg-theme-primary-start/5 transition-colors'
              onClick={() => setSorting([])}
              title='Xóa sắp xếp'
            >
              <ChevronsUpDown size={11} />
              {sorting[0].id}: {sorting[0].desc ? '↓ Z→A' : '↑ A→Z'}
              <span className='ml-0.5 opacity-60'>✕</span>
            </button>
          )}
        </div>
        <div className='flex items-center gap-3'>
          {toolbarRight}
          <span className='text-sm text-text-sub whitespace-nowrap'>
            Tổng{' '}
            <span className='font-semibold text-text-main'>
              {manualPagination
                ? (totalRows ?? data.length)
                : table.getFilteredRowModel().rows.length}
            </span>{' '}
            {totalLabel}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className='rounded-xl border border-gray-200 dark:border-white/8 bg-white dark:bg-[#1a1a1f] overflow-hidden shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left'>
            <thead className='bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/8'>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        'px-4 py-3 text-xs font-semibold text-text-sub uppercase tracking-wider select-none',
                        header.column.getCanSort() &&
                          'cursor-pointer hover:text-text-main transition-colors',
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder ? null : (
                        <div className='flex items-center gap-1.5'>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {header.column.getCanSort() && (
                            <SortIcon sorted={header.column.getIsSorted()} />
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className='divide-y divide-gray-100 dark:divide-white/5'>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className='px-4 py-12 text-center'
                  >
                    <div className='flex flex-col items-center gap-2'>
                      <div className='h-6 w-6 rounded-full border-2 border-theme-primary-start border-t-transparent animate-spin' />
                      <span className='text-sm text-text-sub animate-pulse'>
                        Đang tải dữ liệu...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className='px-4 py-10 text-center'
                  >
                    <div className='inline-flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-2 text-sm text-theme-primary-start'>
                      {errorMessage}
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className='px-4 py-12 text-center text-text-sub'
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className='hover:bg-gray-50 dark:hover:bg-white/5 transition-colors'
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className='px-4 py-3.5'>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className='flex flex-wrap items-center justify-between gap-3 text-sm text-text-sub'>
        <span>
          Trang{' '}
          <span className='font-semibold text-text-main'>
            {currentPage + 1}
          </span>
          {' / '}
          <span className='font-semibold text-text-main'>{totalPageCount}</span>
        </span>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            disabled={!canPrev}
            onClick={handlePrev}
            className='gap-1'
          >
            <ChevronLeft size={14} /> Trước
          </Button>
          <Button
            variant='outline'
            size='sm'
            disabled={!canNext}
            onClick={handleNext}
            className='gap-1'
          >
            Sau <ChevronRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
