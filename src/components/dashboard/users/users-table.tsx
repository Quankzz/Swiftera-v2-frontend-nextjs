'use client';

import Image from 'next/image';
import { useUsers } from '@/hooks/api/use-dashboard';
import { Badge } from '@/components/ui/badge'; // Swiftera has badge
import { Button } from '@/components/ui/button'; // Swiftera has button

export function UsersTable() {
  const { data, isLoading, isError } = useUsers(1, 10);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center py-10'>
        <span className='text-text-sub animate-pulse'>
          Đang tải dữ liệu người dùng...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='bg-red-50 text-theme-primary-start p-4 rounded-md'>
        Không thể tải dữ liệu người dùng. Vui lòng thử lại sau.
      </div>
    );
  }

  const users = data?.data || [];

  return (
    <div className='space-y-4'>
      <div className='rounded-md border border-gray-200 bg-white overflow-hidden shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th className='px-6 py-3 font-semibold text-text-main'>
                  Người dùng
                </th>
                <th className='px-6 py-3 font-semibold text-text-main'>
                  Email
                </th>
                <th className='px-6 py-3 font-semibold text-text-main'>
                  Số điện thoại
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
              {users.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user.userId}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0 border border-gray-300'>
                          {user.avatarUrl ? (
                            <Image
                              src={user.avatarUrl}
                              alt={user.fullName}
                              width={32}
                              height={32}
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <span className='text-text-sub font-medium'>
                              {user.fullName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className='font-medium text-text-main'>
                          {user.fullName}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4 text-text-sub'>{user.email}</td>
                    <td className='px-6 py-4 text-text-sub'>
                      {user.phoneNumber || (
                        <span className='italic opacity-50'>Trống</span>
                      )}
                    </td>
                    <td className='px-6 py-4'>
                      {user.isVerified ? (
                        <Badge
                          variant='outline'
                          className='bg-green-50 text-green-700 border-green-200'
                        >
                          Đã xác minh
                        </Badge>
                      ) : (
                        <Badge
                          variant='outline'
                          className='bg-orange-50 text-orange-700 border-orange-200'
                        >
                          Chưa xác minh
                        </Badge>
                      )}
                    </td>
                    <td className='px-6 py-4 text-right'>
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
                    colSpan={5}
                    className='px-6 py-10 text-center text-text-sub'
                  >
                    Không tìm thấy người dùng nào
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
          Hiển thị {users.length} trên tổng {data?.total || 0} người dùng
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
