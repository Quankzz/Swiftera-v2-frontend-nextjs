import { InfoPageShell } from '@/components/static-pages/info-page-shell';

export default function ContactSalesPage() {
  return (
    <InfoPageShell
      eyebrow='Liên Hệ Mua Hàng'
      title='Kết nối nhanh với đội ngũ tư vấn thuê thiết bị'
      description='Bạn cần thuê số lượng lớn cho doanh nghiệp, sự kiện hoặc lớp học? Đội ngũ tư vấn của Swiftera sẽ hỗ trợ gói thuê tối ưu theo ngân sách, thời gian và yêu cầu vận hành.'
      stats={[
        { label: 'Thời gian phản hồi', value: 'Trong vòng 30 phút' },
        { label: 'Kênh ưu tiên', value: 'Hotline 1900 1234' },
        { label: 'Email bán hàng', value: 'sales@swiftera.vn' },
      ]}
      sections={[
        {
          title: 'Khi nào nên liên hệ đội mua hàng?',
          content:
            'Nếu bạn cần thuê số lượng lớn, yêu cầu cấu hình riêng hoặc cần báo giá theo hợp đồng, hãy liên hệ trực tiếp để nhận phương án chi tiết.',
          bullets: [
            'Thuê theo dự án ngắn hạn hoặc dài hạn',
            'Thuê theo lô cho công ty, trường học, trung tâm đào tạo',
            'Yêu cầu cấu hình phần mềm hoặc thiết lập sẵn trước khi giao',
          ],
        },
        {
          title: 'Thông tin cần chuẩn bị trước khi gửi yêu cầu',
          content:
            'Càng có nhiều thông tin ban đầu, đội ngũ càng tư vấn nhanh và chính xác hơn. Bạn có thể gửi trước các thông tin bên dưới.',
          bullets: [
            'Loại thiết bị và số lượng mong muốn',
            'Thời gian cần nhận thiết bị và thời hạn thuê',
            'Địa điểm giao nhận, người liên hệ phụ trách',
          ],
        },
      ]}
      actions={[
        { label: 'Gửi phản hồi nhanh', href: '/feedback' },
        { label: 'Xem Trung tâm chính sách', href: '/policies' },
        { label: 'Thông tin liên hệ đầy đủ', href: '/contact-info' },
      ]}
    />
  );
}
