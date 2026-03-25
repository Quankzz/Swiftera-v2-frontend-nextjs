'use client';

import { useState } from 'react';
import { UsersTable } from '@/components/dashboard/users/users-table';
import {
  UserDeleteDialog,
  UserFormDialog,
} from '@/components/dashboard/users/users-dialogs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { User } from '@/types/dashboard';

export default function UsersPage() {
  const [dialogUser, setDialogUser] = useState<User | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);

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
          <Button
            size='lg'
            className='bg-theme-primary-start hover:opacity-90 transition-opacity text-white'
            onClick={() => {
              setDialogUser(null);
              setFormOpen(true);
            }}
          >
            <Plus className='mr-2 h-4 w-4' /> Thêm người dùng
          </Button>
        </div>
      </div>

      <div className='w-full'>
        <UsersTable
          onEdit={(user: User) => {
            setDialogUser(user);
            setFormOpen(true);
          }}
          onDelete={(user: User) => {
            setDialogUser(user);
            setDeleteOpen(true);
          }}
        />
      </div>

      <UserFormDialog
        open={isFormOpen}
        initialUser={dialogUser}
        onClose={() => setFormOpen(false)}
      />

      <UserDeleteDialog
        open={isDeleteOpen}
        user={dialogUser}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
}
