import { InfoPageShell } from '@/components/static-pages/info-page-shell';

export default function QuestionAndAnswerPage() {
  return (
    <InfoPageShell
      eyebrow='Giải Đáp Thắc Mắc'
      title='Kênh giải đáp nhanh cho mọi câu hỏi trong quá trình thuê'
      description='Khi gặp vấn đề về đơn hàng, hợp đồng, thanh toán hoặc thời gian thu hồi, bạn có thể gửi câu hỏi để đội ngũ vận hành hỗ trợ theo từng trường hợp cụ thể.'
      stats={[
        { label: 'Cam kết phản hồi', value: 'Trong giờ hành chính' },
        { label: 'Mức độ ưu tiên', value: 'Theo trạng thái đơn hàng' },
        { label: 'Hình thức hỗ trợ', value: 'Email, ticket, hotline' },
      ]}
      sections={[
        {
          title: 'Những chủ đề thường được hỏi',
          content:
            'Nội dung giải đáp tập trung vào trải nghiệm thuê thực tế từ trước thuê, trong thời gian thuê cho tới khi hoàn tất đơn.',
          bullets: [
            'Cách kiểm tra và cập nhật trạng thái đơn',
            'Thời điểm có thể gia hạn hoặc yêu cầu trả hàng',
            'Các lưu ý khi nhận và bàn giao thiết bị',
          ],
        },
        {
          title: 'Cách gửi câu hỏi để được xử lý nhanh',
          content:
            'Bạn nên ghi rõ mã đơn, trạng thái hiện tại và mong muốn hỗ trợ. Kèm hình ảnh hoặc video nếu có sự cố thiết bị để đội xử lý chính xác hơn.',
          bullets: [
            'Mã đơn thuê hoặc email tài khoản',
            'Mô tả chi tiết vấn đề đang gặp',
            'Thời gian mong muốn được hỗ trợ',
          ],
        },
      ]}
      actions={[
        { label: 'Xem FAQ', href: '/faq' },
        { label: 'Gửi phản hồi ngay', href: '/feedback' },
        { label: 'Thông tin liên hệ', href: '/contact-info' },
      ]}
    />
  );
}
