'use client';

import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/dashboard/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Role } from '@/types/dashboard';
import { useRolesQuery } from '@/hooks/api/use-roles';
import { Pencil, Trash2, ShieldCheck } from 'lucide-react';

type RolesTableProps = {
  onEdit?: (role: Role) => void;
  onDelete?: (role: Role) => void;
  onAssignPermissions?: (role: Role) => void;
};

export function RolesTable({
  onEdit,
  onDelete,
  onAssignPermissions,
}: RolesTableProps) {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isLoading, isError } = useRolesQuery({ page, limit });
  const total = data?.total ?? 0;
  const roles = data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const columns = useMemo<ColumnDef<Role>[]>(
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
        accessorKey: 'isActive',
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
      pageIndex={page - 1}
      pageCount={totalPages}
      onPageChange={(p) => setPage(p + 1)}
      pageSize={limit}
      totalRows={total}
    />
  );
}
