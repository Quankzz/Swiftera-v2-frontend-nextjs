'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/dashboard/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { UserResponse } from '@/features/users/types';
import { useUsersQuery } from '@/features/users/hooks/use-user-management';
import { Pencil, Trash2, Shield } from 'lucide-react';

type UsersTableProps = {
  onEdit?: (user: UserResponse) => void;
  onDelete?: (user: UserResponse) => void;
};

/** Helper: build display name from firstName + lastName */
function displayName(user: UserResponse): string {
  return (
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
  );
}

function AvatarCell({ user }: { user: UserResponse }) {
  const name = displayName(user);
  return (
    <div className='flex items-center gap-3'>
      <div className='w-8 h-8 rounded-full bg-gray-100 dark:bg-white/8 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200 dark:border-white/8'>
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={name}
            width={32}
            height={32}
            className='w-full h-full object-cover'
            unoptimized
          />
        ) : (
          <span className='text-xs font-bold text-theme-primary-start'>
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className='min-w-0'>
        <p className='font-medium text-text-main leading-none truncate'>
          {name}
        </p>
      </div>
    </div>
  );
}

export function UsersTable({ onEdit, onDelete }: UsersTableProps) {
  const [page, setPage] = useState(0); // BE uses 0-based page
  const [size] = useState(10);

  const { data, isLoading, isError } = useUsersQuery({ page, size });

  const total = data?.meta?.totalElements ?? 0;
  const users = data?.content ?? [];
  const totalPages =
    data?.meta?.totalPages ?? Math.max(1, Math.ceil(total / size));

  const columns = useMemo<ColumnDef<UserResponse>[]>(
    () => [
      {
        id: 'displayName',
        header: 'Người dùng',
        accessorFn: (row) => displayName(row),
        cell: ({ row }) => <AvatarCell user={row.original} />,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ getValue }) => (
          <span className='text-text-sub text-sm'>{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'phoneNumber',
        header: 'Số điện thoại',
        enableSorting: false,
        cell: ({ getValue }) => {
          const val = getValue() as string | null;
          return val ? (
            <span className='text-text-sub text-sm'>{val}</span>
          ) : (
            <span className='italic text-text-sub opacity-40 text-sm'>
              Trống
            </span>
          );
        },
      },
      {
        accessorKey: 'isVerified',
        header: 'Trạng thái',
        cell: ({ getValue }) =>
          getValue() ? (
            <Badge
              variant='outline'
              className='bg-green-50 text-green-700 border-green-200 text-xs'
            >
              Đã xác minh
            </Badge>
          ) : (
            <Badge
              variant='outline'
              className='bg-orange-50 text-orange-600 border-orange-200 text-xs'
            >
              Chưa xác minh
            </Badge>
          ),
      },
      {
        id: 'roles',
        header: 'Vai trò',
        enableSorting: false,
        cell: ({ row }) => {
          // List endpoint trả roles[] (RoleSummary), detail trả rolesSecured[]
          const roles = row.original.roles ?? row.original.rolesSecured ?? [];
          if (roles.length === 0)
            return (
              <span className='italic text-text-sub opacity-40 text-sm'>
                Chưa có
              </span>
            );

          // Priority order — highest first
          const PRIORITY: Record<string, number> = {
            admin: 0,
            'quản trị': 0,
            manager: 1,
            'quản lý': 1,
            user: 2,
            'người dùng': 2,
            guest: 3,
            khách: 3,
          };
          const rank = (name: string) => PRIORITY[name.toLowerCase()] ?? 99;

          const sorted = [...roles].sort((a, b) => rank(a.name) - rank(b.name));
          const top = sorted[0];
          const rest = sorted.length - 1;

          return (
            <div className='flex items-center gap-1 flex-nowrap'>
              <span className='inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 px-2 py-0.5 text-xs text-blue-700 dark:text-blue-300 font-medium whitespace-nowrap'>
                <Shield size={10} className='shrink-0' />
                {top.name}
              </span>
              {rest > 0 && (
                <span
                  title={sorted
                    .slice(1)
                    .map((r) => r.name)
                    .join(', ')}
                  className='inline-flex items-center rounded-full bg-gray-100 dark:bg-white/8 border border-gray-200 dark:border-white/8 px-2 py-0.5 text-xs text-gray-500 font-medium whitespace-nowrap cursor-default shrink-0'
                >
                  +{rest}
                </span>
              )}
            </div>
          );
        },
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
    [onEdit, onDelete],
  );

  return (
    <DataTable
      columns={columns}
      data={users}
      searchPlaceholder='Tìm theo tên...'
      searchColumn='displayName'
      totalLabel='người dùng'
      isLoading={isLoading}
      isError={isError}
      errorMessage='Không thể tải dữ liệu người dùng. Vui lòng thử lại sau.'
      emptyMessage='Không tìm thấy người dùng nào'
      manualPagination
      pageIndex={page}
      pageCount={totalPages}
      onPageChange={(p) => setPage(p)}
      pageSize={size}
      totalRows={total}
    />
  );
}
