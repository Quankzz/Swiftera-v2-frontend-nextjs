"use client";

import { Layout } from "@/components/Layout";
import { FeedbackForm } from "@/features/tickets/components/FeedbackForm";
import { HeadphonesIcon } from "lucide-react";

export default function FeedbackPage() {
  return (
    <Layout>
      <section className="min-h-screen bg-gray-50 dark:bg-surface-base py-10">
        <div className="mx-auto max-w-4xl px-4 lg:px-6 space-y-6">
          {/* Hero header */}
          <div className="rounded-2xl border border-gray-100 dark:border-white/8 bg-white dark:bg-black/20 p-7 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-theme-primary-start flex items-center justify-center shrink-0">
              <HeadphonesIcon size={26} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                Gửi yêu cầu hỗ trợ
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Điền form bên dưới - chúng tôi sẽ phản hồi trong vòng 24 giờ.
              </p>
            </div>
          </div>

          {/* Form */}
          <FeedbackForm />
        </div>
      </section>
    </Layout>
  );
}
