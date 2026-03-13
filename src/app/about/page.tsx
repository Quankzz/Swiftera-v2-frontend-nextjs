import { Layout } from "@/components/Layout";


export default function AboutPage() {
  return (
    <Layout>
      <div className="px-6 py-16 sm:px-12">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Giới thiệu
        </h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          Đây là trang giới thiệu của Swiftera.
        </p>
      </div>
    </Layout>
  );
}
