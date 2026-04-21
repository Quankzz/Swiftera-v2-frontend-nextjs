import Link from 'next/link';
import { Layout } from '@/components/Layout';
import {
  Building2,
  MapPin,
  FileText,
  Send,
  Mail,
  ArrowRight,
} from 'lucide-react';

function InfoRow({
  label,
  value,
  pending,
}: {
  label: string;
  value: string;
  pending?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/40 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`text-right text-sm font-semibold ${
          pending ? 'text-muted-foreground italic' : 'text-foreground'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function BusinessLicensePage() {
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
                Pháp lý
              </div>
              <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                Giấy phép kinh doanh Swiftera
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Thông tin pháp lý cơ bản của Swiftera, nền tảng cho thuê thiết bị công
                nghệ. Dữ liệu bên dưới đang trong quá trình cập nhật định kỳ theo quy
                định pháp luật hiện hành.
              </p>
            </div>
          </section>

          {/* License Info Grid */}
          <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">

            {/* Business Info Card */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm dark:bg-card/80">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/10">
                  <Building2 className="size-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Thông tin doanh nghiệp</h2>
                  <p className="text-xs text-muted-foreground">Đăng ký kinh doanh hợp lệ</p>
                </div>
              </div>

              <div className="space-y-3">
                <InfoRow label="Tên doanh nghiệp" value="Công ty TNHH Swiftera" />
                <InfoRow label="Tên giao dịch" value="Swiftera" />
                <InfoRow label="Mã số thuế" value="0xxxxxxxxx" pending />
                <InfoRow label="Lĩnh vực" value="Nền tảng cho thuê thiết bị công nghệ" />
                <InfoRow label="Ngày cấp phép" value="Đang cập nhật" pending />
              </div>
            </div>

            {/* Representative Card */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm dark:bg-card/80">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/10">
                  <FileText className="size-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Đại diện pháp lý</h2>
                  <p className="text-xs text-muted-foreground">Theo hồ sơ đăng ký doanh nghiệp</p>
                </div>
              </div>

              <div className="space-y-3">
                <InfoRow label="Người đại diện" value="Đang cập nhật" pending />
                <InfoRow label="Chức vụ" value="Đang cập nhật" pending />
                <InfoRow label="Số CCCD" value="Đang cập nhật" pending />
                <InfoRow label="Địa chỉ trụ sở" value="Thành phố Hồ Chí Minh, Việt Nam" />
              </div>
            </div>

          </section>

          {/* Address Section */}
          <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6 shadow-sm dark:bg-card/80">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10">
                <MapPin className="size-5 text-blue-500" />
              </div>
              <h2 className="text-base font-bold text-foreground">Địa chỉ trụ sở</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Thành phố Hồ Chí Minh, Việt Nam. Thông tin chi tiết sẽ được cập nhật sau khi
              hoàn tất thủ tục pháp lý.
            </p>
          </section>

          {/* Document Request Section */}
          <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6 shadow-sm dark:bg-card/80">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10">
                <Send className="size-5 text-blue-500" />
              </div>
              <h2 className="text-base font-bold text-foreground">Yêu cầu chứng từ từ đối tác</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Đối tác có thể gửi yêu cầu qua email kinh doanh để được hỗ trợ bộ chứng từ
              phù hợp với phạm vi hợp tác và quy định pháp luật hiện hành.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="mailto:sales@swiftera.vn"
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-500/20 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-400 dark:hover:bg-blue-400/20"
              >
                <Mail className="size-3.5" />
                sales@swiftera.vn
              </a>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3.5 py-1.5 text-xs text-muted-foreground">
                Nội dung: loại hồ sơ + mục đích sử dụng
              </span>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="mt-6 rounded-2xl border border-border/60 bg-muted/20 p-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Thông tin trên là bản tóm tắt để tham chiếu nhanh. Khi cần hồ sơ đầy đủ
              phục vụ ký kết hợp đồng hoặc đối soát pháp lý, vui lòng liên hệ bộ phận
              kinh doanh qua email sales@swiftera.vn. Swiftera cam kết tuân thủ các quy định
              pháp luật hiện hành về kinh doanh và bảo vệ quyền lợi khách hàng.
            </p>
          </section>

          {/* Quick Links Pills */}
          <section className="mt-6 rounded-2xl border border-border/60 bg-card p-5">
            <p className="mb-3 text-sm font-semibold text-foreground">
              Liên kết nhanh
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/contact-sales"
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-500/20 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-400 dark:hover:bg-blue-400/20"
              >
                Liên hệ bán hàng
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
                href="/policies"
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-500/20 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-400 dark:hover:bg-blue-400/20"
              >
                Chính sách
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                href="/q-and-a"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted/50"
              >
                Giải đáp thắc mắc
              </Link>
            </div>
          </section>

        </div>
      </main>
    </Layout>
  );
}
