'use client';

import { usePermissions } from '@/hooks/api/use-dashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CSS } from '@dnd-kit/utilities';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState, useMemo } from 'react';
import { Permission } from '@/types/dashboard';
import { permissionsApi } from '@/api/permissions';
import { useQueryClient } from '@tanstack/react-query';
import {
  IconGripVertical,
  IconChevronDown,
  IconChevronRight,
} from '@tabler/icons-react';

function PermissionItem({
  permission,
  isDraggingContext,
}: {
  permission: Permission;
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
      className={`flex items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3 shadow-sm ${
        isDraggingContext ? 'bg-gray-50' : 'hover:border-theme-primary-start'
      }`}
    >
      <div className='flex items-center gap-4'>
        <button
          className='cursor-grab touch-none p-1 shrink-0 hover:bg-gray-100 rounded text-text-sub'
          {...attributes}
          {...listeners}
        >
          <IconGripVertical size={16} />
        </button>
        <div className='space-y-1'>
          <div className='font-medium text-text-main text-sm'>
            {permission.name}
          </div>
          <div className='flex items-center gap-2'>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                permission.method === 'GET'
                  ? 'bg-green-100 text-green-700'
                  : permission.method === 'POST'
                    ? 'bg-orange-100 text-orange-700'
                    : permission.method === 'PUT'
                      ? 'bg-blue-100 text-blue-700'
                      : permission.method === 'PATCH'
                        ? 'bg-violet-100 text-violet-700'
                        : 'bg-red-100 text-red-700'
              }`}
            >
              {permission.method}
            </span>
            <span className='text-xs text-text-sub truncate max-w-50'>
              {permission.apiPath}
            </span>
          </div>
        </div>
      </div>
      <div>
        <Button
          variant='ghost'
          size='sm'
          className='text-text-sub hover:text-theme-primary-start h-8 px-2'
        >
          Sửa
        </Button>
      </div>
    </div>
  );
}

function ModuleGroup({
  moduleName,
  permissions,
  isCollapsed,
  onToggleCollapse,
}: {
  moduleName: string;
  permissions: Permission[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: moduleName,
  });

  return (
    <div className='mb-4'>
      <div
        className={`flex items-center justify-between p-3 rounded-t-md border border-gray-200 bg-gray-50 cursor-pointer ${isCollapsed ? 'rounded-b-md' : 'border-b-0'}`}
        onClick={onToggleCollapse}
      >
        <div className='flex items-center gap-2'>
          {isCollapsed ? (
            <IconChevronRight size={18} className='text-text-sub' />
          ) : (
            <IconChevronDown size={18} className='text-text-sub' />
          )}
          <span className='font-semibold text-text-main'>{moduleName}</span>
          <Badge
            variant='secondary'
            className='ml-2 bg-gray-200 text-text-sub hover:bg-gray-200'
          >
            {permissions.length} quyền
          </Badge>
        </div>
      </div>

      {!isCollapsed && (
        <div
          ref={setNodeRef}
          className={`p-3 border border-gray-200 border-t-0 rounded-b-md transition-colors min-h-20 bg-gray-50/50 ${
            isOver
              ? 'bg-theme-primary-start/10 border-theme-primary-start border-dashed'
              : ''
          }`}
        >
          <div className='flex flex-col gap-2'>
            <SortableContext
              items={permissions.map((p) => p.permissionId)}
              strategy={verticalListSortingStrategy}
            >
              {permissions.map((p) => (
                <PermissionItem key={p.permissionId} permission={p} />
              ))}
            </SortableContext>

            {permissions.length === 0 && (
              <div className='py-6 text-center text-sm text-text-sub border-2 border-dashed border-gray-200 rounded-md'>
                Kéo thả quyền vào đây
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function PermissionsBoard() {
  const { data, isLoading } = usePermissions();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);

  const permissions = useMemo(() => data?.data || [], [data]);

  // Extract unique modules
  const modules = useMemo(() => {
    const mods = new Set<string>();
    permissions.forEach((p) => {
      mods.add(p.module || 'Chưa phân loại');
    });
    return Array.from(mods);
  }, [permissions]);

  const [collapsedModules, setCollapsedModules] = useState<
    Record<string, boolean>
  >({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
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

    // Check if dropped on a module area
    const overId = over.id as string;

    let targetModule = null;
    if (modules.includes(overId)) {
      targetModule = overId;
    } else {
      // It might be dropped over another permission item...
      // find that permission's module
      const targetPermission = permissions.find(
        (p) => p.permissionId === overId,
      );
      if (targetPermission) {
        targetModule = targetPermission.module || 'Chưa phân loại';
      }
    }

    if (targetModule && targetModule !== draggedPermission.module) {
      // Optimistic update
      const previousPermissions = queryClient.getQueryData(['permissions']);

      queryClient.setQueryData(
        ['permissions'],
        (old: { data: Permission[]; total: number } | undefined) => {
          if (!old || !old.data) return old;
          return {
            ...old,
            data: old.data.map((p: Permission) =>
              p.permissionId === draggedPermission.permissionId
                ? { ...p, module: targetModule }
                : p,
            ),
          };
        },
      );

      try {
        await permissionsApi.updatePermissionModule(
          draggedPermission.permissionId,
          targetModule,
        );
        queryClient.invalidateQueries({ queryKey: ['permissions'] });
      } catch (error) {
        // Rollback
        queryClient.setQueryData(['permissions'], previousPermissions);
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
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className='w-full max-w-4xl'>
        {modules.map((mod) => (
          <ModuleGroup
            key={mod}
            moduleName={mod}
            permissions={permissions.filter(
              (p) => (p.module || 'Chưa phân loại') === mod,
            )}
            isCollapsed={!!collapsedModules[mod]}
            onToggleCollapse={() => toggleCollapse(mod)}
          />
        ))}

        {!modules.length && (
          <div className='py-10 text-center text-text-sub bg-gray-50 rounded-md border border-dashed border-gray-300'>
            Chưa có cấu hình quyền nào trong hệ thống
          </div>
        )}
      </div>

      <DragOverlay>
        {activePermission ? (
          <div className='opacity-90 shadow-xl pointer-events-none w-full max-w-125'>
            <PermissionItem permission={activePermission} isDraggingContext />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
