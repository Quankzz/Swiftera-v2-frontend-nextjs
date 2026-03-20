import type { Metadata } from "next";
import { Be_Vietnam_Pro, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import "@/styles/globals.css";

/** Sans chính: tối ưu hiển thị tiếng Việt (Google Fonts — Be Vietnam Pro) */
const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Swiftera - Cho thuê sản phẩm ngắn hạn",
  description: "Thuê sản phẩm khi cần, trả khi xong. Điện tử, thiết bị sự kiện, đồ gia dụng, thể thao - tiết kiệm, tiện lợi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${beVietnamPro.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
