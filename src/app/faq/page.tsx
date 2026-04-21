import { InfoPageShell } from '@/components/static-pages/info-page-shell';

export default function FaqPage() {
  return (
    <InfoPageShell
      eyebrow='FAQ'
      title='Câu hỏi thường gặp về thuê thiết bị tại Swiftera'
      description='Tổng hợp những câu hỏi phổ biến để bạn nắm nhanh quy trình thuê, thanh toán, gia hạn và trả hàng. Nếu cần hỗ trợ sâu hơn, đội CSKH luôn sẵn sàng hỗ trợ.'
      stats={[
        { label: 'Hỗ trợ khách hàng', value: '08:00 - 21:00 mỗi ngày' },
        { label: 'Kênh ticket', value: 'Theo dõi trực tuyến' },
        { label: 'Hotline', value: '1900 1234' },
      ]}
      sections={[
        {
          title: 'Làm sao để bắt đầu thuê?',
          content:
            'Bạn chọn sản phẩm, thêm vào giỏ hàng, xác nhận thông tin giao nhận và hoàn tất thanh toán. Sau khi thanh toán thành công, đơn sẽ được xử lý theo tiến trình trong trang đơn thuê.',
          bullets: [
            'Chọn sản phẩm trong danh mục',
            'Kiểm tra điều khoản và chính sách liên quan',
            'Theo dõi trạng thái đơn trực tiếp trên tài khoản',
          ],
        },
        {
          title: 'Có thể gia hạn đơn thuê không?',
          content:
            'Bạn có thể gia hạn với các đơn còn đủ điều kiện. Khi vào chi tiết đơn thuê, hệ thống sẽ hiển thị nút gia hạn nếu trạng thái hợp lệ.',
          bullets: [
            'Thời gian gia hạn phụ thuộc chính sách sản phẩm',
            'Phí gia hạn được tính minh bạch trước khi xác nhận',
            'Mọi thay đổi được lưu trong lịch sử đơn',
          ],
        },
        {
          title: 'Khi nào có thể yêu cầu thu hồi?',
          content:
            'Nút yêu cầu trả hàng chỉ khả dụng khi đơn đang ở trạng thái sử dụng. Điều này giúp đảm bảo quy trình giao nhận và thu hồi chính xác.',
        },
        {
          title: 'Thanh toán và hợp đồng có xem lại được không?',
          content:
            'Có. Bạn có thể truy cập lại đơn để xem thông tin hợp đồng, trạng thái thanh toán và các mốc thời gian liên quan bất kỳ lúc nào.',
        },
      ]}
      actions={[
        { label: 'Gửi ticket hỗ trợ', href: '/tickets' },
        { label: 'Gửi phản hồi', href: '/feedback' },
        { label: 'Trung tâm chính sách', href: '/policies' },
      ]}
    />
  );
}
