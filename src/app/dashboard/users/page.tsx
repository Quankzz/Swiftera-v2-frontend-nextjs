import { UsersTable } from '@/components/dashboard/users/users-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react'; // Let's assume lucide-react is installed since it's a NextJS common standard

export default function UsersPage() {
  return (
    <div className='flex flex-col gap-6 w-full p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight text-text-main'>
            Quản lý người dùng
          </h2>
          <p className='text-text-sub mt-1 text-sm'>
            Xem, thêm mới, sửa hoặc xóa thông tin người dùng trong hệ thống
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button className='bg-theme-primary-start hover:opacity-90 transition-opacity'>
            <Plus className='mr-2 h-4 w-4' /> Thêm người dùng
          </Button>
        </div>
      </div>

      <div className='w-full'>
        <UsersTable />
      </div>
    </div>
  );
}
