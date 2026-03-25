import { Hub, HubListParams, PaginatedResponse } from '@/types/dashboard';
import { fetchApi } from '../apiService';

type DataMode = 'mock' | 'api';
const DATA_MODE = (process.env.NEXT_PUBLIC_DATA_MODE as DataMode) || 'mock';
const USE_MOCK = DATA_MODE === 'mock';

// ─── Mock store ────────────────────────────────────────────────────
const mockHubs: Hub[] = [
  {
    hubId: 'hub-001',
    code: 'HN-01',
    name: 'Hub Hà Nội – Hoàn Kiếm',
    addressLine: '12 Lê Thái Tổ',
    ward: 'Hàng Trống',
    district: 'Hoàn Kiếm',
    city: 'Hà Nội',
    latitude: 21.0285,
    longitude: 105.8542,
    phone: '024 3823 4567',
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    hubId: 'hub-002',
    code: 'HN-02',
    name: 'Hub Hà Nội – Cầu Giấy',
    addressLine: '89 Cầu Giấy',
    ward: 'Quan Hoa',
    district: 'Cầu Giấy',
    city: 'Hà Nội',
    latitude: 21.0334,
    longitude: 105.7979,
    phone: '024 3756 1234',
    isActive: true,
    createdAt: '2025-02-01T00:00:00.000Z',
    updatedAt: '2025-02-01T00:00:00.000Z',
  },
  {
    hubId: 'hub-003',
    code: 'HCM-01',
    name: 'Hub TP.HCM – Quận 1',
    addressLine: '45 Lê Lợi',
    ward: 'Bến Nghé',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    latitude: 10.7769,
    longitude: 106.7009,
    phone: '028 3823 9900',
    isActive: true,
    createdAt: '2025-03-01T00:00:00.000Z',
    updatedAt: '2025-03-01T00:00:00.000Z',
  },
  {
    hubId: 'hub-004',
    code: 'HCM-02',
    name: 'Hub TP.HCM – Bình Thạnh',
    addressLine: '230 Đinh Bộ Lĩnh',
    ward: 'Phường 26',
    district: 'Bình Thạnh',
    city: 'TP. Hồ Chí Minh',
    latitude: 10.8016,
    longitude: 106.7142,
    phone: '028 3512 6789',
    isActive: false,
    createdAt: '2025-04-01T00:00:00.000Z',
    updatedAt: '2025-06-01T00:00:00.000Z',
  },
];

// ─── Mock staff per hub ────────────────────────────────────────────
export interface HubStaff {
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  hubId: string;
  role: 'delivery' | 'pickup' | 'both';
}

export const mockHubStaff: HubStaff[] = [
  {
    userId: 'staff-001',
    fullName: 'Nguyễn Văn Giao',
    email: 'giao.hN01@swiftera.com',
    phone: '0912 111 001',
    hubId: 'hub-001',
    role: 'delivery',
  },
  {
    userId: 'staff-002',
    fullName: 'Trần Thị Thu',
    email: 'thu.hn01@swiftera.com',
    phone: '0912 111 002',
    hubId: 'hub-001',
    role: 'both',
  },
  {
    userId: 'staff-003',
    fullName: 'Lê Văn Lấy',
    email: 'lay.hn01@swiftera.com',
    phone: '0912 111 003',
    hubId: 'hub-001',
    role: 'pickup',
  },
  {
    userId: 'staff-004',
    fullName: 'Phạm Minh Tuấn',
    email: 'tuan.hn02@swiftera.com',
    phone: '0912 222 001',
    hubId: 'hub-002',
    role: 'delivery',
  },
  {
    userId: 'staff-005',
    fullName: 'Hoàng Thị Mai',
    email: 'mai.hn02@swiftera.com',
    phone: '0912 222 002',
    hubId: 'hub-002',
    role: 'both',
  },
  {
    userId: 'staff-006',
    fullName: 'Đặng Văn Nam',
    email: 'nam.hcm01@swiftera.com',
    phone: '0912 333 001',
    hubId: 'hub-003',
    role: 'delivery',
  },
  {
    userId: 'staff-007',
    fullName: 'Bùi Thị Lan',
    email: 'lan.hcm01@swiftera.com',
    phone: '0912 333 002',
    hubId: 'hub-003',
    role: 'both',
  },
  {
    userId: 'staff-008',
    fullName: 'Vũ Quốc Hùng',
    email: 'hung.hcm01@swiftera.com',
    phone: '0912 333 003',
    hubId: 'hub-003',
    role: 'pickup',
  },
];

// ─── Helpers ───────────────────────────────────────────────────────
function applyFilters(hubs: Hub[], params?: HubListParams): Hub[] {
  let result = [...hubs];
  if (params?.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.code.toLowerCase().includes(q) ||
        h.city?.toLowerCase().includes(q),
    );
  }
  if (params?.isActive !== undefined) {
    result = result.filter((h) => h.isActive === params.isActive);
  }
  return result;
}

// ─── Repository ────────────────────────────────────────────────────
export const hubsRepository = {
  async list(params?: HubListParams): Promise<PaginatedResponse<Hub>> {
    if (USE_MOCK) {
      const filtered = applyFilters(mockHubs, params);
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 50;
      const start = (page - 1) * limit;
      return {
        data: filtered.slice(start, start + limit),
        total: filtered.length,
      };
    }
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.search) qs.set('search', params.search);
    if (params?.isActive !== undefined)
      qs.set('isActive', String(params.isActive));
    return fetchApi<PaginatedResponse<Hub>>(`/hubs?${qs}`);
  },

  async get(id: string): Promise<Hub> {
    if (USE_MOCK) {
      const hub = mockHubs.find((h) => h.hubId === id);
      if (!hub) throw new Error('Hub not found');
      return hub;
    }
    return fetchApi<Hub>(`/hubs/${id}`);
  },

  async getStaff(hubId: string): Promise<HubStaff[]> {
    if (USE_MOCK) {
      return mockHubStaff.filter((s) => s.hubId === hubId);
    }
    return fetchApi<HubStaff[]>(`/hubs/${hubId}/staff`);
  },
};
