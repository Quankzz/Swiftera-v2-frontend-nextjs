'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CSS } from '@dnd-kit/utilities';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  IconChevronDown,
  IconChevronRight,
  IconDots,
  IconGripVertical,
  IconPlus,
} from '@tabler/icons-react';
import { Pencil, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import type {
  PermissionResponse,
  PaginatedPermissionsResponse,
} from '@/features/roles/types';
import { permissionKeys } from '@/features/roles/api/role.keys';
import {
  useModulesQuery,
  usePermissionsListQuery,
  useUpdatePermissionMutation,
} from '@/features/roles/hooks/use-roles';

type PermissionTreeProps = {
  onAddPermission?: (module?: string) => void;
  onEditPermission?: (permission: PermissionResponse) => void;
  onDeletePermission?: (permission: PermissionResponse) => void;
  onAddModule?: () => void;
  onEditModule?: (moduleName: string) => void;
  onDeleteModule?: (moduleName: string) => void;
};

const methodStyles: Record<string, string> = {
  GET: 'bg-green-100 text-green-700',
  POST: 'bg-orange-100 text-orange-700',
  PUT: 'bg-blue-100 text-blue-700',
  PATCH: 'bg-violet-100 text-violet-700',
  DELETE: 'bg-red-100 text-red-700',
};

function PermissionRow({
  permission,
  onEdit,
  onDelete,
  isDraggingContext,
}: {
  permission: PermissionResponse;
  onEdit?: (permission: PermissionResponse) => void;
  onDelete?: (permission: PermissionResponse) => void;
  isDraggingContext?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: permission.permissionId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-3 py-2 ${
        isDraggingContext
          ? 'bg-gray-50 dark:bg-white/5'
          : 'hover:border-theme-primary-start'
      }`}
    >
      <div className='flex items-center gap-3'>
        <button
          className='cursor-grab touch-none p-1 shrink-0 hover:bg-gray-100 dark:hover:bg-white/8 rounded text-text-sub'
          {...attributes}
          {...listeners}
        >
          <IconGripVertical size={14} />
        </button>
        <div className='space-y-1'>
          <div className='font-medium text-text-main text-sm'>
            {permission.name}
          </div>
          <div className='flex items-center gap-2 text-xs text-text-sub'>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                methodStyles[permission.httpMethod] ||
                'bg-gray-100 text-text-main'
              }`}
            >
              {permission.httpMethod}
            </span>
            <span className='truncate max-w-60' title={permission.apiPath}>
              {permission.apiPath}
            </span>
          </div>
        </div>
      </div>
      <div className='flex items-center gap-1'>
        <Button
          variant='ghost'
          size='icon'
          className='h-7 w-7 text-text-sub hover:text-theme-primary-start'
          onClick={() => onEdit?.(permission)}
        >
          <Pencil size={14} />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='h-7 w-7 text-theme-primary-start hover:bg-red-50'
          onClick={() => onDelete?.(permission)}
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
}

function ModuleNode({
  moduleName,
  permissions,
  isCollapsed,
  onToggleCollapse,
  onAddPermission,
  onEditPermission,
  onDeletePermission,
  onEditModule,
  onDeleteModule,
}: {
  moduleName: string;
  permissions: PermissionResponse[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onAddPermission?: () => void;
  onEditPermission?: (permission: PermissionResponse) => void;
  onDeletePermission?: (permission: PermissionResponse) => void;
  onEditModule?: (moduleName: string) => void;
  onDeleteModule?: (moduleName: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: moduleName });
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <div className='rounded-lg border border-gray-200 dark:border-white/8 bg-gray-50 dark:bg-white/3'>
      <div
        className='flex items-center justify-between px-3 py-2 cursor-pointer'
        onClick={onToggleCollapse}
      >
        {/* Left: chevron + moduleName + badge + "..." menu */}
        <div className='flex items-center gap-2 min-w-0'>
          {isCollapsed ? (
            <IconChevronRight size={16} className='text-text-sub shrink-0' />
          ) : (
            <IconChevronDown size={16} className='text-text-sub shrink-0' />
          )}
          <span className='font-semibold text-text-main truncate'>
            {moduleName}
          </span>
          <Badge
            variant='secondary'
            className='bg-gray-200 text-text-sub hover:bg-gray-200 shrink-0'
          >
            {permissions.length} quyền
          </Badge>

          {/* "..." kebab menu */}
          <div
            ref={menuRef}
            className='relative shrink-0'
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant='ghost'
              size='icon'
              className='h-6 w-6 text-theme-primary-start bg-rose-50 hover:text-text-start/90 hover:bg-theme-primary-start/10 transition-opacity'
              onClick={() => setMenuOpen((v) => !v)}
            >
              <IconDots size={14} />
            </Button>

            {menuOpen && (
              <div className='absolute left-0 top-full mt-1 z-50 w-36 rounded-xl border border-gray-100 dark:border-white/8 bg-white dark:bg-surface-card shadow-xl dark:shadow-black/30 overflow-hidden animate-in fade-in slide-in-from-top-1'>
                <button
                  className='flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-text-main hover:bg-gray-50 dark:hover:bg-white/8 transition-colors'
                  onClick={() => {
                    setMenuOpen(false);
                    onEditModule?.(moduleName);
                  }}
                >
                  <Pencil size={13} className='text-text-sub' />
                  Đổi tên
                </button>
                <div className='h-px bg-gray-100 dark:bg-white/8 mx-2' />
                <button
                  className='flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-theme-primary-start hover:bg-red-50 transition-colors'
                  onClick={() => {
                    setMenuOpen(false);
                    onDeleteModule?.(moduleName);
                  }}
                >
                  <Trash2 size={13} className='text-theme-primary-start' />
                  Xóa module
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: "Thêm quyền" button */}
        <Button
          variant='ghost'
          size='sm'
          className='text-theme-primary-start bg-rose-50 hover:text-theme-primary-end hover:bg-rose-100 h-7 px-2 rounded-sm shrink-0'
          onClick={(e) => {
            e.stopPropagation();
            onAddPermission?.();
          }}
        >
          <IconPlus size={14} className='mr-1' /> Thêm quyền
        </Button>
      </div>

      {!isCollapsed && (
        <div
          ref={setNodeRef}
          className={`p-2 border-t border-gray-200 dark:border-white/8 bg-white dark:bg-surface-base rounded-b-lg ${
            isOver ? 'bg-theme-primary-start/10 border-dashed' : ''
          }`}
        >
          <div className='space-y-2'>
            <SortableContext
              items={permissions.map((p) => p.permissionId)}
              strategy={verticalListSortingStrategy}
            >
              {permissions.map((permission) => (
                <PermissionRow
                  key={permission.permissionId}
                  permission={permission}
                  onEdit={onEditPermission}
                  onDelete={onDeletePermission}
                />
              ))}
            </SortableContext>

            {permissions.length === 0 && (
              <div className='py-6 text-center text-sm text-text-sub border-2 border-dashed border-gray-200 dark:border-white/10 rounded-md'>
                Kéo thả quyền vào đây hoặc thêm quyền mới
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function PermissionsBoard({
  onAddPermission,
  onEditPermission,
  onDeletePermission,
  onAddModule,
  onEditModule,
  onDeleteModule,
}: PermissionTreeProps) {
  const params = { page: 1, size: 1000 } as const;
  const { data, isLoading } = usePermissionsListQuery(params);
  const { data: modulesData } = useModulesQuery();
  const queryClient = useQueryClient();
  const updatePermissionMutation = useUpdatePermissionMutation();
  const [activeId, setActiveId] = useState<string | null>(null);

  const permissions = useMemo<PermissionResponse[]>(
    () => data?.content ?? [],
    [data],
  );
  const modules = useMemo(() => {
    const set = new Set<string>();
    ((modulesData as string[] | undefined) ?? []).forEach((m) => set.add(m));
    permissions.forEach((p) => set.add(p.module || 'Chưa phân loại'));
    return Array.from(set);
  }, [modulesData, permissions]);

  const [collapsedModules, setCollapsedModules] = useState<
    Record<string, boolean>
  >({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const toggleCollapse = (mod: string) => {
    setCollapsedModules((prev) => ({ ...prev, [mod]: !prev[mod] }));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const draggedPermission = permissions.find(
      (p) => p.permissionId === active.id,
    );
    if (!draggedPermission) return;

    const overId = over.id as string;
    let targetModule: string | null = null;

    if (modules.includes(overId)) {
      targetModule = overId;
    } else {
      const targetPermission = permissions.find(
        (p) => p.permissionId === overId,
      );
      if (targetPermission) {
        targetModule = targetPermission.module || 'Chưa phân loại';
      }
    }

    if (targetModule && targetModule !== draggedPermission.module) {
      const queryKey = permissionKeys.list(params);
      const previous = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(
        queryKey,
        (old: PaginatedPermissionsResponse | undefined) => {
          if (!old?.content) return old;
          return {
            ...old,
            content: old.content.map((p: PermissionResponse) =>
              p.permissionId === draggedPermission.permissionId
                ? { ...p, module: targetModule as string }
                : p,
            ),
          };
        },
      );

      try {
        await updatePermissionMutation.mutateAsync({
          permissionId: draggedPermission.permissionId,
          payload: { module: targetModule },
        });
        queryClient.invalidateQueries({ queryKey: ['permissions'] });
      } catch (error) {
        queryClient.setQueryData(queryKey, previous);
        console.error('Failed to update module:', error);
      }
    }
  };

  const activePermission = activeId
    ? permissions.find((p) => p.permissionId === activeId)
    : null;

  if (isLoading) {
    return (
      <div className='flex justify-center items-center py-10'>
        <span className='text-text-sub animate-pulse'>
          Đang tải cấu hình quyền...
        </span>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-end'>
        <Button
          variant='outline'
          size='lg'
          className='text-text-main hover:opacity-90 transition-opacity rounded-sm'
          onClick={onAddModule}
        >
          <IconPlus size={14} className='mr-1' /> Thêm Module
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className='space-y-3'>
          {modules.map((mod) => (
            <ModuleNode
              key={mod}
              moduleName={mod}
              permissions={permissions.filter(
                (p) => (p.module || 'Chưa phân loại') === mod,
              )}
              isCollapsed={!!collapsedModules[mod]}
              onToggleCollapse={() => toggleCollapse(mod)}
              onAddPermission={() => onAddPermission?.(mod)}
              onEditPermission={onEditPermission}
              onDeletePermission={onDeletePermission}
              onEditModule={onEditModule}
              onDeleteModule={onDeleteModule}
            />
          ))}

          {!modules.length && (
            <div className='py-10 text-center text-text-sub bg-gray-50 dark:bg-white/3 rounded-md border border-dashed border-gray-300 dark:border-white/15'>
              Chưa có cấu hình quyền nào trong hệ thống
            </div>
          )}
        </div>

        <DragOverlay>
          {activePermission ? (
            <div className='opacity-90 shadow-xl pointer-events-none w-full max-w-125'>
              <PermissionRow permission={activePermission} isDraggingContext />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
