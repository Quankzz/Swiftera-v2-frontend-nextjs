import Link from "next/link";
import { Layout } from "@/components/Layout";
import {
  Phone,
  Mail,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  LayoutDashboard,
  FileText,
  Clock,
} from "lucide-react";

export default function ContactSalesPage() {
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
                <LayoutDashboard className="size-3.5" />
                Tư vấn cho thuê
              </div>
              <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                Kết nối đội ngũ tư vấn thuê thiết bị chuyên nghiệp
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Bạn cần thuê số lượng lớn cho doanh nghiệp, sự kiện hoặc lớp
                học? Đội ngũ tư vấn của Swiftera sẽ hỗ trợ gói thuê tối ưu theo
                ngân sách, thời gian và yêu cầu vận hành.
              </p>
            </div>
          </section>

          {/* Quick Contact Cards */}
          <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <a
              href="tel:19001234"
              className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 transition-all hover:border-blue-500/30 hover:shadow-md dark:bg-card/80"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                <Phone className="size-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Hotline
                </p>
                <p className="mt-1 text-lg font-bold text-foreground group-hover:text-blue-500">
                  1900 1234
                </p>
                <p className="text-xs text-muted-foreground">
                  08:00 – 21:00 mỗi ngày
                </p>
              </div>
            </a>

            <a
              href="mailto:sales@swiftera.vn"
              className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 transition-all hover:border-blue-500/30 hover:shadow-md dark:bg-card/80"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                <Mail className="size-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Email Sales
                </p>
                <p className="mt-1 text-base font-bold text-foreground group-hover:text-blue-500">
                  sales@swiftera.vn
                </p>
                <p className="text-xs text-muted-foreground">
                  Phản hồi trong 30 phút
                </p>
              </div>
            </a>

            <Link
              href="/feedback"
              className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 transition-all hover:border-blue-500/30 hover:shadow-md dark:bg-card/80"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                <MessageSquare className="size-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Nhanh nhất
                </p>
                <p className="mt-1 text-base font-bold text-foreground group-hover:text-blue-500">
                  Gửi yêu cầu online
                </p>
                <p className="text-xs text-muted-foreground">
                  Phản hồi trong giờ hành chính
                </p>
              </div>
            </Link>
          </section>

          {/* Info Section */}
          <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <article className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm dark:bg-card/80">
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-blue-500/10">
                <FileText className="size-5 text-blue-500" />
              </div>
              <h2 className="text-base font-bold text-foreground">
                Khi nào nên liên hệ?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Nếu bạn cần thuê số lượng lớn, yêu cầu cấu hình riêng hoặc cần
                báo giá theo hợp đồng, hãy liên hệ trực tiếp để nhận phương án
                chi tiết.
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "Thuê theo dự án ngắn hạn hoặc dài hạn",
                  "Thuê theo lô cho công ty, trường học, trung tâm đào tạo",
                  "Yêu cầu cấu hình phần mềm hoặc thiết lập sẵn trước khi giao",
                  "Cần xuất hóa đơn GTGT cho doanh nghiệp",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  >
                    <CheckCircle className="mt-0.5 size-4 shrink-0 text-blue-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm dark:bg-card/80">
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-blue-500/10">
                <Clock className="size-5 text-blue-500" />
              </div>
              <h2 className="text-base font-bold text-foreground">
                Thông tin cần chuẩn bị
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Càng có nhiều thông tin ban đầu, đội ngũ càng tư vấn nhanh và
                chính xác hơn. Bạn có thể gửi trước các thông tin bên dưới.
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "Loại thiết bị và số lượng mong muốn",
                  "Thời gian cần nhận thiết bị và thời hạn thuê",
                  "Địa điểm giao nhận, người liên hệ phụ trách",
                  "Yêu cầu đặc biệt về cấu hình hoặc phụ kiện kèm theo",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  >
                    <CheckCircle className="mt-0.5 size-4 shrink-0 text-blue-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </section>

          {/* CTA Banner */}
          <section className="mt-8 relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm dark:bg-card/80">
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-transparent to-blue-400/10 pointer-events-none" />

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-lg font-bold text-foreground">
                  Bạn đã sẵn sàng bắt đầu thuê?
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Khám phá danh mục thiết bị hoặc gửi yêu cầu tư vấn ngay.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-600 hover:shadow-md"
                >
                  Xem danh mục thiết bị
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/policies"
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
                >
                  Chính sách
                </Link>
              </div>
            </div>
          </section>

          {/* Quick Links Pills */}
          <section className="mt-6 rounded-2xl border border-border/60 bg-card p-5">
            <p className="mb-3 text-sm font-semibold text-foreground">
              Liên kết nhanh
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/faq"
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-500/20 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-400 dark:hover:bg-blue-400/20"
              >
                FAQ
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                href="/contact-info"
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-500/20 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-400 dark:hover:bg-blue-400/20"
              >
                Thông tin liên hệ
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                href="/q-and-a"
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-500/20 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-400 dark:hover:bg-blue-400/20"
              >
                Giải đáp thắc mắc
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                href="/business-license"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted/50"
              >
                Pháp lý
              </Link>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
