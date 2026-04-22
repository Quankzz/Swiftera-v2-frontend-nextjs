import { Skeleton } from "@/components/ui/skeleton";

export default function CartLoading() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white font-sans dark:bg-surface-base">
      <div className="relative mx-auto w-full max-w-7xl px-3 pb-16 pt-8 sm:px-4 sm:pt-4 md:px-6 md:pt-8">
        {/* Breadcrumb skeleton */}
        <div className="mb-6">
          <Skeleton className="h-4 w-40" />
        </div>

        {/* Header skeleton */}
        <div className="mb-10 space-y-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-80" />
        </div>

        {/* Grid skeleton */}
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Cart lines col */}
          <div className="space-y-4 lg:col-span-7">
            <div className="rounded-2xl border border-border/60 bg-card/70 shadow-md">
              <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start border-b border-border/30 last:border-0"
                >
                  <Skeleton className="size-36 shrink-0 rounded-xl" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16 rounded-lg" />
                      <Skeleton className="h-5 w-20 rounded-lg" />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <Skeleton className="h-9 w-28 rounded-xl" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary col */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-border/60 bg-card/70 shadow-md">
              <div className="space-y-5 p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-5" />
                  <Skeleton className="h-6 w-36" />
                </div>
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-28" />
                      <Skeleton className="h-8 w-28" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
