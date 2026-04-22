import { InfoPageShell } from "@/components/static-pages/info-page-shell";

export default function ReturnPolicyPage() {
  return (
    <InfoPageShell
      eyebrow="Chính Sách"
      title="Chính sách đổi trả thiết bị"
      description="Trang này tóm tắt nguyên tắc đổi trả và quy trình xử lý khi khách hàng cần trả lại thiết bị trước hạn, khi thiết bị phát sinh lỗi hoặc cần hỗ trợ thay thế."
      stats={[
        { label: "Phạm vi", value: "Áp dụng cho đơn thuê hợp lệ" },
        { label: "Kênh yêu cầu", value: "Chi tiết đơn thuê / hỗ trợ" },
        { label: "Trạng thái theo dõi", value: "Theo tiến trình đơn hàng" },
      ]}
      sections={[
        {
          title: "Nguyên tắc chung",
          content:
            "Yêu cầu đổi trả được xử lý minh bạch theo tình trạng đơn và tình trạng thiết bị thực tế tại thời điểm tiếp nhận.",
          bullets: [
            "Ưu tiên xử lý yêu cầu hợp lệ, có đầy đủ thông tin đơn",
            "Tình trạng thiết bị được ghi nhận tại thời điểm bàn giao",
            "Phí phát sinh (nếu có) được thông báo rõ trước khi chốt",
          ],
        },
        {
          title: "Quy trình đề xuất",
          content:
            "Bạn có thể tạo yêu cầu từ trang chi tiết đơn thuê. Sau khi tiếp nhận, hệ thống cập nhật trạng thái để bạn theo dõi toàn bộ tiến trình.",
          bullets: [
            "Gửi yêu cầu trả hàng từ đơn đang sử dụng",
            "Nhân viên xác nhận lịch thu hồi",
            "Chốt đơn khi hoàn tất thu hồi và đối soát",
          ],
        },
      ]}
      actions={[
        { label: "Trung tâm chính sách", href: "/policies" },
        { label: "Chính sách vận chuyển", href: "/policies/shipping" },
        { label: "Chính sách bảo hành", href: "/policies/warranty" },
      ]}
    />
  );
}
