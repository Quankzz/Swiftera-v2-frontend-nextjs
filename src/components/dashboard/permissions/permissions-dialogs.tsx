'use client';

import { startTransition, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useCreatePermissionMutation,
  useCreateModuleMutation,
  useRenameModuleMutation,
  useDeleteModuleMutation,
  useDeletePermissionMutation,
  useModulesQuery,
  usePermissionQuery,
  useUpdatePermissionMutation,
} from '@/hooks/api/use-permissions';
import {
  CreatePermissionInput,
  Permission,
  UpdatePermissionInput,
} from '@/types/dashboard';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

interface PermissionFormDialogProps {
  open: boolean;
  onClose: () => void;
  initialPermission?: Permission | null;
  presetModule?: string;
}

export function PermissionFormDialog({
  open,
  onClose,
  initialPermission,
  presetModule,
}: PermissionFormDialogProps) {
  const isEdit = !!initialPermission;
  const { data: permissionDetail, isFetching } = usePermissionQuery(
    initialPermission?.permissionId,
  );
  const { data: moduleOptions } = useModulesQuery();

  const [formState, setFormState] = useState(() => ({
    name: initialPermission?.name || '',
    apiPath: initialPermission?.apiPath || '',
    method: initialPermission?.method || 'GET',
    module: initialPermission?.module || presetModule || '',
  }));

  useEffect(() => {
    if (!open) return;
    if (!isEdit) {
      startTransition(() =>
        setFormState({
          name: '',
          apiPath: '',
          method: 'GET',
          module: presetModule || '',
        }),
      );
      return;
    }
    if (permissionDetail) {
      startTransition(() =>
        setFormState({
          name: permissionDetail.name,
          apiPath: permissionDetail.apiPath,
          method: permissionDetail.method,
          module: permissionDetail.module,
        }),
      );
    }
  }, [
    open,
    isEdit,
    permissionDetail,
    initialPermission?.permissionId,
    presetModule,
  ]);

  const createMutation = useCreatePermissionMutation();
  const updateMutation = useUpdatePermissionMutation();

  const handleSubmit = async () => {
    if (!formState.name.trim() || !formState.apiPath.trim()) return;

    const payload: CreatePermissionInput | UpdatePermissionInput = {
      name: formState.name.trim(),
      apiPath: formState.apiPath.trim(),
      method: formState.method,
      module: formState.module.trim() || 'Chưa phân loại',
    };

    if (isEdit && initialPermission) {
      await updateMutation.mutateAsync({
        permissionId: initialPermission.permissionId,
        payload,
      });
    } else {
      await createMutation.mutateAsync(payload as CreatePermissionInput);
    }
    onClose();
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog
      key={initialPermission?.permissionId ?? 'new-permission'}
      open={open}
      onOpenChange={(val) => !val && onClose()}
    >
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle className='text-text-main'>
            {isEdit ? 'Chỉnh sửa quyền' : 'Thêm quyền mới'}
          </DialogTitle>
          <DialogDescription>
            Quản lý quyền truy cập API. Các trường có dấu * là bắt buộc.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          {isEdit && isFetching && (
            <div className='text-sm text-text-sub'>
              Đang tải chi tiết quyền...
            </div>
          )}

          <div className='space-y-2'>
            <label className='block text-text-main text-sm font-medium mb-1'>
              Tên quyền *
            </label>
            <Input
              value={formState.name}
              onChange={(e) =>
                setFormState((s) => ({ ...s, name: e.target.value }))
              }
              placeholder='VD: Xem danh sách người dùng'
            />
          </div>

          <div className='grid grid-cols-3 gap-3'>
            <div className='space-y-2'>
              <label className='block text-text-main text-sm font-medium mb-1'>
                Phương thức
              </label>
              <select
                className='w-full rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-[#1a1a1f] px-3 py-2 text-sm text-text-main'
                value={formState.method}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, method: e.target.value }))
                }
              >
                {METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className='col-span-2 space-y-2'>
              <label className='block text-text-main text-sm font-medium mb-1'>
                API Path *
              </label>
              <Input
                value={formState.apiPath}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, apiPath: e.target.value }))
                }
                placeholder='/api/v1/users'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <label className='block text-text-main text-sm font-medium mb-1'>
              Module
            </label>
            <div className='flex gap-2'>
              <select
                className='w-1/2 rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-[#1a1a1f] px-3 py-2 text-sm text-text-main'
                value={formState.module}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, module: e.target.value }))
                }
              >
                <option value=''>-- Chọn module --</option>
                {(moduleOptions || []).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <Input
                value={formState.module}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, module: e.target.value }))
                }
                placeholder='Hoặc nhập module mới'
                className='w-1/2'
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='ghost'
            onClick={onClose}
            className='text-text-sub'
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            className='bg-theme-primary-start hover:opacity-90'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo mới'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface PermissionDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  permission?: Permission | null;
}

export function PermissionDeleteDialog({
  open,
  onClose,
  permission,
}: PermissionDeleteDialogProps) {
  const deleteMutation = useDeletePermissionMutation();

  const handleDelete = async () => {
    if (!permission) return;
    await deleteMutation.mutateAsync(permission.permissionId);
    onClose();
  };

  const isSubmitting = deleteMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-text-main'>Xóa quyền</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa quyền{' '}
            <span className='font-semibold text-text-main'>
              {permission?.name}
            </span>
            ? Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant='ghost'
            onClick={onClose}
            className='text-text-sub'
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={isSubmitting}
            className='bg-theme-primary-start hover:bg-theme-primary-end text-white'
          >
            {isSubmitting ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ModuleFormDialogProps {
  open: boolean;
  onClose: () => void;
  initialModuleName?: string | null;
}

export function ModuleFormDialog({
  open,
  onClose,
  initialModuleName,
}: ModuleFormDialogProps) {
  const isEdit = !!initialModuleName;
  const createModuleMutation = useCreateModuleMutation();
  const renameModuleMutation = useRenameModuleMutation();
  const [moduleName, setModuleName] = useState('');

  useEffect(() => {
    if (open) startTransition(() => setModuleName(initialModuleName || ''));
  }, [open, initialModuleName]);

  const handleSubmit = async () => {
    if (!moduleName.trim()) return;
    if (isEdit && initialModuleName) {
      await renameModuleMutation.mutateAsync({
        oldName: initialModuleName,
        newName: moduleName.trim(),
      });
    } else {
      await createModuleMutation.mutateAsync(moduleName.trim());
    }
    onClose();
    setModuleName('');
  };

  const isSubmitting =
    createModuleMutation.isPending || renameModuleMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-text-main'>
            {isEdit ? 'Sửa tên module' : 'Thêm Module'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Đổi tên module. Các quyền bên trong sẽ được cập nhật theo.'
              : 'Tạo module để nhóm các quyền liên quan.'}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-2'>
          <label className='block text-text-main text-sm font-medium mb-1'>
            Tên module
          </label>
          <Input
            value={moduleName}
            onChange={(e) => setModuleName(e.target.value)}
            placeholder='VD: Products'
          />
        </div>

        <DialogFooter>
          <Button
            variant='ghost'
            onClick={onClose}
            className='text-text-sub'
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            className='bg-theme-primary-start hover:opacity-90'
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Đang lưu...'
              : isEdit
                ? 'Lưu thay đổi'
                : 'Tạo module'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ModuleDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  moduleName?: string | null;
}

export function ModuleDeleteDialog({
  open,
  onClose,
  moduleName,
}: ModuleDeleteDialogProps) {
  const deleteModuleMutation = useDeleteModuleMutation();

  const handleDelete = async () => {
    if (!moduleName) return;
    await deleteModuleMutation.mutateAsync(moduleName);
    onClose();
  };

  const isSubmitting = deleteModuleMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-text-main'>Xóa module</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa module{' '}
            <span className='font-semibold text-text-main'>{moduleName}</span>?{' '}
            Các quyền bên trong sẽ được chuyển về{' '}
            <span className='font-semibold'>Chưa phân loại</span>.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant='ghost'
            onClick={onClose}
            className='text-text-sub'
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={isSubmitting}
            className='bg-theme-primary-start hover:bg-theme-primary-end text-white'
          >
            {isSubmitting ? 'Đang xóa...' : 'Xóa module'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
