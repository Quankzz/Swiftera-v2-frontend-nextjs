"use client";

import { Header } from "./Header";
import { Footer } from "./Footer";
import { MainLayout } from "@/layouts/MainLayout";

type LayoutProps = {
  children: React.ReactNode;
};

/**
 * Layout component cho các trang
 */
export function Layout({ children }: LayoutProps) {
  return (
    <MainLayout>
      <Header />
      <main className="min-h-screen flex-1">{children}</main>
      <Footer />
    </MainLayout>
  );
}
