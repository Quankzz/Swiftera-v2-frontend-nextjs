import { InfoPageShell } from '@/components/static-pages/info-page-shell';

const FAQ_ITEMS = [
  {
    question: 'Swiftera là gì?',
    answer:
      'Swiftera là nền tảng cho thuê thiết bị công nghệ hàng đầu tại Việt Nam. Bạn có thể thuê laptop, camera, drone, thiết bị gaming và nhiều loại thiết bị công nghệ khác với giá theo ngày, cọc minh bạch và giao nhận tận nơi qua shipper.',
  },
  {
    question: 'Làm sao để bắt đầu thuê thiết bị?',
    answer:
      'Bạn chọn sản phẩm trong danh mục, thêm vào giỏ hàng, xác nhận thông tin giao nhận và thanh toán. Sau khi thanh toán thành công, đơn sẽ được xử lý và giao đến địa chỉ của bạn. Bạn có thể theo dõi trạng thái đơn thuê trực tiếp trên tài khoản.',
  },
  {
    question: 'Các hình thức thanh toán nào được hỗ trợ?',
    answer:
      'Swiftera hỗ trợ thanh toán qua VNPay với các phương thức: thẻ ATM nội địa, thẻ Visa/Mastercard, ví điện tử (MoMo, ZaloPay, VNPay Wallet) và mã QR. Toàn bộ thanh toán được xử lý bảo mật qua cổng VNPay.',
  },
  {
    question: 'Có thể gia hạn đơn thuê không?',
    answer:
      'Có, bạn có thể gia hạn đơn thuê khi đơn còn đủ điều kiện. Khi vào chi tiết đơn thuê, hệ thống sẽ hiển thị nút gia hạn nếu trạng thái đơn cho phép. Thời gian gia hạn phụ thuộc vào chính sách sản phẩm và phí gia hạn được tính minh bạch trước khi xác nhận.',
  },
  {
    question: 'Làm sao theo dõi đơn thuê?',
    answer:
      'Sau khi đặt hàng, bạn có thể theo dõi trạng thái đơn thuê trong mục "Đơn thuê của tôi". Các trạng thái bao gồm: Chờ thanh toán, Đã thanh toán, Đang chuẩn bị, Đang giao, Đã giao, Đang thuê, Hoàn thành và Đã hủy. Mỗi thay đổi trạng thái đều được cập nhật kịp thời.',
  },
  {
    question: 'Khi nào có thể viết đánh giá sản phẩm?',
    answer:
      'Bạn có thể viết đánh giá sau khi đơn thuê hoàn thành (trạng thái COMPLETED). Nút "Viết đánh giá" sẽ xuất hiện trong chi tiết đơn thuê đã hoàn thành. Mỗi sản phẩm chỉ được đánh giá một lần cho mỗi đơn thuê.',
  },
  {
    question: 'Tiền cọc được xử lý như thế nào?',
    answer:
      'Tiền cọc được thu khi nhận thiết bị và hoàn trả trong vòng 24 giờ sau khi bạn trả thiết bị. Số tiền cọc bằng 30–50% giá trị thiết bị tuỳ loại sản phẩm. Trong trường hợp thiết bị có hư hỏng ngoài mức hao mòn bình thường, tiền cọc có thể được sử dụng để xử lý theo chính sách.',
  },
  {
    question: 'Hình thức giao nhận với shipper như thế nào?',
    answer:
      'Swiftera sử dụng dịch vụ shipper để giao thiết bị đến địa chỉ của bạn và thu hồi khi hết hạn thuê. Khi nhận hàng, bạn nên kiểm tra tình trạng thiết bị và ký xác nhận. Khi trả hàng, nhân viên shipper sẽ kiểm tra và xác nhận bàn giao cùng bạn.',
  },
  {
    question: 'Làm sao gửi yêu cầu hỗ trợ khi gặp vấn đề?',
    answer:
      'Bạn có thể gửi yêu cầu hỗ trợ qua mục Ticket trong tài khoản, hotline 1900 1234 trong giờ hành chính, hoặc email cskh@swiftera.vn. Khi gửi yêu cầu, vui lòng cung cấp mã đơn thuê và mô tả chi tiết vấn đề để đội ngũ hỗ trợ nhanh chóng xử lý.',
  },
];

export default function FaqPage() {
  return (
    <InfoPageShell
      eyebrow='Hỗ trợ'
      title='Câu hỏi thường gặp về thuê thiết bị tại Swiftera'
      description='Tổng hợp những câu hỏi phổ biến để bạn nắm nhanh quy trình thuê, thanh toán, gia hạn và trả hàng tại Swiftera. Nếu cần hỗ trợ thêm, đội ngũ CSKH luôn sẵn sàng giúp đỡ.'
      faqs={FAQ_ITEMS}
      actions={[
        { label: 'Gửi ticket hỗ trợ', href: '/tickets' },
        { label: 'Gửi phản hồi', href: '/feedback' },
        { label: 'Trung tâm chính sách', href: '/policies' },
        { label: 'Thông tin liên hệ', href: '/contact-info' },
      ]}
    />
  );
}
