import { PermissionsBoard } from '@/components/dashboard/permissions/permissions-board';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function PermissionsPage() {
  return (
    <div className='flex flex-col gap-6 w-full p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight text-text-main'>
            Cấu hình phân quyền (Permissions)
          </h2>
          <p className='text-text-sub mt-1 text-sm'>
            Quản lý các quyền API của hệ thống. Bạn có thể kéo thả để nhóm các
            quyền vào từng Module tương ứng.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button className='bg-theme-primary-start hover:opacity-90 transition-opacity'>
            <Plus className='mr-2 h-4 w-4' /> Thêm quyền mới
          </Button>
        </div>
      </div>

      <div className='w-full'>
        <PermissionsBoard />
      </div>
    </div>
  );
}
