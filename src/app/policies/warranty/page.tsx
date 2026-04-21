import { InfoPageShell } from '@/components/static-pages/info-page-shell';

export default function WarrantyPolicyPage() {
  return (
    <InfoPageShell
      eyebrow='Chính Sách'
      title='Chính sách bảo hành và hỗ trợ kỹ thuật'
      description='Swiftera duy trì quy trình tiếp nhận và xử lý sự cố thiết bị trong thời gian thuê để bảo đảm trải nghiệm sử dụng ổn định cho khách hàng.'
      stats={[
        { label: 'Mục tiêu xử lý', value: 'Nhanh, minh bạch, có theo dõi' },
        { label: 'Kênh hỗ trợ', value: 'Ticket / hotline / email' },
        { label: 'Phạm vi', value: 'Thiết bị thuê còn hiệu lực' },
      ]}
      sections={[
        {
          title: 'Khi nào nên gửi yêu cầu bảo hành?',
          content:
            'Khi thiết bị xuất hiện lỗi ảnh hưởng đến trải nghiệm sử dụng, hãy gửi yêu cầu càng sớm càng tốt để được hướng dẫn xử lý hoặc đổi thiết bị phù hợp.',
          bullets: [
            'Lỗi phần cứng, lỗi vận hành bất thường',
            'Thiết bị không đáp ứng thông số đã cam kết',
            'Cần hỗ trợ kỹ thuật từ xa để tiếp tục sử dụng',
          ],
        },
        {
          title: 'Quy trình hỗ trợ',
          content:
            'Yêu cầu sẽ được ghi nhận, phân loại và phản hồi theo mức độ ảnh hưởng. Với trường hợp cần thu hồi kiểm tra, lịch hẹn sẽ được thông báo trước.',
          bullets: [
            'Tiếp nhận và xác minh thông tin đơn',
            'Hướng dẫn khắc phục bước đầu',
            'Thu hồi/đổi thiết bị khi đủ điều kiện',
          ],
        },
      ]}
      actions={[
        { label: 'Trung tâm chính sách', href: '/policies' },
        { label: 'Chính sách đổi trả', href: '/policies/returns' },
        { label: 'Gửi phản hồi kỹ thuật', href: '/feedback' },
      ]}
    />
  );
}
