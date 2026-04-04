'use client';

import { useState, useMemo } from 'react';
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
import { Badge } from '@/components/ui/badge';
import type { RoleResponse } from '@/features/roles/types';
import {
  usePermissionsListQuery,
  useModulesQuery,
  useUpdateRoleMutation,
  useRoleDetailQuery,
} from '@/features/roles/hooks/use-roles';
import { Search, ShieldCheck, ShieldOff } from 'lucide-react';

interface RolePermissionsDialogProps {
  open: boolean;
  onClose: () => void;
  role?: RoleResponse | null;
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-green-100 text-green-700',
  POST: 'bg-orange-100 text-orange-700',
  PUT: 'bg-blue-100 text-blue-700',
  PATCH: 'bg-violet-100 text-violet-700',
  DELETE: 'bg-red-100 text-red-700',
};

// ─── Inner component — re-mounts when role changes, so state init is safe ───

interface InnerProps {
  role: RoleResponse;
  initialSelected: string[];
  onClose: () => void;
}

function PermissionsInner({ role, initialSelected, onClose }: InnerProps) {
  const { data: allPermsData, isLoading: isLoadingPerms } =
    usePermissionsListQuery({ size: 1000 });
  const { data: modules } = useModulesQuery();
  const updateRoleMutation = useUpdateRoleMutation();

  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialSelected),
  );
  const [search, setSearch] = useState('');
  const [activeModule, setActiveModule] = useState<string>('');

  const allPerms = useMemo(() => allPermsData?.content ?? [], [allPermsData]);

  const filteredPerms = useMemo(
    () =>
      allPerms.filter((p) => {
        const matchModule = !activeModule || p.module === activeModule;
        const matchSearch =
          !search ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.apiPath.toLowerCase().includes(search.toLowerCase());
        return matchModule && matchSearch;
      }),
    [allPerms, activeModule, search],
  );

  const allModules = useMemo(() => {
    const fromPerms = [...new Set(allPerms.map((p) => p.module))] as string[];
    return (modules as string[] | undefined) ?? fromPerms;
  }, [allPerms, modules]);

  const togglePermission = (permId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  };

  const toggleModule = (moduleName: string) => {
    const modulePerms = allPerms.filter((p) => p.module === moduleName);
    const allChecked = modulePerms.every((p) => selected.has(p.permissionId));
    setSelected((prev) => {
      const next = new Set(prev);
      modulePerms.forEach((p) => {
        if (allChecked) next.delete(p.permissionId);
        else next.add(p.permissionId);
      });
      return next;
    });
  };

  const handleSave = async () => {
    await updateRoleMutation.mutateAsync({
      roleId: role.roleId,
      payload: { permissionIds: Array.from(selected) },
    });
    onClose();
  };

  const isLoading = isLoadingPerms;
  const isSubmitting = updateRoleMutation.isPending;
  const selectedCount = selected.size;
  const totalCount = allPerms.length;

  return (
    <>
      {/* Stats bar */}
      <div className='flex items-center justify-between rounded-lg bg-gray-50 dark:bg-white/5 px-4 py-2.5 border border-gray-200 dark:border-white/8'>
        <div className='flex items-center gap-2 text-sm'>
          <ShieldCheck size={14} className='text-green-600' />
          <span className='text-text-sub'>
            Đã chọn:{' '}
            <span className='font-semibold text-text-main'>
              {selectedCount}
            </span>
            {' / '}
            <span className='font-semibold text-text-main'>
              {totalCount}
            </span>{' '}
            quyền
          </span>
        </div>
        <Button
          variant='ghost'
          size='sm'
          className='text-xs text-text-sub h-7'
          onClick={() => setSelected(new Set())}
        >
          <ShieldOff size={12} className='mr-1' />
          Bỏ chọn tất cả
        </Button>
      </div>

      {/* Search + Module tabs */}
      <div className='flex flex-col gap-2'>
        <div className='relative'>
          <Search
            size={14}
            className='absolute left-3 top-1/2 -translate-y-1/2 text-text-sub'
          />
          <Input
            placeholder='Tìm kiếm quyền...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-9'
          />
        </div>
        <div className='flex flex-wrap gap-1.5'>
          <button
            onClick={() => setActiveModule('')}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeModule === ''
                ? 'bg-theme-primary-start text-white'
                : 'bg-gray-100 dark:bg-white/8 text-text-sub hover:bg-gray-200 dark:hover:bg-white/12'
            }`}
          >
            Tất cả
          </button>
          {allModules.map((m) => {
            const modulePerms = allPerms.filter((p) => p.module === m);
            const selectedInModule = modulePerms.filter((p) =>
              selected.has(p.permissionId),
            ).length;
            return (
              <button
                key={m}
                onClick={() => setActiveModule(m === activeModule ? '' : m)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeModule === m
                    ? 'bg-theme-primary-start text-white'
                    : 'bg-gray-100 dark:bg-white/8 text-text-sub hover:bg-gray-200 dark:hover:bg-white/12'
                }`}
              >
                {m}
                {selectedInModule > 0 && (
                  <span
                    className={`rounded-full h-4 w-4 text-[10px] flex items-center justify-center font-bold ${
                      activeModule === m
                        ? 'bg-white/30'
                        : 'bg-theme-primary-start/20 text-theme-primary-start'
                    }`}
                  >
                    {selectedInModule}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Permissions list */}
      <div className='flex-1 overflow-y-auto min-h-0 rounded-lg border border-gray-200 dark:border-white/8'>
        {isLoading ? (
          <div className='flex items-center justify-center py-10'>
            <div className='h-5 w-5 rounded-full border-2 border-theme-primary-start border-t-transparent animate-spin' />
          </div>
        ) : filteredPerms.length === 0 ? (
          <div className='py-10 text-center text-sm text-text-sub'>
            Không tìm thấy quyền nào
          </div>
        ) : (
          <div className='divide-y divide-gray-100 dark:divide-white/5'>
            {allModules
              .filter((m) => !activeModule || m === activeModule)
              .map((moduleName) => {
                const modulePerms = filteredPerms.filter(
                  (p) => p.module === moduleName,
                );
                if (modulePerms.length === 0) return null;
                const allChecked = modulePerms.every((p) =>
                  selected.has(p.permissionId),
                );
                const someChecked = modulePerms.some((p) =>
                  selected.has(p.permissionId),
                );

                return (
                  <div key={moduleName}>
                    <div className='flex items-center gap-3 bg-gray-50 dark:bg-white/5 px-4 py-2.5 sticky top-0'>
                      <input
                        type='checkbox'
                        className='h-4 w-4 accent-theme-primary-start cursor-pointer'
                        checked={allChecked}
                        ref={(el) => {
                          if (el) el.indeterminate = someChecked && !allChecked;
                        }}
                        onChange={() => toggleModule(moduleName)}
                      />
                      <span className='text-xs font-bold text-text-main uppercase tracking-wider'>
                        {moduleName}
                      </span>
                      <span className='text-xs text-text-sub ml-auto'>
                        {
                          modulePerms.filter((p) =>
                            selected.has(p.permissionId),
                          ).length
                        }
                        /{modulePerms.length}
                      </span>
                    </div>
                    {modulePerms.map((perm) => (
                      <label
                        key={perm.permissionId}
                        className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors'
                      >
                        <input
                          type='checkbox'
                          className='h-4 w-4 accent-theme-primary-start cursor-pointer shrink-0'
                          checked={selected.has(perm.permissionId)}
                          onChange={() => togglePermission(perm.permissionId)}
                        />
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm text-text-main font-medium truncate'>
                            {perm.name}
                          </p>
                          <div className='flex items-center gap-2 mt-0.5'>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                METHOD_COLORS[perm.httpMethod] ??
                                'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {perm.httpMethod}
                            </span>
                            <span className='text-xs text-text-sub font-mono truncate'>
                              {perm.apiPath}
                            </span>
                          </div>
                        </div>
                        {selected.has(perm.permissionId) && (
                          <Badge
                            variant='outline'
                            className='bg-green-50 text-green-700 border-green-200 text-[10px] shrink-0'
                          >
                            Đã chọn
                          </Badge>
                        )}
                      </label>
                    ))}
                  </div>
                );
              })}
          </div>
        )}
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
          onClick={handleSave}
          className='bg-theme-primary-start hover:opacity-90'
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang lưu...' : `Lưu quyền (${selectedCount})`}
        </Button>
      </DialogFooter>
    </>
  );
}

// ─── Outer wrapper — fetches role detail to get assigned permissionIds ───

export function RolePermissionsDialog({
  open,
  onClose,
  role,
}: RolePermissionsDialogProps) {
  const { data: roleDetail, isLoading: isLoadingDetail } = useRoleDetailQuery(
    open ? role?.roleId : undefined,
  );

  const assignedIds = roleDetail?.permissions?.map((p) => p.permissionId) ?? [];

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className='max-w-2xl max-h-[90vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle className='text-text-main flex items-center gap-2'>
            <ShieldCheck size={18} className='text-theme-primary-start' />
            Phân quyền cho vai trò
          </DialogTitle>
          <DialogDescription>
            Chọn các quyền API dành cho vai trò{' '}
            <span className='font-semibold text-text-main'>{role?.name}</span>
          </DialogDescription>
        </DialogHeader>

        {isLoadingDetail || !role ? (
          <div className='flex items-center justify-center py-12'>
            <div className='h-5 w-5 rounded-full border-2 border-theme-primary-start border-t-transparent animate-spin' />
          </div>
        ) : (
          <PermissionsInner
            key={`${role.roleId}-${assignedIds.join(',')}`}
            role={role}
            initialSelected={assignedIds}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
