'use client';

/**
 * RolePermissionsDialog
 * ─────────────────────────────────────────────────────────────────────────────
 * Dialog phân quyền cho vai trò — hiển thị toàn bộ permission nhóm theo module.
 *
 * UI: Switch toggle cho từng module (bật/tắt tất cả permission) và từng
 * permission riêng lẻ. Collapsible sections.
 *
 * API dùng: API-023 PATCH /roles/{roleId} với { permissionIds: [...] }
 */

import { useState, useMemo, useCallback } from 'react';
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
import { Switch } from '@/components/ui/switch';
import type { RoleResponse, PermissionResponse } from '@/features/roles/types';
import {
  usePermissionsListQuery,
  useModulesQuery,
  useUpdateRoleMutation,
  useRemoveRolePermsMutation,
  useRoleDetailQuery,
} from '@/features/roles/hooks/use-roles';
import {
  Search,
  ShieldCheck,
  ShieldOff,
  ChevronDown,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  POST: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  PUT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PATCH:
    'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

interface ModuleGroup {
  name: string;
  permissions: PermissionResponse[];
}

function groupByModule(perms: PermissionResponse[]): ModuleGroup[] {
  const map = new Map<string, PermissionResponse[]>();
  for (const p of perms) {
    const group = map.get(p.module) ?? [];
    group.push(p);
    map.set(p.module, group);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, permissions]) => ({ name, permissions }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Module Section (collapsible, with switch)
// ─────────────────────────────────────────────────────────────────────────────

function ModuleSection({
  group,
  selected,
  onToggleModule,
  onTogglePermission,
  search,
  defaultExpanded,
}: {
  group: ModuleGroup;
  selected: Set<string>;
  onToggleModule: (moduleName: string, checked: boolean) => void;
  onTogglePermission: (permId: string) => void;
  search: string;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const filteredPerms = useMemo(() => {
    if (!search.trim()) return group.permissions;
    const q = search.toLowerCase();
    return group.permissions.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.apiPath.toLowerCase().includes(q) ||
        p.httpMethod.toLowerCase().includes(q),
    );
  }, [group.permissions, search]);

  const selectedCount = filteredPerms.filter((p) =>
    selected.has(p.permissionId),
  ).length;
  const totalCount = filteredPerms.length;
  const allChecked = totalCount > 0 && selectedCount === totalCount;
  const someChecked = selectedCount > 0 && selectedCount < totalCount;

  if (totalCount === 0) return null;

  return (
    <div className='rounded-xl border border-gray-100 dark:border-white/8 overflow-hidden'>
      {/* Module header */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 cursor-pointer select-none transition-colors',
          'bg-gray-50/80 dark:bg-white/3 hover:bg-gray-100/80 dark:hover:bg-white/5',
        )}
        onClick={() => setExpanded((v) => !v)}
      >
        <button
          type='button'
          className='p-0.5 rounded transition-transform'
          tabIndex={-1}
        >
          {expanded ? (
            <ChevronDown className='w-4 h-4 text-text-sub' />
          ) : (
            <ChevronRight className='w-4 h-4 text-text-sub' />
          )}
        </button>

        <span className='text-xs font-bold text-text-main uppercase tracking-wider flex-1'>
          {group.name}
        </span>

        <span className='text-[11px] text-text-sub mr-2'>
          {selectedCount}/{totalCount}
        </span>

        {someChecked && (
          <Badge
            variant='outline'
            className='text-[9px] px-1.5 py-0 h-4 border-amber-300 text-amber-600 dark:text-amber-400 mr-1'
          >
            Một phần
          </Badge>
        )}

        {/* Module-level switch */}
        <Switch
          checked={allChecked}
          onCheckedChange={(checked) => {
            onToggleModule(group.name, checked);
          }}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Bật/tắt tất cả ${group.name}`}
        />
      </div>

      {/* Permission list */}
      {expanded && (
        <div className='divide-y divide-gray-50 dark:divide-white/4'>
          {filteredPerms.map((perm) => {
            const isActive = selected.has(perm.permissionId);
            return (
              <div
                key={perm.permissionId}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 transition-colors',
                  isActive
                    ? 'bg-theme-primary-start/3 dark:bg-theme-primary-start/5'
                    : 'hover:bg-gray-50/50 dark:hover:bg-white/2',
                )}
              >
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2'>
                    <p
                      className={cn(
                        'text-sm font-medium truncate',
                        isActive ? 'text-text-main' : 'text-text-sub',
                      )}
                    >
                      {perm.name}
                    </p>
                  </div>
                  <div className='flex items-center gap-2 mt-0.5'>
                    <span
                      className={cn(
                        'text-[10px] font-bold px-1.5 py-0.5 rounded',
                        METHOD_COLORS[perm.httpMethod] ??
                          'bg-gray-100 text-gray-600',
                      )}
                    >
                      {perm.httpMethod}
                    </span>
                    <span className='text-[11px] text-text-sub font-mono truncate'>
                      {perm.apiPath}
                    </span>
                  </div>
                </div>

                <Switch
                  checked={isActive}
                  onCheckedChange={() => onTogglePermission(perm.permissionId)}
                  aria-label={`Bật/tắt ${perm.name}`}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner — contains the permission selection state
// ─────────────────────────────────────────────────────────────────────────────

function PermissionsInner({
  role,
  initialSelected,
  allPerms,
  modules,
  onClose,
}: {
  role: RoleResponse;
  initialSelected: string[];
  allPerms: PermissionResponse[];
  modules: string[];
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialSelected),
  );
  const [search, setSearch] = useState('');
  const [activeModule, setActiveModule] = useState<string>('');

  const updateRoleMutation = useUpdateRoleMutation();
  const removePermsMutation = useRemoveRolePermsMutation();

  const groups = useMemo(() => groupByModule(allPerms), [allPerms]);

  const filteredGroups = useMemo(
    () =>
      activeModule ? groups.filter((g) => g.name === activeModule) : groups,
    [groups, activeModule],
  );

  const allModules = useMemo(() => {
    const fromPerms = [...new Set(allPerms.map((p) => p.module))].sort();
    return modules.length > 0 ? modules : fromPerms;
  }, [allPerms, modules]);

  const togglePermission = useCallback((permId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  }, []);

  const toggleModule = useCallback(
    (moduleName: string, checked: boolean) => {
      const modulePerms = allPerms.filter((p) => p.module === moduleName);
      setSelected((prev) => {
        const next = new Set(prev);
        modulePerms.forEach((p) => {
          if (checked) next.add(p.permissionId);
          else next.delete(p.permissionId);
        });
        return next;
      });
    },
    [allPerms],
  );

  const handleSave = async () => {
    try {
      const initial = new Set(initialSelected);

      // IDs mới thêm (chưa có trong ban đầu)
      const added = Array.from(selected).filter((id) => !initial.has(id));
      // IDs bị bỏ (có trong ban đầu nhưng không còn trong selected)
      const removed = initialSelected.filter((id) => !selected.has(id));

      const promises: Promise<unknown>[] = [];

      if (added.length > 0) {
        promises.push(
          updateRoleMutation.mutateAsync({
            roleId: role.roleId,
            payload: { permissionIds: added },
          }),
        );
      }

      if (removed.length > 0) {
        promises.push(
          removePermsMutation.mutateAsync({
            roleId: role.roleId,
            payload: { permissionIds: removed },
          }),
        );
      }

      await Promise.all(promises);
      toast.success('Cập nhật quyền thành công!');
      onClose();
    } catch {
      toast.error('Cập nhật quyền thất bại. Vui lòng thử lại.');
    }
  };

  const selectedCount = selected.size;
  const totalCount = allPerms.length;
  const isSubmitting =
    updateRoleMutation.isPending || removePermsMutation.isPending;

  // Check if anything changed
  const hasChanges = useMemo(() => {
    const initial = new Set(initialSelected);
    if (initial.size !== selected.size) return true;
    for (const id of selected) {
      if (!initial.has(id)) return true;
    }
    return false;
  }, [initialSelected, selected]);

  return (
    <>
      {/* Stats bar */}
      <div className='flex items-center justify-between rounded-xl bg-gray-50 dark:bg-white/3 px-4 py-2.5 border border-gray-100 dark:border-white/8'>
        <div className='flex items-center gap-2 text-sm'>
          <ShieldCheck size={14} className='text-theme-primary-start' />
          <span className='text-text-sub'>
            Đã bật:{' '}
            <span className='font-semibold text-theme-primary-start'>
              {selectedCount}
            </span>
            {' / '}
            <span className='font-semibold text-text-main'>
              {totalCount}
            </span>{' '}
            quyền
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            className='text-xs text-text-sub h-7 hover:text-emerald-600'
            onClick={() =>
              setSelected(new Set(allPerms.map((p) => p.permissionId)))
            }
          >
            <ShieldCheck size={12} className='mr-1' />
            Bật tất cả
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='text-xs text-text-sub h-7 hover:text-theme-primary-start'
            onClick={() => setSelected(new Set())}
          >
            <ShieldOff size={12} className='mr-1' />
            Tắt tất cả
          </Button>
        </div>
      </div>

      {/* Search + Module filter tabs */}
      <div className='flex flex-col gap-2'>
        <div className='relative'>
          <Search
            size={14}
            className='absolute left-3 top-1/2 -translate-y-1/2 text-text-sub'
          />
          <Input
            placeholder='Tìm kiếm quyền theo tên, API path...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-9 h-9'
          />
        </div>
        <div className='flex flex-wrap gap-1.5'>
          <button
            onClick={() => setActiveModule('')}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              activeModule === ''
                ? 'bg-theme-primary-start text-white'
                : 'bg-gray-100 dark:bg-white/8 text-text-sub hover:bg-gray-200 dark:hover:bg-white/12',
            )}
          >
            Tất cả
          </button>
          {allModules.map((m) => {
            const modulePerms = allPerms.filter((p) => p.module === m);
            const selectedInModule = modulePerms.filter((p) =>
              selected.has(p.permissionId),
            ).length;
            const isActive = activeModule === m;
            return (
              <button
                key={m}
                onClick={() => setActiveModule(m === activeModule ? '' : m)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors flex items-center gap-1.5',
                  isActive
                    ? 'bg-theme-primary-start text-white'
                    : 'bg-gray-100 dark:bg-white/8 text-text-sub hover:bg-gray-200 dark:hover:bg-white/12',
                )}
              >
                {m}
                {selectedInModule > 0 && (
                  <span
                    className={cn(
                      'rounded-full h-4 min-w-4 px-1 text-[10px] flex items-center justify-center font-bold',
                      isActive
                        ? 'bg-white/30'
                        : selectedInModule === modulePerms.length
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-theme-primary-start/15 text-theme-primary-start',
                    )}
                  >
                    {selectedInModule}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Module groups with switches */}
      <div className='flex-1 overflow-y-auto min-h-0 space-y-3 pr-1'>
        {filteredGroups.map((group) => (
          <ModuleSection
            key={group.name}
            group={group}
            selected={selected}
            onToggleModule={toggleModule}
            onTogglePermission={togglePermission}
            search={search}
            defaultExpanded={!!activeModule || filteredGroups.length <= 3}
          />
        ))}
      </div>

      <DialogFooter className='pt-2 border-t border-gray-100 dark:border-white/8'>
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
          className='bg-theme-primary-start hover:brightness-110 text-white disabled:opacity-50'
          disabled={isSubmitting || !hasChanges}
        >
          {isSubmitting ? (
            <>
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              Đang lưu...
            </>
          ) : (
            `Lưu quyền (${selectedCount})`
          )}
        </Button>
      </DialogFooter>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Outer wrapper — fetches data before rendering inner
// ─────────────────────────────────────────────────────────────────────────────

interface RolePermissionsDialogProps {
  open: boolean;
  onClose: () => void;
  role?: RoleResponse | null;
}

export function RolePermissionsDialog({
  open,
  onClose,
  role,
}: RolePermissionsDialogProps) {
  const { data: roleDetail, isLoading: isLoadingDetail } = useRoleDetailQuery(
    open ? role?.roleId : undefined,
  );
  const { data: allPermsData, isLoading: isLoadingPerms } =
    usePermissionsListQuery(open ? { size: 1000 } : undefined);
  const { data: modules } = useModulesQuery();

  const assignedIds = useMemo(
    () => roleDetail?.permissions?.map((p) => p.permissionId) ?? [],
    [roleDetail],
  );
  const allPerms = useMemo(() => allPermsData?.content ?? [], [allPermsData]);
  const allModules = useMemo(() => (modules as string[]) ?? [], [modules]);

  const isLoading = isLoadingDetail || isLoadingPerms;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className='max-w-2xl max-h-[90vh] flex flex-col gap-4'>
        <DialogHeader>
          <DialogTitle className='text-text-main flex items-center gap-2'>
            <ShieldCheck size={18} className='text-theme-primary-start' />
            Phân quyền cho vai trò
          </DialogTitle>
          <DialogDescription>
            Bật/tắt module hoặc từng quyền riêng lẻ cho vai trò{' '}
            <span className='font-semibold text-text-main'>{role?.name}</span>
          </DialogDescription>
        </DialogHeader>

        {isLoading || !role ? (
          <div className='flex flex-col items-center justify-center py-16 gap-3'>
            <Loader2 className='w-6 h-6 animate-spin text-theme-primary-start' />
            <p className='text-sm text-text-sub'>Đang tải danh sách quyền...</p>
          </div>
        ) : (
          <PermissionsInner
            key={`${role.roleId}-${assignedIds.join(',')}`}
            role={role}
            initialSelected={assignedIds}
            allPerms={allPerms}
            modules={allModules}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
