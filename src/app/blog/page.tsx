import { Layout } from "@/components/Layout";

export default function BlogPage() {
  return (
    <Layout>
      <div className="px-6 py-16 sm:px-12">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Blog
        </h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          Danh sách bài viết sẽ được cập nhật tại đây.
        </p>
      </div>
    </Layout>
  );
}
