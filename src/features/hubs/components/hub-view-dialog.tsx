'use client';

import { useMemo, useState, type ComponentType, type ReactNode } from 'react';
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  Hash,
  Layers,
  Loader2,
  MapPin,
  Navigation,
  Package,
  Phone,
  PlusCircle,
  Search,
  Users,
  Warehouse,
  X,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import type { HubResponse } from '@/features/hubs/types';
import type {
  InventoryItemResponse,
  ProductResponse,
} from '@/features/products/types';
import {
  useAssignProductsToHubMutation,
  useHubInventoryItemsQuery,
  useHubProductsQuery,
  useHubStaffQuery,
  useUnassignProductsFromHubMutation,
} from '@/features/hubs/hooks/use-hub-management';
import { useProductsQuery } from '@/features/products/hooks/use-product-management';

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
  return [hub.addressLine, hub.ward, hub.district, hub.city].filter(Boolean).join(', ') || '-';
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function escapeFilterTerm(value: string): string {
  return value.trim().replace(/'/g, "\\'");
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return 'Có lỗi xảy ra. Vui lòng thử lại.';
}

function getPrimaryImageUrl(product: ProductResponse): string | null {
  return product.images?.[0]?.imageUrl ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: ReactNode;
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

const INVENTORY_STATUS_LABELS: Record<InventoryItemResponse['status'], string> = {
  AVAILABLE: 'Khả dụng',
  RESERVED: 'Đã đặt',
  RENTED: 'Đang thuê',
  MAINTENANCE: 'Bảo trì',
  DAMAGED: 'Hỏng',
  RETIRED: 'Ngừng sử dụng',
};

const INVENTORY_STATUS_CLASSES: Record<InventoryItemResponse['status'], string> = {
  AVAILABLE:
    'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 border-green-200 dark:border-green-800/30',
  RESERVED:
    'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/30',
  RENTED:
    'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800/30',
  MAINTENANCE:
    'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border-orange-200 dark:border-orange-800/30',
  DAMAGED:
    'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-800/30',
  RETIRED:
    'bg-gray-100 text-gray-500 dark:bg-white/8 dark:text-gray-400 border-gray-200 dark:border-white/10',
};

function InventoryStatusBadge({ status }: { status: InventoryItemResponse['status'] }) {
  return (
    <span
      className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold border ${INVENTORY_STATUS_CLASSES[status]}`}
    >
      {INVENTORY_STATUS_LABELS[status]}
    </span>
  );
}

interface ProductInventoryGroupRowProps {
  hubId: string;
  product: ProductResponse;
  statusFilter: string;
  onUnassign: (product: ProductResponse) => void;
  isUnassigning: boolean;
}

function ProductInventoryGroupRow({
  hubId,
  product,
  statusFilter,
  onUnassign,
  isUnassigning,
}: ProductInventoryGroupRowProps) {
  const [expanded, setExpanded] = useState(false);

  const inventoryFilter = useMemo(() => {
    const parts: string[] = [`product.productId:'${product.productId}'`];
    if (statusFilter) parts.push(`status:'${statusFilter}'`);
    return parts.join(' and ');
  }, [product.productId, statusFilter]);

  const inventoryQuery = useHubInventoryItemsQuery(hubId, {
    page: 1,
    size: 50,
    filter: inventoryFilter,
  });

  const inventoryRows = inventoryQuery.data?.content ?? [];
  const inventoryTotal = inventoryQuery.data?.meta.totalElements ?? inventoryRows.length;

  return (
    <div className='rounded-lg border border-gray-100 dark:border-white/8 bg-gray-50/40 dark:bg-white/4'>
      <div className='flex items-center gap-3 p-3'>
        <div className='relative size-11 rounded-lg overflow-hidden bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/8 shrink-0'>
          {getPrimaryImageUrl(product) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getPrimaryImageUrl(product)!}
              alt={product.name}
              className='w-full h-full object-cover'
            />
          ) : (
            <div className='size-full flex items-center justify-center'>
              <Package size={16} className='text-gray-300 dark:text-white/20' />
            </div>
          )}
        </div>

        <div className='min-w-0 flex-1'>
          <p className='text-sm font-semibold text-text-main truncate'>{product.name}</p>
          <p className='text-xs text-text-sub'>
            {product.brand ?? '-'} · {product.dailyPrice.toLocaleString('vi-VN')}₫/ngày
          </p>
          <div className='mt-1 flex items-center gap-2 text-[11px] text-text-sub'>
            <span className='inline-flex items-center gap-1 rounded-full bg-white dark:bg-white/8 px-2 py-0.5'>
              <Layers size={10} />
              {inventoryQuery.isLoading ? 'Đang tải tồn kho...' : `${inventoryTotal} serial`}
            </span>
            <span className='inline-flex items-center gap-1 rounded-full bg-white dark:bg-white/8 px-2 py-0.5'>
              <Hash size={10} />
              {product.productId.slice(0, 8)}
            </span>
          </div>
        </div>

        <div className='shrink-0 flex items-center gap-2'>
          <button
            type='button'
            onClick={() => setExpanded((prev) => !prev)}
            className='inline-flex h-8 items-center gap-1 rounded-lg border border-gray-200 dark:border-white/12 bg-white dark:bg-surface-card px-2.5 text-xs font-medium text-text-main hover:bg-gray-50 dark:hover:bg-white/6 transition'
          >
            {expanded ? 'Ẩn serial' : 'Xem serial'}
            <ChevronDown
              size={13}
              className={`transition-transform ${expanded ? 'rotate-180' : 'rotate-0'}`}
            />
          </button>

          <button
            type='button'
            onClick={() => onUnassign(product)}
            disabled={isUnassigning}
            className='inline-flex h-8 items-center gap-1 rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/30 px-2.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition'
          >
            {isUnassigning ? <Loader2 size={13} className='animate-spin' /> : <XCircle size={13} />}
            Gỡ khỏi hub
          </button>
        </div>
      </div>

      {expanded && (
        <div className='border-t border-gray-100 dark:border-white/8 px-3 pb-3 pt-2'>
          {inventoryQuery.isLoading ? (
            <div className='flex items-center justify-center py-6 gap-2 text-text-sub'>
              <Loader2 size={16} className='animate-spin' />
              <span className='text-xs'>Đang tải serial...</span>
            </div>
          ) : inventoryQuery.isError ? (
            <div className='py-4 text-xs text-red-500'>
              Không thể tải danh sách serial của sản phẩm này.
            </div>
          ) : inventoryRows.length === 0 ? (
            <div className='py-4 text-xs text-text-sub'>Không có serial nào với bộ lọc hiện tại.</div>
          ) : (
            <div className='overflow-hidden rounded-lg border border-gray-100 dark:border-white/8 bg-white dark:bg-surface-card'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='bg-gray-50 dark:bg-white/4 text-left'>
                    <th className='px-3 py-2 text-xs font-medium text-text-sub'>Serial</th>
                    <th className='px-3 py-2 text-xs font-medium text-text-sub'>Màu</th>
                    <th className='px-3 py-2 text-xs font-medium text-text-sub'>Trạng thái</th>
                    <th className='hidden sm:table-cell px-3 py-2 text-xs font-medium text-text-sub'>Hub</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-50 dark:divide-white/5'>
                  {inventoryRows.map((item) => (
                    <tr
                      key={item.inventoryItemId}
                      className='hover:bg-gray-50/60 dark:hover:bg-white/4 transition-colors'
                    >
                      <td className='px-3 py-2'>
                        <span className='font-mono text-[11px] text-text-sub'>{item.serialNumber}</span>
                      </td>
                      <td className='px-3 py-2'>
                        {item.colorCode ? (
                          <div className='flex items-center gap-1.5'>
                            <span
                              className='size-3 rounded-full border border-gray-200 dark:border-white/20 shrink-0'
                              style={{ backgroundColor: item.colorCode }}
                            />
                            <span className='text-xs text-text-sub'>{item.colorName ?? '-'}</span>
                          </div>
                        ) : (
                          <span className='text-xs text-text-sub'>-</span>
                        )}
                      </td>
                      <td className='px-3 py-2'>
                        <InventoryStatusBadge status={item.status} />
                      </td>
                      <td className='hidden sm:table-cell px-3 py-2 text-xs text-text-sub'>
                        {item.hubCode}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
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
  const [activeTab, setActiveTab] = useState<'staff' | 'products'>('staff');

  const [productSearch, setProductSearch] = useState('');
  const [productPage, setProductPage] = useState(0);
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState('');
  const [assignSearch, setAssignSearch] = useState('');

  const pageSize = 20;

  const staffQuery = useHubStaffQuery(hub?.hubId);

  const escapedProductSearch = escapeFilterTerm(productSearch);
  const productFilter = escapedProductSearch
    ? `name~~'*${escapedProductSearch}*'`
    : undefined;

  const productsQuery = useHubProductsQuery(hub?.hubId, {
    page: productPage + 1,
    size: pageSize,
    filter: productFilter,
  });

  const assignedProductsQuery = useHubProductsQuery(hub?.hubId, {
    page: 1,
    size: 500,
  });

  const escapedAssignSearch = escapeFilterTerm(assignSearch);
  const pickerFilter = [
    'isActive:true',
    escapedAssignSearch ? `name~~'*${escapedAssignSearch}*'` : '',
  ]
    .filter(Boolean)
    .join(' and ');

  const productPickerQuery = useProductsQuery({
    page: 1,
    size: 8,
    sort: 'name,asc',
    filter: pickerFilter,
  });

  const assignMutation = useAssignProductsToHubMutation();
  const unassignMutation = useUnassignProductsFromHubMutation();

  const allStaff = staffQuery.data ?? [];
  const staff = activeOnly ? allStaff.filter((s) => s.isVerified) : allStaff;

  const assignedProductIds = useMemo(
    () => new Set((assignedProductsQuery.data?.content ?? []).map((product) => product.productId)),
    [assignedProductsQuery.data?.content],
  );

  const pickerProducts = productPickerQuery.data?.content ?? [];
  const hubProducts = productsQuery.data?.content ?? [];
  const hubProductsMeta = productsQuery.data?.meta;

  if (!hub) return null;

  const handleAssignProduct = (product: ProductResponse) => {
    assignMutation.mutate(
      {
        hubId: hub.hubId,
        payload: { productIds: [product.productId] },
      },
      {
        onSuccess: () => {
          toast.success(`Đã gán sản phẩm ${product.name} vào hub.`);
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
        },
      },
    );
  };

  const handleUnassignProduct = (product: ProductResponse) => {
    unassignMutation.mutate(
      {
        hubId: hub.hubId,
        payload: { productIds: [product.productId] },
      },
      {
        onSuccess: () => {
          toast.success(`Đã gỡ sản phẩm ${product.name} khỏi hub.`);
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
        },
      },
    );
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />

      <div className='relative z-10 flex w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white dark:bg-surface-card shadow-2xl max-h-[90vh]'>
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
                    hub.isActive
                      ? 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-white/8 text-gray-500'
                  }`}
                >
                  {hub.isActive ? (
                    <CheckCircle2 size={11} />
                  ) : (
                    <XCircle size={11} />
                  )}
                  {hub.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
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

        <div className='flex-1 overflow-y-auto'>
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

          <div className='px-6 py-5 border-t border-gray-100 dark:border-white/8'>
            <div className='mb-4 flex items-center gap-1 border-b border-gray-100 dark:border-white/8'>
              {([
                { key: 'staff', label: 'Nhân viên', icon: Users, count: allStaff.length },
                {
                  key: 'products',
                  label: 'Sản phẩm & tồn kho',
                  icon: Package,
                  count: productsQuery.data?.meta?.totalElements,
                },
              ] as const).map(({ key, label, icon: Icon, count }) => (
                <button
                  key={key}
                  type='button'
                  onClick={() => {
                    setActiveTab(key);
                    if (key === 'products') {
                      setProductPage(0);
                    }
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
                    <span
                      className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        activeTab === key
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
                          : 'bg-gray-100 text-text-sub dark:bg-white/8'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>

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
                          <tr
                            key={member.userId}
                            className='hover:bg-gray-50/60 dark:hover:bg-white/4 transition-colors'
                          >
                            <td className='px-4 py-3'>
                              <div className='flex items-center gap-3'>
                                {member.avatarUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={member.avatarUrl}
                                    alt=''
                                    className='size-8 rounded-full object-cover shrink-0'
                                  />
                                ) : (
                                  <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-400 to-indigo-500 text-xs font-semibold text-white'>
                                    {getInitials(member.firstName, member.lastName)}
                                  </div>
                                )}
                                <div className='min-w-0'>
                                  <p className='font-medium text-text-main truncate'>
                                    {member.firstName} {member.lastName}
                                  </p>
                                  {member.nickname && (
                                    <p className='text-xs text-text-sub truncate'>@{member.nickname}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className='hidden sm:table-cell px-4 py-3 text-text-sub truncate max-w-45'>
                              {member.email}
                            </td>
                            <td className='hidden md:table-cell px-4 py-3 text-text-sub'>
                              {member.phoneNumber ?? '-'}
                            </td>
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

            {activeTab === 'products' && (
              <div className='space-y-4'>
                <div className='rounded-lg border border-blue-100 dark:border-blue-900/30 bg-blue-50/40 dark:bg-blue-950/20 p-3'>
                  <div className='mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300'>
                    <PlusCircle size={14} />
                    <p className='text-sm font-medium'>Gán thêm sản phẩm vào hub</p>
                  </div>
                  <div className='relative'>
                    <Search
                      size={13}
                      className='absolute left-3 top-1/2 -translate-y-1/2 text-text-sub pointer-events-none'
                    />
                    <input
                      type='text'
                      value={assignSearch}
                      onChange={(e) => setAssignSearch(e.target.value)}
                      placeholder='Tìm sản phẩm để gán...'
                      className='w-full h-9 rounded-lg border border-gray-200 dark:border-white/12 bg-white dark:bg-surface-card pl-9 pr-3 text-sm text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition'
                    />
                  </div>

                  <div className='mt-2 space-y-2'>
                    {productPickerQuery.isLoading && (
                      <div className='flex items-center gap-2 text-xs text-text-sub py-2'>
                        <Loader2 size={14} className='animate-spin' />
                        Đang tải sản phẩm...
                      </div>
                    )}

                    {productPickerQuery.isError && (
                      <p className='text-xs text-red-500'>Không thể tải danh sách sản phẩm để gán.</p>
                    )}

                    {!productPickerQuery.isLoading &&
                      !productPickerQuery.isError &&
                      pickerProducts.length === 0 && (
                        <p className='text-xs text-text-sub'>
                          Không tìm thấy sản phẩm phù hợp để gán.
                        </p>
                      )}

                    {!productPickerQuery.isLoading &&
                      !productPickerQuery.isError &&
                      pickerProducts.length > 0 && (
                        <div className='space-y-1'>
                          {pickerProducts.map((product) => {
                            const alreadyAssigned = assignedProductIds.has(product.productId);
                            const isAssigningCurrent =
                              assignMutation.isPending &&
                              assignMutation.variables?.payload.productIds?.[0] === product.productId;

                            return (
                              <div
                                key={product.productId}
                                className='flex items-center justify-between rounded-lg border border-gray-100 dark:border-white/8 bg-white dark:bg-surface-card px-2.5 py-2'
                              >
                                <div className='min-w-0 pr-2'>
                                  <p className='text-sm font-medium text-text-main truncate'>
                                    {product.name}
                                  </p>
                                  <p className='text-xs text-text-sub'>
                                    {product.brand ?? '-'} · {product.dailyPrice.toLocaleString('vi-VN')}₫/ngày
                                  </p>
                                </div>

                                <button
                                  type='button'
                                  disabled={alreadyAssigned || isAssigningCurrent}
                                  onClick={() => handleAssignProduct(product)}
                                  className={`inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-xs font-medium transition ${
                                    alreadyAssigned
                                      ? 'bg-gray-100 dark:bg-white/8 text-text-sub cursor-not-allowed'
                                      : 'bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed'
                                  }`}
                                >
                                  {isAssigningCurrent ? (
                                    <Loader2 size={12} className='animate-spin' />
                                  ) : alreadyAssigned ? (
                                    <CheckCircle2 size={12} />
                                  ) : (
                                    <PlusCircle size={12} />
                                  )}
                                  {alreadyAssigned ? 'Đã gán' : 'Gán'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                  </div>
                </div>

                <div className='flex flex-col gap-2 md:flex-row'>
                  <div className='relative flex-1'>
                    <Search
                      size={13}
                      className='absolute left-3 top-1/2 -translate-y-1/2 text-text-sub pointer-events-none'
                    />
                    <input
                      type='text'
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setProductPage(0);
                      }}
                      placeholder='Tìm sản phẩm trong hub...'
                      className='w-full h-9 rounded-lg border border-gray-200 dark:border-white/12 bg-white dark:bg-surface-card pl-9 pr-3 text-sm text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition'
                    />
                  </div>
                  <select
                    value={inventoryStatusFilter}
                    onChange={(e) => setInventoryStatusFilter(e.target.value)}
                    className='h-9 rounded-lg border border-gray-200 dark:border-white/12 bg-white dark:bg-surface-card px-3 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-blue-500/30'
                  >
                    <option value=''>Mọi trạng thái serial</option>
                    <option value='AVAILABLE'>Khả dụng</option>
                    <option value='RESERVED'>Đã đặt</option>
                    <option value='RENTED'>Đang thuê</option>
                    <option value='MAINTENANCE'>Bảo trì</option>
                    <option value='DAMAGED'>Hỏng</option>
                    <option value='RETIRED'>Ngừng sử dụng</option>
                  </select>
                </div>

                {productsQuery.isLoading ? (
                  <div className='flex items-center justify-center py-10 gap-2 text-text-sub'>
                    <Loader2 size={18} className='animate-spin' />
                    <span className='text-sm'>Đang tải sản phẩm trong hub...</span>
                  </div>
                ) : productsQuery.isError ? (
                  <div className='flex items-center justify-center py-10 text-sm text-red-500'>
                    Không thể tải danh sách sản phẩm trong hub.
                  </div>
                ) : hubProducts.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-10 gap-2 text-text-sub'>
                    <Package size={32} className='opacity-30' />
                    <p className='text-sm'>Hub chưa có sản phẩm nào.</p>
                  </div>
                ) : (
                  <>
                    <div className='space-y-2'>
                      {hubProducts.map((product) => (
                        <ProductInventoryGroupRow
                          key={product.productId}
                          hubId={hub.hubId}
                          product={product}
                          statusFilter={inventoryStatusFilter}
                          onUnassign={handleUnassignProduct}
                          isUnassigning={
                            unassignMutation.isPending &&
                            unassignMutation.variables?.payload.productIds?.[0] === product.productId
                          }
                        />
                      ))}
                    </div>

                    {hubProductsMeta && hubProductsMeta.totalPages > 1 && (
                      <div className='mt-3 flex items-center justify-between'>
                        <span className='text-xs text-text-sub'>
                          Trang {hubProductsMeta.currentPage}/{hubProductsMeta.totalPages}
                        </span>
                        <div className='flex gap-1.5'>
                          <button
                            type='button'
                            onClick={() => setProductPage((p) => Math.max(0, p - 1))}
                            disabled={productPage === 0}
                            className='h-7 px-2.5 rounded-lg border border-gray-200 dark:border-white/12 text-xs font-medium text-text-main hover:bg-gray-50 dark:hover:bg-white/6 disabled:opacity-40 disabled:cursor-not-allowed transition'
                          >
                            Trước
                          </button>
                          <button
                            type='button'
                            onClick={() =>
                              setProductPage((p) =>
                                Math.min((hubProductsMeta?.totalPages ?? 1) - 1, p + 1),
                              )
                            }
                            disabled={productPage >= hubProductsMeta.totalPages - 1}
                            className='h-7 px-2.5 rounded-lg border border-gray-200 dark:border-white/12 text-xs font-medium text-text-main hover:bg-gray-50 dark:hover:bg-white/6 disabled:opacity-40 disabled:cursor-not-allowed transition'
                          >
                            Sau
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

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
