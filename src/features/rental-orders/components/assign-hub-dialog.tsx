'use client';

import { useState, useMemo } from 'react';
import {
  X,
  MapPin,
  Search,
  Building2,
  Phone,
  CheckCircle2,
  Loader2,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHubsForAssignQuery } from '@/features/rental-orders/hooks/use-rental-order-assignment';
import type {
  HubOption,
  RentalOrderResponse,
} from '@/features/rental-orders/types';

// ─────────────────────────────────────────────────────────────────────────────

interface AssignHubDialogProps {
  order: RentalOrderResponse;
  isOpen: boolean;
  onClose: () => void;
  /** Gọi khi đã chọn hub, bước tiếp theo là chọn nhân viên */
  onHubSelected: (hub: HubOption) => void;
}

type SortField = 'name' | 'city' | 'code';
type SortDir = 'asc' | 'desc';

// ─────────────────────────────────────────────────────────────────────────────

export function AssignHubDialog({
  order,
  isOpen,
  onClose,
  onHubSelected,
}: AssignHubDialogProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selectedHub, setSelectedHub] = useState<HubOption | null>(null);

  // Fetch active hubs — BE spec API-042 GET /hubs?filter=isActive:true
  const { data, isLoading } = useHubsForAssignQuery({
    size: 100,
    sort: `${sortField},${sortDir}`,
    filter: 'isActive:true',
  });

  // Client-side search (tên, mã, quận, thành phố, phone)
  const filteredHubs = useMemo(() => {
    const allHubs = data?.content ?? [];
    if (!search.trim()) return allHubs;
    const q = search.toLowerCase();
    return allHubs.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.code.toLowerCase().includes(q) ||
        h.city?.toLowerCase().includes(q) ||
        h.district?.toLowerCase().includes(q) ||
        h.phone?.includes(q),
    );
  }, [data, search]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleConfirm = () => {
    if (!selectedHub) return;
    onHubSelected(selectedHub);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Dialog */}
      <div className='relative z-10 w-full max-w-2xl mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10 bg-linear-to-r from-indigo-600 to-blue-600 shrink-0'>
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center'>
              <Building2 className='w-5 h-5 text-white' />
            </div>
            <div>
              <h2 className='text-base font-semibold text-white'>
                Chọn Hub xử lý
              </h2>
              <p className='text-xs text-blue-100'>
                Đơn: {order.rentalOrderId.slice(0, 8).toUpperCase()} —{' '}
                {order.deliveryRecipientName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors'
          >
            <X className='w-4 h-4 text-white' />
          </button>
        </div>

        {/* Toolbar: Search + Sort */}
        <div className='px-5 py-3 border-b border-gray-100 dark:border-white/10 flex flex-wrap items-center gap-2 shrink-0'>
          {/* Search */}
          <div className='relative flex-1 min-w-48'>
            <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400' />
            <input
              type='text'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Tìm hub theo tên, mã, quận, thành phố...'
              className='h-9 w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 pl-8 pr-3 text-sm text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition'
            />
          </div>
          {/* Sort buttons */}
          <div className='flex items-center gap-1'>
            {(
              [
                { field: 'name', label: 'Tên' },
                { field: 'city', label: 'Thành phố' },
                { field: 'code', label: 'Mã' },
              ] as { field: SortField; label: string }[]
            ).map(({ field, label }) => (
              <button
                key={field}
                onClick={() => toggleSort(field)}
                className={cn(
                  'flex items-center gap-1 h-8 px-3 rounded-lg border text-xs font-medium transition',
                  sortField === field
                    ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-text-sub hover:bg-gray-50 dark:hover:bg-white/8',
                )}
              >
                <ArrowUpDown className='w-3 h-3' />
                {label}
                {sortField === field && (
                  <span className='text-[10px]'>
                    {sortDir === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Hub list */}
        <div className='flex-1 overflow-y-auto px-5 py-3 space-y-2'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center py-12 gap-2'>
              <Loader2 className='w-6 h-6 text-indigo-500 animate-spin' />
              <p className='text-sm text-text-sub'>Đang tải danh sách hub...</p>
            </div>
          ) : filteredHubs.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 gap-2'>
              <Building2 className='w-8 h-8 text-gray-300 dark:text-gray-600' />
              <p className='text-sm text-text-sub'>Không tìm thấy hub nào</p>
            </div>
          ) : (
            filteredHubs.map((hub) => {
              const isSelected = selectedHub?.hubId === hub.hubId;
              const isCurrent = order.hubId === hub.hubId;
              return (
                <button
                  key={hub.hubId}
                  type='button'
                  onClick={() => setSelectedHub(hub)}
                  className={cn(
                    'w-full text-left rounded-xl border p-4 transition-all',
                    isSelected
                      ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm ring-2 ring-indigo-400/30'
                      : 'border-gray-200 dark:border-white/8 bg-white dark:bg-white/4 hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-white/8',
                  )}
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex items-start gap-3 min-w-0'>
                      {/* Icon */}
                      <div
                        className={cn(
                          'mt-0.5 w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                          isSelected
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400',
                        )}
                      >
                        <Building2 className='w-4.5 h-4.5' />
                      </div>
                      {/* Info */}
                      <div className='min-w-0'>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <span
                            className={cn(
                              'font-semibold text-sm',
                              isSelected
                                ? 'text-indigo-700 dark:text-indigo-300'
                                : 'text-text-main',
                            )}
                          >
                            {hub.name}
                          </span>
                          <span className='text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-text-sub'>
                            {hub.code}
                          </span>
                          {isCurrent && (
                            <span className='text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'>
                              Hub hiện tại
                            </span>
                          )}
                        </div>
                        <div className='flex items-center gap-1 mt-1 text-xs text-text-sub'>
                          <MapPin className='w-3 h-3 shrink-0' />
                          <span className='line-clamp-1'>
                            {[hub.addressLine, hub.district, hub.city]
                              .filter(Boolean)
                              .join(', ') || 'Chưa có địa chỉ'}
                          </span>
                        </div>
                        {hub.phone && (
                          <div className='flex items-center gap-1 mt-0.5 text-xs text-text-sub'>
                            <Phone className='w-3 h-3 shrink-0' />
                            {hub.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Selected check */}
                    {isSelected ? (
                      <CheckCircle2 className='w-5 h-5 text-indigo-500 shrink-0 mt-0.5' />
                    ) : (
                      <div className='w-5 h-5 rounded-full border-2 border-gray-300 dark:border-white/20 shrink-0 mt-0.5' />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className='px-5 py-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-3 bg-gray-50 dark:bg-white/5 shrink-0'>
          <p className='text-sm text-text-sub'>
            {filteredHubs.length} hub
            {selectedHub ? (
              <span className='ml-2 font-medium text-indigo-600 dark:text-indigo-400'>
                — Đã chọn: {selectedHub.name}
              </span>
            ) : null}
          </p>
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors'
            >
              Hủy
            </button>
            <button
              type='button'
              onClick={handleConfirm}
              disabled={!selectedHub}
              className='px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2'
            >
              Tiếp theo
              <ChevronRight className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
