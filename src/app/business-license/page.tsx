import { InfoPageShell } from '@/components/static-pages/info-page-shell';

export default function BusinessLicensePage() {
  return (
    <InfoPageShell
      eyebrow='Pháp Lý'
      title='Thông tin giấy phép kinh doanh'
      description='Trang công khai thông tin pháp lý cơ bản của Swiftera để khách hàng và đối tác dễ dàng tra cứu khi cần đối chiếu hồ sơ, hợp đồng và chứng từ liên quan.'
      stats={[
        { label: 'Doanh nghiệp', value: 'Công ty TNHH Swiftera' },
        { label: 'Lĩnh vực', value: 'Nền tảng cho thuê thiết bị công nghệ' },
        { label: 'Trạng thái công bố', value: 'Đang cập nhật định kỳ' },
      ]}
      sections={[
        {
          title: 'Thông tin pháp lý cơ bản',
          content:
            'Các thông tin dưới đây là bản tóm tắt để tham chiếu nhanh. Khi cần hồ sơ đầy đủ phục vụ ký kết, vui lòng liên hệ bộ phận phụ trách.',
          bullets: [
            'Tên pháp nhân: Công ty TNHH Swiftera',
            'Đại diện pháp luật: Theo hồ sơ đăng ký doanh nghiệp',
            'Địa chỉ trụ sở: Cập nhật theo giấy phép hiện hành',
          ],
        },
        {
          title: 'Yêu cầu chứng từ từ đối tác',
          content:
            'Đối tác có thể gửi yêu cầu qua email kinh doanh để được hỗ trợ bộ chứng từ phù hợp với phạm vi hợp tác và quy định pháp luật hiện hành.',
          bullets: [
            'Email tiếp nhận: sales@swiftera.vn',
            'Nội dung yêu cầu: loại hồ sơ và mục đích sử dụng',
            'Thời gian xử lý: theo SLA của bộ phận pháp chế/kinh doanh',
          ],
        },
      ]}
      actions={[
        { label: 'Liên hệ mua hàng', href: '/contact-sales' },
        { label: 'Thông tin liên hệ', href: '/contact-info' },
        { label: 'Trung tâm chính sách', href: '/policies' },
      ]}
    />
  );
}
