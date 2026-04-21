import { InfoPageShell } from '@/components/static-pages/info-page-shell';

export default function ContactInfoPage() {
  return (
    <InfoPageShell
      eyebrow='Thông Tin Liên Hệ'
      title='Kênh liên hệ chính thức của Swiftera'
      description='Bạn có thể liên hệ Swiftera qua hotline, email hoặc kênh hỗ trợ trực tuyến. Tất cả yêu cầu đều được tiếp nhận và phân loại để xử lý theo đúng mức độ ưu tiên.'
      stats={[
        { label: 'Hotline', value: '1900 1234' },
        { label: 'Email CSKH', value: 'cskh@swiftera.vn' },
        { label: 'Email kinh doanh', value: 'sales@swiftera.vn' },
      ]}
      sections={[
        {
          title: 'Kênh hỗ trợ khách hàng',
          content:
            'Phù hợp cho các vấn đề liên quan đến đơn thuê đang hoạt động, giao nhận thiết bị, yêu cầu thu hồi hoặc hỗ trợ sử dụng tài khoản.',
          bullets: [
            'Hotline: 1900 1234',
            'Email: cskh@swiftera.vn',
            'Mục ticket trong tài khoản khách hàng',
          ],
        },
        {
          title: 'Kênh liên hệ mua hàng doanh nghiệp',
          content:
            'Dành cho nhu cầu thuê số lượng lớn, báo giá theo hợp đồng hoặc tư vấn gói thuê theo dự án.',
          bullets: [
            'Email: sales@swiftera.vn',
            'Trang liên hệ mua hàng: /contact-sales',
            'Thời gian phản hồi ưu tiên theo khung giờ làm việc',
          ],
        },
      ]}
      actions={[
        { label: 'Liên hệ mua hàng', href: '/contact-sales' },
        { label: 'Xem FAQ', href: '/faq' },
        { label: 'Trung tâm chính sách', href: '/policies' },
      ]}
    />
  );
}
