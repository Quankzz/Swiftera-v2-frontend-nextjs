'use client';

import { useState } from 'react';
import { RolesTable } from '@/components/dashboard/roles/roles-table';
import {
  RoleDeleteDialog,
  RoleFormDialog,
} from '@/components/dashboard/roles/roles-dialogs';
import { RolePermissionsDialog } from '@/components/dashboard/roles/roles-permissions-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Role } from '@/types/dashboard';

export default function RolesPage() {
  const [dialogRole, setDialogRole] = useState<Role | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isPermissionsOpen, setPermissionsOpen] = useState(false);

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
          <Button
            size='lg'
            className='bg-theme-primary-start hover:opacity-90 transition-opacity'
            onClick={() => {
              setDialogRole(null);
              setFormOpen(true);
            }}
          >
            <Plus className='mr-2 h-4 w-4' /> Thêm vai trò
          </Button>
        </div>
      </div>

      <div className='w-full'>
        <RolesTable
          onEdit={(role) => {
            setDialogRole(role);
            setFormOpen(true);
          }}
          onDelete={(role) => {
            setDialogRole(role);
            setDeleteOpen(true);
          }}
          onAssignPermissions={(role) => {
            setDialogRole(role);
            setPermissionsOpen(true);
          }}
        />
      </div>

      <RoleFormDialog
        open={isFormOpen}
        initialRole={dialogRole}
        onClose={() => setFormOpen(false)}
      />

      <RoleDeleteDialog
        open={isDeleteOpen}
        role={dialogRole}
        onClose={() => setDeleteOpen(false)}
      />

      <RolePermissionsDialog
        open={isPermissionsOpen}
        role={dialogRole}
        onClose={() => setPermissionsOpen(false)}
      />
    </div>
  );
}
