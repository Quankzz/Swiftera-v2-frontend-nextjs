import {
  ContactTicket,
  ContactTicketListParams,
  ContactTicketStatus,
  PaginatedResponse,
  UpdateContactTicketStatusInput,
} from '@/types/dashboard';
import { fetchApi } from '../apiService';

type DataMode = 'mock' | 'api';
const DATA_MODE = (process.env.NEXT_PUBLIC_DATA_MODE as DataMode) || 'mock';
const USE_MOCK = DATA_MODE === 'mock';

// ─── Mock store ───────────────────────────────────────────────────
// eslint-disable-next-line prefer-const
let mockTickets: ContactTicket[] = [
  {
    contactTicketId: 'ct-001',
    userId: 'u2',
    rentalOrderId: 'DH-2026-001',
    handledByUserId: null,
    subject: 'Sản phẩm bị lỗi khi nhận hàng',
    requestMessage:
      '<p>Tôi nhận được sản phẩm nhưng <strong>màn hình bị vỡ</strong>, mong được hỗ trợ <span style="color:#ef4444">đổi trả gấp</span>.</p><p>Ảnh chụp hiện trạng đã được đính kèm theo đơn hàng. Rất mong nhận được phản hồi trong hôm nay.</p>',
    status: 'pending',
    createdAt: '2026-03-20T08:00:00.000Z',
    updatedAt: '2026-03-20T08:00:00.000Z',
    userFullName: 'Người dùng Test',
    userEmail: 'test@swiftera.com',
  },
  {
    contactTicketId: 'ct-002',
    userId: 'u3',
    rentalOrderId: 'DH-2026-002',
    handledByUserId: 'u1',
    subject: 'Hỏi về chính sách gia hạn thuê',
    requestMessage:
      '<p>Cho tôi hỏi nếu muốn <em>thuê thêm 5 ngày</em> thì phải làm thủ tục như thế nào?</p><ul><li>Có cần đặt cọc thêm không?</li><li>Phí gia hạn được tính theo ngày hay theo tuần?</li><li>Có thể gia hạn qua ứng dụng không hay phải liên hệ trực tiếp?</li></ul>',
    status: 'in_progress',
    createdAt: '2026-03-21T10:30:00.000Z',
    updatedAt: '2026-03-22T09:00:00.000Z',
    userFullName: 'Nguyễn Văn Nam',
    userEmail: 'nam.nguyen@example.com',
  },
  {
    contactTicketId: 'ct-003',
    userId: 'u4',
    rentalOrderId: null,
    handledByUserId: 'u1',
    subject: 'Góp ý cải thiện ứng dụng',
    requestMessage:
      '<h2>Đề xuất tính năng mới</h2><p>Ứng dụng nên bổ sung <strong>tính năng so sánh sản phẩm</strong> để người dùng dễ chọn hơn.</p><p>Cụ thể, tôi mong muốn có thể:</p><ol><li>So sánh tối đa <em>3 sản phẩm</em> cùng lúc</li><li>Xem bảng giá theo từng khoảng thời gian thuê</li><li>Lọc theo <span style="color:#3b82f6">đánh giá</span> và <span style="color:#3b82f6">khoảng cách</span></li></ol>',
    status: 'resolved',
    createdAt: '2026-03-22T14:00:00.000Z',
    updatedAt: '2026-03-23T11:00:00.000Z',
    userFullName: 'Lê Thị Hoa',
    userEmail: 'hoa.le@example.com',
  },
  {
    contactTicketId: 'ct-004',
    userId: null,
    rentalOrderId: null,
    handledByUserId: null,
    subject: 'Liên hệ hợp tác kinh doanh',
    requestMessage:
      '<p>Xin chào, tôi đại diện cho <strong>Công ty TNHH Thiết bị ABC</strong>.</p><p>Tôi muốn hỏi về <em>cơ hội hợp tác cung cấp sản phẩm</em> cho nền tảng của quý công ty. Hiện chúng tôi đang có:</p><ul><li>Kho hàng với hơn <strong>500 sản phẩm</strong> điện tử cao cấp</li><li>Khả năng giao hàng toàn quốc trong <em>24h</em></li></ul><p>Mong nhận được liên hệ từ phía quý công ty. Trân trọng!</p>',
    status: 'pending',
    createdAt: '2026-03-24T07:15:00.000Z',
    updatedAt: '2026-03-24T07:15:00.000Z',
    userFullName: null,
    userEmail: null,
  },
  {
    contactTicketId: 'ct-005',
    userId: 'u5',
    rentalOrderId: 'DH-2026-003',
    handledByUserId: 'u1',
    subject: 'Phản ánh dịch vụ giao hàng chậm',
    requestMessage:
      '<p>Đơn hàng của tôi bị <span style="color:#ef4444"><strong>trễ 3 ngày</strong></span> so với dự kiến, rất ảnh hưởng đến kế hoạch sử dụng.</p><p>Tôi đã liên hệ hotline nhưng <em>không có ai bắt máy</em>. Đây là lần thứ 2 tôi gặp vấn đề này với dịch vụ giao hàng của Swiftera.</p><p>Mong quý công ty xem lại quy trình vận chuyển và <strong>bồi thường</strong> phù hợp.</p>',
    status: 'closed',
    createdAt: '2026-03-18T09:45:00.000Z',
    updatedAt: '2026-03-19T16:00:00.000Z',
    userFullName: 'Trần Minh Tuấn',
    userEmail: 'tuan.tran@example.com',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────
function applyFilters(
  tickets: ContactTicket[],
  params?: ContactTicketListParams,
) {
  let result = [...tickets];
  if (params?.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.subject.toLowerCase().includes(q) ||
        t.userFullName?.toLowerCase().includes(q) ||
        t.userEmail?.toLowerCase().includes(q) ||
        t.rentalOrderId?.toLowerCase().includes(q),
    );
  }
  if (params?.status) {
    result = result.filter((t) => t.status === params.status);
  }
  return result;
}

// ─── Repository ───────────────────────────────────────────────────
export const contactTicketsRepository = {
  async list(
    params?: ContactTicketListParams,
  ): Promise<PaginatedResponse<ContactTicket>> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      const filtered = applyFilters(mockTickets, params);
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 10;
      const start = (page - 1) * limit;
      return {
        data: filtered.slice(start, start + limit),
        total: filtered.length,
      };
    }
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    return fetchApi<PaginatedResponse<ContactTicket>>(
      `/contact-tickets?${query}`,
    );
  },

  async get(id: string): Promise<ContactTicket> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 200));
      const t = mockTickets.find((t) => t.contactTicketId === id);
      if (!t) throw new Error('Ticket not found');
      return t;
    }
    return fetchApi<ContactTicket>(`/contact-tickets/${id}`);
  },

  async updateStatus(
    id: string,
    payload: UpdateContactTicketStatusInput,
  ): Promise<ContactTicket> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      const idx = mockTickets.findIndex((t) => t.contactTicketId === id);
      if (idx === -1) throw new Error('Ticket not found');
      mockTickets[idx] = {
        ...mockTickets[idx],
        status: payload.status,
        handledByUserId:
          payload.handledByUserId !== undefined
            ? payload.handledByUserId
            : mockTickets[idx].handledByUserId,
        updatedAt: new Date().toISOString(),
      };
      return mockTickets[idx];
    }
    return fetchApi<ContactTicket>(`/contact-tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};

// ─── Status helpers (reusable in UI) ─────────────────────────────
export const TICKET_STATUSES: {
  value: ContactTicketStatus;
  label: string;
}[] = [
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'in_progress', label: 'Đang xử lý' },
  { value: 'resolved', label: 'Đã giải quyết' },
  { value: 'closed', label: 'Đã đóng' },
];
