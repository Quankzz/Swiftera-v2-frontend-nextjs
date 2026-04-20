'use client';

import { useState } from 'react';
import {
  X,
  Warehouse,
  MapPin,
  Phone,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  Hash,
  Navigation,
  Package,
  Layers,
  Search,
  ChevronDown,
} from 'lucide-react';
import type { HubResponse } from '@/features/hubs/types';
import { useHubStaffQuery, useHubProductsQuery, useHubInventoryItemsQuery } from '@/features/hubs/hooks/use-hub-management';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDateTime(raw: string | null | undefined): string {
  if (!raw) return '-';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildAddress(hub: HubResponse): string {
  return (
    [hub.addressLine, hub.ward, hub.district, hub.city]
      .filter(Boolean)
      .join(', ') || '-'
  );
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className='flex items-start gap-3'>
      <div className='mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-gray-50 dark:bg-white/6'>
        <Icon size={14} className='text-text-sub' />
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-xs text-text-sub'>{label}</p>
        <p className='mt-0.5 text-sm font-medium text-text-main wrap-break-word'>
          {value}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface HubViewDialogProps {
  hub: HubResponse | null;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Dialog
// ─────────────────────────────────────────────────────────────────────────────

export function HubViewDialog({ hub, onClose }: HubViewDialogProps) {
  const [activeOnly, setActiveOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'staff' | 'products' | 'inventory'>('staff');

  // Search & filter for products/inventory
  const [itemSearch, setItemSearch] = useState('');
  const [itemPage, setItemPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  const staffQuery = useHubStaffQuery(hub?.hubId);
  const pageSize = 20;

  const allStaff = staffQuery.data ?? [];
  const staff = activeOnly ? allStaff.filter((s) => s.isVerified) : allStaff;

  const productFilter = itemSearch
    ? `name~~'*${itemSearch}*'`
    : undefined;

  const inventoryFilter = [
    itemSearch ? `product.name~~'*${itemSearch}*'` : '',
    statusFilter ? `status:'${statusFilter}'` : '',
  ]
    .filter(Boolean)
    .join(' and ') || undefined;

  const productsQuery = useHubProductsQuery(hub?.hubId, {
    page: itemPage + 1,
    size: pageSize,
    filter: productFilter,
  });
  const inventoryQuery = useHubInventoryItemsQuery(hub?.hubId, {
    page: itemPage + 1,
    size: pageSize,
    filter: inventoryFilter,
  });

  if (!hub) return null;

  const isActive = hub.isActive;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Panel */}
      <div className='relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white dark:bg-surface-card shadow-2xl max-h-[90vh]'>
        {/* ── Header ── */}
        <div className='flex items-center justify-between border-b border-gray-100 dark:border-white/8 px-6 py-4 shrink-0'>
          <div className='flex items-center gap-3'>
            <div className='flex size-9 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950/40'>
              <Warehouse size={18} className='text-blue-500' />
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <h2 className='text-base font-semibold text-text-main leading-none'>
                  {hub.name}
                </h2>
                <span className='inline-flex items-center rounded px-1.5 py-0.5 text-xs font-mono font-medium bg-gray-100 dark:bg-white/8 text-text-sub'>
                  {hub.code}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    isActive
                      ? 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-white/8 text-gray-500'
                  }`}
                >
                  {isActive ? (
                    <CheckCircle2 size={11} />
                  ) : (
                    <XCircle size={11} />
                  )}
                  {isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
                </span>
              </div>
              <p className='mt-0.5 text-xs text-text-sub'>Chi tiết hub</p>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='flex size-8 items-center justify-center rounded-lg text-text-sub hover:bg-gray-100 dark:hover:bg-white/8 transition'
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className='flex-1 overflow-y-auto'>
          {/* Hub Details Section */}
          <div className='px-6 py-5 border-b border-gray-100 dark:border-white/8'>
            <h3 className='mb-4 text-xs font-semibold uppercase tracking-wider text-text-sub'>
              Thông tin hub
            </h3>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <DetailRow icon={Hash} label='Mã hub' value={hub.code} />
              <DetailRow
                icon={Phone}
                label='Số điện thoại'
                value={hub.phone ?? '-'}
              />
              <div className='sm:col-span-2'>
                <DetailRow
                  icon={MapPin}
                  label='Địa chỉ'
                  value={buildAddress(hub)}
                />
              </div>
              {(hub.latitude != null || hub.longitude != null) && (
                <div className='sm:col-span-2'>
                  <DetailRow
                    icon={Navigation}
                    label='Tọa độ'
                    value={
                      hub.latitude != null && hub.longitude != null
                        ? `${hub.latitude}, ${hub.longitude}`
                        : '-'
                    }
                  />
                </div>
              )}
              <DetailRow
                icon={Calendar}
                label='Ngày tạo'
                value={formatDateTime(hub.createdAt)}
              />
              <DetailRow
                icon={Calendar}
                label='Cập nhật lần cuối'
                value={formatDateTime(hub.updatedAt)}
              />
            </div>
          </div>

          {/* Tabs: Staff / Products / Inventory */}
          <div className='px-6 py-5 border-t border-gray-100 dark:border-white/8'>
            {/* Tab bar */}
            <div className='mb-4 flex items-center gap-1 border-b border-gray-100 dark:border-white/8'>
              {([
                { key: 'staff', label: 'Nhân viên', icon: Users, count: allStaff.length },
                { key: 'products', label: 'Sản phẩm', icon: Package, count: productsQuery.data?.meta?.totalElements },
                { key: 'inventory', label: 'Tồn kho', icon: Layers, count: inventoryQuery.data?.meta?.totalElements },
              ] as const).map(({ key, label, icon: Icon, count }) => (
                <button
                  key={key}
                  type='button'
                  onClick={() => {
                    setActiveTab(key);
                    setItemPage(0);
                    setItemSearch('');
                    setStatusFilter('');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    activeTab === key
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-text-sub hover:text-text-main hover:border-gray-200 dark:hover:border-white/20'
                  }`}
                >
                  <Icon size={14} />
                  {label}
                  {count != null && (
                    <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      activeTab === key
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
                        : 'bg-gray-100 text-text-sub dark:bg-white/8'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── Staff Tab ── */}
            {activeTab === 'staff' && (
              <>
                <div className='mb-4 flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    {staffQuery.isSuccess && (
                      <span className='text-xs text-text-sub'>
                        {staff.length} nhân viên
                      </span>
                    )}
                  </div>
                  <label className='flex cursor-pointer items-center gap-2 select-none'>
                    <span className='text-xs text-text-sub'>Chỉ đã xác thực</span>
                    <div className='relative'>
                      <input
                        type='checkbox'
                        checked={activeOnly}
                        onChange={(e) => setActiveOnly(e.target.checked)}
                        className='sr-only peer'
                      />
                      <div className='h-5 w-9 rounded-full bg-gray-200 dark:bg-white/12 peer-checked:bg-blue-500 transition-colors' />
                      <div className='absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4' />
                    </div>
                  </label>
                </div>

                {staffQuery.isLoading && (
                  <div className='flex items-center justify-center py-10 gap-2 text-text-sub'>
                    <Loader2 size={18} className='animate-spin' />
                    <span className='text-sm'>Đang tải…</span>
                  </div>
                )}
                {staffQuery.isError && (
                  <div className='flex items-center justify-center py-10 text-sm text-red-500'>
                    Không thể tải danh sách nhân viên.
                  </div>
                )}
                {staffQuery.isSuccess && staff.length === 0 && (
                  <div className='flex flex-col items-center justify-center py-10 gap-2 text-text-sub'>
                    <Users size={32} className='opacity-30' />
                    <p className='text-sm'>
                      {activeOnly ? 'Không có nhân viên đã xác thực nào.' : 'Hub chưa có nhân viên.'}
                    </p>
                  </div>
                )}
                {staffQuery.isSuccess && staff.length > 0 && (
                  <div className='overflow-hidden rounded-lg border border-gray-100 dark:border-white/8'>
                    <table className='w-full text-sm'>
                      <thead>
                        <tr className='bg-gray-50 dark:bg-white/4 text-left'>
                          <th className='px-4 py-2.5 text-xs font-medium text-text-sub'>Nhân viên</th>
                          <th className='hidden sm:table-cell px-4 py-2.5 text-xs font-medium text-text-sub'>Email</th>
                          <th className='hidden md:table-cell px-4 py-2.5 text-xs font-medium text-text-sub'>SĐT</th>
                          <th className='px-4 py-2.5 text-xs font-medium text-text-sub text-right'>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-gray-50 dark:divide-white/5'>
                        {staff.map((member) => (
                          <tr key={member.userId} className='hover:bg-gray-50/60 dark:hover:bg-white/4 transition-colors'>
                            <td className='px-4 py-3'>
                              <div className='flex items-center gap-3'>
                                {member.avatarUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={member.avatarUrl} alt='' className='size-8 rounded-full object-cover shrink-0' />
                                ) : (
                                  <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-400 to-indigo-500 text-xs font-semibold text-white'>
                                    {getInitials(member.firstName, member.lastName)}
                                  </div>
                                )}
                                <div className='min-w-0'>
                                  <p className='font-medium text-text-main truncate'>{member.firstName} {member.lastName}</p>
                                  {member.nickname && <p className='text-xs text-text-sub truncate'>@{member.nickname}</p>}
                                </div>
                              </div>
                            </td>
                            <td className='hidden sm:table-cell px-4 py-3 text-text-sub truncate max-w-45'>{member.email}</td>
                            <td className='hidden md:table-cell px-4 py-3 text-text-sub'>{member.phoneNumber ?? '-'}</td>
                            <td className='px-4 py-3 text-right'>
                              {member.isVerified ? (
                                <span className='inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-950/40 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400'>
                                  <CheckCircle2 size={10} /> Đã xác thực
                                </span>
                              ) : (
                                <span className='inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-white/8 px-2 py-0.5 text-xs font-medium text-gray-500'>
                                  <XCircle size={10} /> Chưa xác thực
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* ── Products Tab ── */}
            {activeTab === 'products' && (
              <>
                {/* Search bar */}
                <div className='mb-3 relative'>
                  <Search size={13} className='absolute left-3 top-1/2 -translate-y-1/2 text-text-sub pointer-events-none' />
                  <input
                    type='text'
                    value={itemSearch}
                    onChange={(e) => { setItemSearch(e.target.value); setItemPage(0); }}
                    placeholder='Tìm sản phẩm...'
                    className='w-full h-9 rounded-lg border border-gray-200 dark:border-white/12 bg-white dark:bg-surface-card pl-9 pr-3 text-sm text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition'
                  />
                </div>

                {productsQuery.isLoading ? (
                  <div className='flex items-center justify-center py-10 gap-2 text-text-sub'>
                    <Loader2 size={18} className='animate-spin' />
                    <span className='text-sm'>Đang tải…</span>
                  </div>
                ) : productsQuery.isError ? (
                  <div className='flex items-center justify-center py-10 text-sm text-red-500'>
                    Không thể tải danh sách sản phẩm.
                  </div>
                ) : productsQuery.data?.content.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-10 gap-2 text-text-sub'>
                    <Package size={32} className='opacity-30' />
                    <p className='text-sm'>Không có sản phẩm nào.</p>
                  </div>
                ) : (
                  <>
                    <div className='space-y-2'>
                      {productsQuery.data?.content.map((product) => (
                        <div key={product.productId} className='flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-white/8 bg-gray-50/40 dark:bg-white/4 hover:bg-gray-50 dark:hover:bg-white/6 transition'>
                          <div className='relative size-10 rounded-lg overflow-hidden bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/8 shrink-0'>
                            {product.images?.[0]?.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={product.images[0].imageUrl} alt={product.name} className='w-full h-full object-cover' />
                            ) : (
                              <div className='size-full flex items-center justify-center'>
                                <Package size={16} className='text-gray-300 dark:text-white/20' />
                              </div>
                            )}
                          </div>
                          <div className='min-w-0 flex-1'>
                            <p className='text-sm font-semibold text-text-main truncate'>{product.name}</p>
                            <p className='text-xs text-text-sub'>{product.brand ?? '—'} · {product.dailyPrice.toLocaleString('vi-VN')}₫/ngày</p>
                          </div>
                          <div className='shrink-0 text-right'>
                            <p className='text-xs font-bold text-green-600 dark:text-green-400'>{product.availableStock} khả dụng</p>
                            <p className='text-[10px] text-text-sub'>cọc {product.depositAmount?.toLocaleString('vi-VN')}₫</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Pagination */}
                    {productsQuery.data && productsQuery.data.meta.totalPages > 1 && (
                      <div className='mt-3 flex items-center justify-between'>
                        <span className='text-xs text-text-sub'>
                          Trang {(productsQuery.data.meta.currentPage)}/{productsQuery.data.meta.totalPages}
                        </span>
                        <div className='flex gap-1.5'>
                          <button
                            type='button'
                            onClick={() => setItemPage((p) => Math.max(0, p - 1))}
                            disabled={itemPage === 0}
                            className='h-7 px-2.5 rounded-lg border border-gray-200 dark:border-white/12 text-xs font-medium text-text-main hover:bg-gray-50 dark:hover:bg-white/6 disabled:opacity-40 disabled:cursor-not-allowed transition'
                          >
                            Trước
                          </button>
                          <button
                            type='button'
                            onClick={() => setItemPage((p) => Math.min((productsQuery.data?.meta.totalPages ?? 1) - 1, p + 1))}
                            disabled={itemPage >= (productsQuery.data?.meta.totalPages ?? 1) - 1}
                            className='h-7 px-2.5 rounded-lg border border-gray-200 dark:border-white/12 text-xs font-medium text-text-main hover:bg-gray-50 dark:hover:bg-white/6 disabled:opacity-40 disabled:cursor-not-allowed transition'
                          >
                            Sau
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* ── Inventory Tab ── */}
            {activeTab === 'inventory' && (
              <>
                {/* Search + Status filter */}
                <div className='mb-3 flex gap-2'>
                  <div className='relative flex-1'>
                    <Search size={13} className='absolute left-3 top-1/2 -translate-y-1/2 text-text-sub pointer-events-none' />
                    <input
                      type='text'
                      value={itemSearch}
                      onChange={(e) => { setItemSearch(e.target.value); setItemPage(0); }}
                      placeholder='Tìm theo tên sản phẩm...'
                      className='w-full h-9 rounded-lg border border-gray-200 dark:border-white/12 bg-white dark:bg-surface-card pl-9 pr-3 text-sm text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition'
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setItemPage(0); }}
                    className='h-9 rounded-lg border border-gray-200 dark:border-white/12 bg-white dark:bg-surface-card px-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-blue-500/30'
                  >
                    <option value=''>Tất cả</option>
                    <option value='AVAILABLE'>Khả dụng</option>
                    <option value='RESERVED'>Đã đặt</option>
                    <option value='RENTED'>Đang thuê</option>
                    <option value='MAINTENANCE'>Bảo trì</option>
                    <option value='RETIRED'>Ngừng sử dụng</option>
                  </select>
                </div>

                {inventoryQuery.isLoading ? (
                  <div className='flex items-center justify-center py-10 gap-2 text-text-sub'>
                    <Loader2 size={18} className='animate-spin' />
                    <span className='text-sm'>Đang tải…</span>
                  </div>
                ) : inventoryQuery.isError ? (
                  <div className='flex items-center justify-center py-10 text-sm text-red-500'>
                    Không thể tải danh sách tồn kho.
                  </div>
                ) : inventoryQuery.data?.content.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-10 gap-2 text-text-sub'>
                    <Layers size={32} className='opacity-30' />
                    <p className='text-sm'>Không có tồn kho nào.</p>
                  </div>
                ) : (
                  <>
                    <div className='overflow-hidden rounded-lg border border-gray-100 dark:border-white/8'>
                      <table className='w-full text-sm'>
                        <thead>
                          <tr className='bg-gray-50 dark:bg-white/4 text-left'>
                            <th className='px-3 py-2.5 text-xs font-medium text-text-sub'>Serial</th>
                            <th className='px-3 py-2.5 text-xs font-medium text-text-sub'>Sản phẩm</th>
                            <th className='hidden sm:table-cell px-3 py-2.5 text-xs font-medium text-text-sub'>Màu</th>
                            <th className='px-3 py-2.5 text-xs font-medium text-text-sub'>Tình trạng</th>
                          </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-50 dark:divide-white/5'>
                          {inventoryQuery.data?.content.map((item) => {
                            const statusColor: Record<string, string> = {
                              AVAILABLE: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 border-green-200 dark:border-green-800/30',
                              RESERVED: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/30',
                              RENTED: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800/30',
                              MAINTENANCE: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border-orange-200 dark:border-orange-800/30',
                              RETIRED: 'bg-gray-100 text-gray-500 dark:bg-white/8 dark:text-gray-400 border-gray-200 dark:border-white/10',
                            };
                            const statusLabel: Record<string, string> = {
                              AVAILABLE: 'Khả dụng',
                              RESERVED: 'Đã đặt',
                              RENTED: 'Đang thuê',
                              MAINTENANCE: 'Bảo trì',
                              RETIRED: 'Ngừng',
                            };
                            return (
                              <tr key={item.inventoryItemId} className='hover:bg-gray-50/60 dark:hover:bg-white/4 transition-colors'>
                                <td className='px-3 py-2.5'>
                                  <span className='font-mono text-[11px] text-text-sub'>{item.serialNumber ?? '—'}</span>
                                </td>
                                <td className='px-3 py-2.5'>
                                  <p className='text-sm font-medium text-text-main truncate max-w-[140px]'>{item.productName ?? '—'}</p>
                                </td>
                                <td className='hidden sm:table-cell px-3 py-2.5'>
                                  {item.colorCode && (
                                    <div className='flex items-center gap-1.5'>
                                      <span className='size-3 rounded-full border border-gray-200 dark:border-white/20 shrink-0' style={{ backgroundColor: item.colorCode }} />
                                      <span className='text-xs text-text-sub'>{item.colorName ?? ''}</span>
                                    </div>
                                  )}
                                </td>
                                <td className='px-3 py-2.5'>
                                  <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold border ${statusColor[item.status ?? ''] ?? 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-white/8 dark:text-gray-400 dark:border-white/10'}}>
                                    {statusLabel[item.status ?? ''] ?? item.status ?? '—'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {/* Pagination */}
                    {inventoryQuery.data && inventoryQuery.data.meta.totalPages > 1 && (
                      <div className='mt-3 flex items-center justify-between'>
                        <span className='text-xs text-text-sub'>
                          Trang {inventoryQuery.data.meta.currentPage}/{inventoryQuery.data.meta.totalPages}
                        </span>
                        <div className='flex gap-1.5'>
                          <button
                            type='button'
                            onClick={() => setItemPage((p) => Math.max(0, p - 1))}
                            disabled={itemPage === 0}
                            className='h-7 px-2.5 rounded-lg border border-gray-200 dark:border-white/12 text-xs font-medium text-text-main hover:bg-gray-50 dark:hover:bg-white/6 disabled:opacity-40 disabled:cursor-not-allowed transition'
                          >
                            Trước
                          </button>
                          <button
                            type='button'
                            onClick={() => setItemPage((p) => Math.min(inventoryQuery.data!.meta.totalPages - 1, p + 1))}
                            disabled={itemPage >= inventoryQuery.data!.meta.totalPages - 1}
                            className='h-7 px-2.5 rounded-lg border border-gray-200 dark:border-white/12 text-xs font-medium text-text-main hover:bg-gray-50 dark:hover:bg-white/6 disabled:opacity-40 disabled:cursor-not-allowed transition'
                          >
                            Sau
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className='shrink-0 flex justify-end border-t border-gray-100 dark:border-white/8 px-6 py-4'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg border border-gray-200 dark:border-white/12 bg-white dark:bg-surface-card px-4 py-2 text-sm font-medium text-text-main hover:bg-gray-50 dark:hover:bg-white/6 transition'
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
