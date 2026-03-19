'use client';

import { useRoles } from '@/hooks/api/use-dashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function RolesTable() {
  const { data, isLoading, isError } = useRoles(1, 10);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center py-10'>
        <span className='text-text-sub animate-pulse'>
          Đang tải dữ liệu vai trò...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='bg-red-50 text-theme-primary-start p-4 rounded-md'>
        Không thể tải dữ liệu vai trò. Vui lòng thử lại sau.
      </div>
    );
  }

  const roles = data?.data || [];

  return (
    <div className='space-y-4'>
      <div className='rounded-md border border-gray-200 bg-white overflow-hidden shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th className='px-6 py-3 font-semibold text-text-main'>
                  Tên vai trò
                </th>
                <th className='px-6 py-3 font-semibold text-text-main'>
                  Mô tả
                </th>
                <th className='px-6 py-3 font-semibold text-text-main'>
                  Trạng thái
                </th>
                <th className='px-6 py-3 font-semibold text-text-main text-right'>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {roles.length > 0 ? (
                roles.map((role) => (
                  <tr
                    key={role.roleId}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-6 py-4 font-medium text-text-main'>
                      {role.name}
                    </td>
                    <td
                      className='px-6 py-4 text-text-sub max-w-[300px] truncate'
                      title={role.description || ''}
                    >
                      {role.description || (
                        <span className='italic opacity-50'>
                          Không có mô tả
                        </span>
                      )}
                    </td>
                    <td className='px-6 py-4'>
                      {role.isActive ? (
                        <Badge
                          variant='outline'
                          className='bg-green-50 text-green-700 border-green-200'
                        >
                          Đang hoạt động
                        </Badge>
                      ) : (
                        <Badge
                          variant='outline'
                          className='bg-gray-100 text-gray-500 border-gray-200'
                        >
                          Đã khóa
                        </Badge>
                      )}
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-text-sub hover:text-theme-primary-start mr-2'
                      >
                        Phân quyền
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-text-sub hover:text-theme-primary-start mr-2'
                      >
                        Sửa
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-red-500 hover:text-red-700 hover:bg-red-50'
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className='px-6 py-10 text-center text-text-sub'
                  >
                    Không tìm thấy dữ liệu vai trò
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Placeholder */}
      <div className='flex justify-between items-center text-sm text-text-sub'>
        <span>
          Hiển thị {roles.length} trên tổng {data?.total || 0} vai trò
        </span>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' disabled>
            Trước
          </Button>
          <Button variant='outline' size='sm' disabled>
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}
