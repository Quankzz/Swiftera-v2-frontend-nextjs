'use client';

import { useState } from 'react';
import { Plus, Warehouse, ToggleRight, ToggleLeft } from 'lucide-react';
import type { HubResponse } from '@/features/hubs/types';
import { HubTable } from './hub-table';
import type { HubTableMeta } from './hub-table';
import { HubFormDialog } from './hub-form-dialog';
import { HubDeleteDialog } from './hub-delete-dialog';

// ─────────────────────────────────────────────────────────────────────────────
// Dialog State
// ─────────────────────────────────────────────────────────────────────────────

type DialogState =
  | { type: 'idle' }
  | { type: 'create' }
  | { type: 'edit'; hub: HubResponse }
  | { type: 'delete'; hub: HubResponse };

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function HubsPage() {
  const [dialog, setDialog] = useState<DialogState>({ type: 'idle' });
  // Stats đến từ HubTable qua callback — không cần query riêng
  const [meta, setMeta] = useState<HubTableMeta>({
    totalElements: 0,
    activeCount: 0,
    inactiveCount: 0,
  });

  return (
    <div className='flex flex-col gap-6 p-6 w-full'>
      {/* Page Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight text-text-main'>
            Quản lý Hub
          </h2>
          <p className='mt-1 text-sm text-text-sub'>
            Quản lý các điểm trung chuyển (hub) trong hệ thống
          </p>
        </div>
        <button
          type='button'
          onClick={() => setDialog({ type: 'create' })}
          className='inline-flex shrink-0 items-center gap-2 rounded-lg bg-theme-primary-start px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition shadow-sm'
        >
          <Plus className='size-4' />
          Tạo hub mới
        </button>
      </div>

      {/* Stats — phản ánh trang hiện tại trong bảng */}
      <div className='flex flex-wrap gap-4'>
        <div className='flex items-center gap-2 rounded-lg border border-gray-100 dark:border-white/8 bg-white dark:bg-surface-card px-4 py-2.5'>
          <Warehouse className='size-4 text-theme-primary-start' />
          <span className='text-sm font-medium text-text-main'>
            {meta.totalElements}
          </span>
          <span className='text-sm text-text-sub'>tổng hub</span>
        </div>
        <div className='flex items-center gap-2 rounded-lg border border-gray-100 dark:border-white/8 bg-white dark:bg-surface-card px-4 py-2.5'>
          <ToggleRight className='size-4 text-green-500' />
          <span className='text-sm font-medium text-text-main'>
            {meta.activeCount}
          </span>
          <span className='text-sm text-text-sub'>đang hoạt động</span>
        </div>
        <div className='flex items-center gap-2 rounded-lg border border-gray-100 dark:border-white/8 bg-white dark:bg-surface-card px-4 py-2.5'>
          <ToggleLeft className='size-4 text-gray-400' />
          <span className='text-sm font-medium text-text-main'>
            {meta.inactiveCount}
          </span>
          <span className='text-sm text-text-sub'>ngừng hoạt động</span>
        </div>
      </div>

      {/* Table */}
      <HubTable
        onEdit={(hub) => setDialog({ type: 'edit', hub })}
        onDelete={(hub) => setDialog({ type: 'delete', hub })}
        onMetaChange={setMeta}
      />

      {/* Dialogs */}
      {dialog.type === 'create' && (
        <HubFormDialog
          target={null}
          onClose={() => setDialog({ type: 'idle' })}
        />
      )}
      {dialog.type === 'edit' && (
        <HubFormDialog
          target={dialog.hub}
          onClose={() => setDialog({ type: 'idle' })}
        />
      )}
      {dialog.type === 'delete' && (
        <HubDeleteDialog
          hub={dialog.hub}
          onClose={() => setDialog({ type: 'idle' })}
        />
      )}
    </div>
  );
}
