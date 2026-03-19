import { RolesTable } from '@/components/dashboard/roles/roles-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function RolesPage() {
  return (
    <div className='flex flex-col gap-6 w-full p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight text-text-main'>
            Quản lý vai trò
          </h2>
          <p className='text-text-sub mt-1 text-sm'>
            Xem, thêm mới, sửa, và phân quyền chi tiết cho các vai trò
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button className='bg-theme-primary-start hover:opacity-90 transition-opacity'>
            <Plus className='mr-2 h-4 w-4' /> Thêm vai trò
          </Button>
        </div>
      </div>

      <div className='w-full'>
        <RolesTable />
      </div>
    </div>
  );
}
