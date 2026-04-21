import Link from 'next/link';
import { Layout } from '@/components/Layout';
import {
  Search,
  CreditCard,
  PackageSearch,
  Ticket,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

const GUIDES = [
  {
    icon: Search,
    title: 'Tự kiểm tra trạng thái đơn thuê',
    content:
      'Truy cập mục "Đơn thuê của tôi" để xem trạng thái hiện tại. Các trạng thái: Chờ thanh toán → Đã thanh toán → Đang chuẩn bị → Đang giao → Đã giao → Đang thuê → Hoàn thành.',
    bullets: [
      'Đơn chưa thanh toán sẽ bị huỷ sau 24 giờ',
      'Trạng thái cập nhật trong vòng 15-30 phút sau thao tác',
      'Bạn sẽ nhận thông báo qua email khi trạng thái thay đổi',
    ],
  },
  {
    icon: CreditCard,
    title: 'Kiểm tra thanh toán',
    content:
      'Xem chi tiết thanh toán trong trang đơn thuê. Thông tin bao gồm: số tiền thuê, tiền cọc, mã giao dịch VNPay và trạng thái thanh toán.',
    bullets: [
      'Thanh toán thành công sẽ hiển thị trạng thái "Đã thanh toán"',
      'Mã giao dịch dùng để đối chiếu với ngân hàng',
      'Tiền cọc hoàn trả được xử lý trong 24h sau khi trả thiết bị',
    ],
  },
  {
    icon: PackageSearch,
    title: 'Theo dõi tình trạng giao hàng',
    content:
      'Khi đơn chuyển sang "Đang giao", thông tin shipper và thời gian dự kiến sẽ được cập nhật. Bạn có thể chủ động liên hệ hotline để hỏi tiến độ.',
    bullets: [
      'Nhân viên giao hàng sẽ liên hệ trước khi đến',
      'Kiểm tra tình trạng thiết bị ngay khi nhận',
      'Ký xác nhận bàn giao sau khi đã kiểm tra đầy đủ',
    ],
  },
  {
    icon: Ticket,
    title: 'Khi nào nên tạo ticket hỗ trợ?',
    content:
      'Tạo ticket khi bạn cần hỗ trợ về: sự cố thiết bị trong quá trình sử dụng, yêu cầu thay đổi thông tin đơn, hoặc khiếu nại chưa được giải quyết qua các kênh khác.',
    bullets: [
      'Ticket được phân loại và xử lý theo mức độ ưu tiên',
      'Phản hồi ticket trong giờ hành chính',
      'Kèm hình ảnh/video nếu có sự cố để đội xử lý chính xác hơn',
    ],
  },
];

const COMMON_SITUATIONS = [
  {
    situation: 'Thiết bị giao đến bị hư hỏng',
    solution:
      'Không nhận hàng và báo ngay qua hotline 1900 1234. Đội ngũ sẽ xử lý đổi thiết bị và điều phối giao lại trong thời gian sớm nhất.',
  },
  {
    situation: 'Thiết bị hỏng trong quá trình sử dụng',
    solution:
      'Gửi ticket kèm mô tả sự cố và hình ảnh. Đội ngũ kỹ thuật sẽ phản hồi trong 2-4 giờ làm việc để hướng dẫn xử lý hoặc đổi thiết bị.',
  },
  {
    situation: 'Cần gia hạn đơn thuê',
    solution:
      'Vào chi tiết đơn thuê đang hoạt động và nhấn nút "Gia hạn". Thời gian gia hạn tối thiểu 1 ngày và phí được tính theo giá thuê hiện tại.',
  },
  {
    situation: 'Muốn trả hàng sớm',
    solution:
      'Yêu cầu thu hồi sớm qua mục "Tôi muốn trả hàng" trong chi tiết đơn. Swiftera sẽ sắp xếp shipper thu hồi. Phí thuê được tính đến ngày thiết bị được bàn giao lại.',
  },
  {
    situation: 'Quên thanh toán đơn',
    solution:
      'Đơn chưa thanh toán sẽ bị huỷ tự động sau 24 giờ. Bạn có thể đặt lại đơn mới nếu thiết bị vẫn còn sẵn sàng.',
  },
];

export default function QuestionAndAnswerPage() {
  return (
    <Layout stickyHeader>
      <main className="bg-background pb-16 pt-10">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10">

          {/* Hero Header */}
          <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card px-6 py-8 shadow-sm sm:px-8 sm:py-10">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-500/[0.06] blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-sky-400/[0.06] blur-[120px]" />

            <div className="relative z-10">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-500 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-400">
                Hướng dẫn tự phục vụ
              </div>
              <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                Giải đáp nhanh cho mọi câu hỏi trong quá trình thuê
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Khi gặp vấn đề về đơn thuê, hợp đồng, thanh toán hoặc giao nhận, hãy
                thử các bước hướng dẫn bên dưới trước khi gửi yêu cầu hỗ trợ.
              </p>
            </div>
          </section>

          {/* Guide Cards */}
          <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {GUIDES.map((guide) => {
              const Icon = guide.icon;
              return (
                <article
                  key={guide.title}
                  className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm dark:bg-card/80"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                      <Icon className="size-5 text-blue-500" />
                    </div>
                    <h2 className="text-base font-bold text-foreground">{guide.title}</h2>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {guide.content}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {guide.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-blue-500" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </section>

          {/* Common Situations */}
          <section className="mt-8">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
              <CheckCircle className="size-5 text-blue-500" />
              Tình huống thường gặp
            </h2>
            <div className="space-y-3">
              {COMMON_SITUATIONS.map((item) => (
                <div
                  key={item.situation}
                  className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm dark:bg-card/80"
                >
                  <CheckCircle className="mt-0.5 size-5 shrink-0 text-blue-500" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.situation}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {item.solution}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Actions Bar */}
          <section className="mt-8 rounded-2xl border border-border/60 bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Không tìm thấy câu trả lời phù hợp?
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Đội ngũ hỗ trợ của Swiftera luôn sẵn sàng giúp đỡ bạn.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/tickets"
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-600"
                >
                  Gửi ticket hỗ trợ
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
                >
                  Xem FAQ
                </Link>
                <Link
                  href="/contact-info"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
                >
                  Thông tin liên hệ
                </Link>
              </div>
            </div>
          </section>

        </div>
      </main>
    </Layout>
  );
}
