'use client';

import { Trash2, X, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { HubResponse } from '@/features/hubs/types';
import { useDeleteHubMutation } from '@/features/hubs/hooks/use-hub-management';
import { normalizeError } from '@/api/apiService';

interface HubDeleteDialogProps {
  hub: HubResponse;
  onClose: () => void;
}

export function HubDeleteDialog({ hub, onClose }: HubDeleteDialogProps) {
  const deleteMutation = useDeleteHubMutation();

  async function handleConfirm() {
    try {
      await deleteMutation.mutateAsync(hub.hubId);
      toast.success(`Đã xóa hub "${hub.name}" thành công`);
      onClose();
    } catch (err) {
      const appErr = normalizeError(err);
      toast.error(appErr.message);
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Panel */}
      <div className='relative z-10 w-full max-w-md overflow-hidden rounded-xl bg-white dark:bg-surface-card shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-100 dark:border-white/8 px-6 py-4'>
          <div className='flex items-center gap-3'>
            <div className='flex size-9 items-center justify-center rounded-md bg-red-50 dark:bg-red-950/40'>
              <AlertTriangle size={18} className='text-red-500' />
            </div>
            <h2 className='text-base font-semibold text-text-main'>
              Xác nhận xóa hub
            </h2>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='flex size-8 items-center justify-center rounded-md text-text-sub transition hover:bg-gray-100 dark:hover:bg-white/8 hover:text-text-main'
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className='px-6 py-5 space-y-3'>
          <p className='text-sm text-text-sub'>Bạn có chắc muốn xóa hub sau?</p>
          <div className='rounded-lg bg-gray-50 dark:bg-white/4 border border-gray-100 dark:border-white/8 px-4 py-3 space-y-1'>
            <p className='text-sm font-semibold text-text-main'>{hub.name}</p>
            <p className='text-xs text-text-sub font-mono'>{hub.code}</p>
            {hub.city && <p className='text-xs text-text-sub'>{hub.city}</p>}
          </div>
          <p className='text-xs text-red-500'>
            Hành động này không thể hoàn tác.
          </p>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end gap-3 border-t border-gray-100 dark:border-white/8 px-6 py-4'>
          <button
            type='button'
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className='rounded-lg border border-gray-200 dark:border-white/8 px-4 py-2 text-sm font-medium text-text-main transition hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-60'
          >
            Hủy
          </button>
          <button
            type='button'
            onClick={handleConfirm}
            disabled={deleteMutation.isPending}
            className='inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed'
          >
            {deleteMutation.isPending && (
              <Loader2 size={14} className='animate-spin' />
            )}
            <Trash2 size={14} />
            Xóa hub
          </button>
        </div>
      </div>
    </div>
  );
}
