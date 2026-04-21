import { InfoPageShell } from '@/components/static-pages/info-page-shell';

export default function ShippingPolicyPage() {
  return (
    <InfoPageShell
      eyebrow='Chính Sách'
      title='Chính sách vận chuyển và giao nhận'
      description='Thông tin tổng quan về phạm vi giao nhận, thời gian xử lý đơn và các lưu ý trong quá trình bàn giao thiết bị thuê đến khách hàng.'
      stats={[
        { label: 'Trạng thái theo dõi', value: 'Realtime trong đơn thuê' },
        { label: 'Phương thức', value: 'Giao nhận theo khu vực' },
        { label: 'Liên hệ hỗ trợ', value: '1900 1234' },
      ]}
      sections={[
        {
          title: 'Trước khi giao thiết bị',
          content:
            'Swiftera xác nhận thông tin liên hệ, địa điểm và khung giờ bàn giao để đảm bảo giao nhận đúng kế hoạch.',
          bullets: [
            'Xác thực thông tin người nhận',
            'Kiểm tra điều kiện thanh toán trước giao',
            'Thông báo trạng thái đơn khi bắt đầu vận chuyển',
          ],
        },
        {
          title: 'Trong và sau khi giao nhận',
          content:
            'Khách hàng được khuyến nghị kiểm tra thiết bị ngay khi nhận. Mọi điểm chưa phù hợp cần phản hồi sớm để hệ thống ghi nhận và xử lý.',
          bullets: [
            'Đối chiếu thiết bị và phụ kiện đi kèm',
            'Ghi nhận thời điểm giao nhận thực tế',
            'Liên hệ hỗ trợ nếu cần điều chỉnh lịch',
          ],
        },
      ]}
      actions={[
        { label: 'Trung tâm chính sách', href: '/policies' },
        { label: 'Chính sách đổi trả', href: '/policies/returns' },
        { label: 'Thông tin liên hệ', href: '/contact-info' },
      ]}
    />
  );
}
