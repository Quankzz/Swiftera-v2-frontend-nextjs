import Link from "next/link";
import { Layout } from "@/components/Layout";
import {
  Phone,
  Mail,
  Clock,
  MessageSquare,
  FileText,
  ArrowRight,
} from "lucide-react";

export default function ContactInfoPage() {
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
                Liên hệ
              </div>
              <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                Kênh hỗ trợ khách hàng Swiftera
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Swiftera là nền tảng cho thuê thiết bị công nghệ hàng đầu tại
                Việt Nam. Chúng tôi luôn sẵn sàng hỗ trợ bạn qua các kênh liên
                lạc bên dưới.
              </p>
            </div>
          </section>

          {/* Contact Channel Cards */}
          <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Hotline */}
            <div className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-blue-500/30 hover:shadow-md dark:bg-card/80">
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-blue-500/10">
                <Phone className="size-5 text-blue-500" />
              </div>
              <h3 className="text-base font-bold text-foreground">Hotline</h3>
              <p className="mt-1 text-2xl font-black text-foreground group-hover:text-blue-500">
                1900 1234
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Gọi ngay để được hỗ trợ trực tiếp
              </p>
              <a
                href="tel:19001234"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-500 transition-colors hover:text-blue-600"
              >
                Gọi ngay
                <ArrowRight className="size-4" />
              </a>
            </div>

            {/* Email CSKH */}
            <div className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-blue-500/30 hover:shadow-md dark:bg-card/80">
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-blue-500/10">
                <Mail className="size-5 text-blue-500" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Email CSKH
              </h3>
              <p className="mt-1 text-base font-semibold text-foreground group-hover:text-blue-500">
                cskh@swiftera.vn
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Hỗ trợ đơn thuê, giao nhận, kỹ thuật
              </p>
              <a
                href="mailto:cskh@swiftera.vn"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-500 transition-colors hover:text-blue-600"
              >
                Gửi email
                <ArrowRight className="size-4" />
              </a>
            </div>

            {/* Email Sales */}
            <div className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-blue-500/30 hover:shadow-md dark:bg-card/80">
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-blue-500/10">
                <Mail className="size-5 text-blue-500" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Email Sales
              </h3>
              <p className="mt-1 text-base font-semibold text-foreground group-hover:text-blue-500">
                sales@swiftera.vn
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Thuê số lượng lớn, báo giá theo hợp đồng
              </p>
              <a
                href="mailto:sales@swiftera.vn"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-500 transition-colors hover:text-blue-600"
              >
                Gửi email
                <ArrowRight className="size-4" />
              </a>
            </div>

            {/* Giờ hỗ trợ */}
            <div className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-blue-500/30 hover:shadow-md dark:bg-card/80">
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-blue-500/10">
                <Clock className="size-5 text-blue-500" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Giờ hỗ trợ
              </h3>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Hotline & Ticket
                  </span>
                  <span className="font-semibold text-foreground">
                    08:00 – 21:00
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">CSKH Email</span>
                  <span className="font-semibold text-foreground">
                    Trong giờ hành chính
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ticket Online</span>
                  <span className="font-semibold text-foreground">
                    24/7 tiếp nhận
                  </span>
                </div>
              </div>
            </div>

            {/* Ticket hỗ trợ */}
            <div className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-blue-500/30 hover:shadow-md dark:bg-card/80">
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-blue-500/10">
                <MessageSquare className="size-5 text-blue-500" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Ticket hỗ trợ
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Gửi yêu cầu hỗ trợ trực tuyến qua hệ thống ticket trong tài
                khoản của bạn.
              </p>
              <Link
                href="/tickets"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-500 transition-colors hover:text-blue-600"
              >
                Tạo ticket
                <ArrowRight className="size-4" />
              </Link>
            </div>

            {/* Phản hồi nhanh */}
            <div className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-blue-500/30 hover:shadow-md dark:bg-card/80">
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-blue-500/10">
                <FileText className="size-5 text-blue-500" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Phản hồi nhanh
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Gửi phản hồi hoặc góp ý về dịch vụ. Chúng tôi phản hồi trong
                thời gian sớm nhất.
              </p>
              <Link
                href="/feedback"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-500 transition-colors hover:text-blue-600"
              >
                Gửi phản hồi
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </section>

          {/* Quick Links Pills */}
          <section className="mt-8 rounded-2xl border border-border/60 bg-card p-5">
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
                href="/contact-sales"
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-500/20 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-400 dark:hover:bg-blue-400/20"
              >
                Liên hệ bán hàng
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                href="/policies"
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-500/20 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-400 dark:hover:bg-blue-400/20"
              >
                Chính sách
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                href="/q-and-a"
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-500/20 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-400 dark:hover:bg-blue-400/20"
              >
                Hướng dẫn
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
