'use client';

import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/dashboard/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { RoleResponse } from '@/features/roles/types';
import { useRolesListQuery } from '@/features/roles/hooks/use-roles';
import { Pencil, Trash2, ShieldCheck } from 'lucide-react';

type RolesTableProps = {
  onEdit?: (role: RoleResponse) => void;
  onDelete?: (role: RoleResponse) => void;
  onAssignPermissions?: (role: RoleResponse) => void;
};

export function RolesTable({
  onEdit,
  onDelete,
  onAssignPermissions,
}: RolesTableProps) {
  const [page, setPage] = useState(0); // BE uses 0-based page
  const [size] = useState(10);

  const { data, isLoading, isError } = useRolesListQuery({ page, size });
  const total = data?.meta?.totalElements ?? 0;
  const roles = data?.content ?? [];
  const totalPages =
    data?.meta?.totalPages ?? Math.max(1, Math.ceil(total / size));

  const columns = useMemo<ColumnDef<RoleResponse>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Tên vai trò',
        cell: ({ getValue }) => (
          <span className='font-semibold text-text-main'>
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Mô tả',
        enableSorting: false,
        cell: ({ getValue }) => {
          const val = getValue() as string | null;
          return val ? (
            <span className='text-text-sub text-sm line-clamp-2'>{val}</span>
          ) : (
            <span className='italic text-text-sub opacity-40 text-sm'>
              Không có mô tả
            </span>
          );
        },
      },
      {
        accessorKey: 'active',
        header: 'Trạng thái',
        cell: ({ getValue }) =>
          getValue() ? (
            <Badge
              variant='outline'
              className='bg-green-50 text-green-700 border-green-200 text-xs'
            >
              Đang hoạt động
            </Badge>
          ) : (
            <Badge
              variant='outline'
              className='bg-gray-100 text-gray-500 border-gray-200 text-xs'
            >
              Đã khóa
            </Badge>
          ),
      },
      {
        id: 'actions',
        header: () => <div className='text-right pr-1'>Thao tác</div>,
        enableSorting: false,
        cell: ({ row }) => (
          <div className='flex items-center justify-start gap-1'>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7 text-text-sub bg-olive-100 hover:text-blue-600 hover:bg-blue-50'
              onClick={() => onAssignPermissions?.(row.original)}
              title='Phân quyền'
            >
              <ShieldCheck size={14} />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7 text-text-sub hover:text-theme-primary-start bg-olive-100'
              onClick={() => onEdit?.(row.original)}
              title='Chỉnh sửa'
            >
              <Pencil size={14} />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7 text-theme-primary-start hover:text-theme-primary-end hover:bg-red-50'
              onClick={() => onDelete?.(row.original)}
              title='Xóa'
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete, onAssignPermissions],
  );

  return (
    <DataTable
      columns={columns}
      data={roles}
      searchPlaceholder='Tìm theo tên vai trò...'
      searchColumn='name'
      totalLabel='vai trò'
      isLoading={isLoading}
      isError={isError}
      errorMessage='Không thể tải dữ liệu vai trò. Vui lòng thử lại sau.'
      emptyMessage='Không tìm thấy vai trò nào'
      manualPagination
      pageIndex={page}
      pageCount={totalPages}
      onPageChange={(p) => setPage(p)}
      pageSize={size}
      totalRows={total}
    />
  );
}
