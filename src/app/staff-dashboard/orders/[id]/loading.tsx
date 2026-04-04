export default function Loading() {
  return (
    <div className="p-3 sm:p-5 lg:p-6 min-h-screen animate-pulse">
      <div className="max-w-5xl mx-auto flex flex-col gap-5">
        {/* Header skeleton */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-muted shrink-0" />
          <div className="flex flex-col gap-2">
            <div className="h-6 w-36 rounded-lg bg-muted" />
            <div className="h-4 w-52 rounded-lg bg-muted" />
          </div>
        </div>

        {/* Stepper skeleton */}
        <div className="h-16 rounded-2xl bg-muted" />

        {/* Two-column grid */}
        <div className="lg:grid lg:grid-cols-[1fr_400px] lg:gap-5 flex flex-col gap-4">
          {/* Map skeleton (right column, shown first on mobile) */}
          <div className="order-first lg:order-2 h-64 sm:h-72 lg:h-[60vh] rounded-2xl bg-muted" />
          {/* Workflow skeleton (left column) */}
          <div className="lg:order-1 flex flex-col gap-4">
            <div className="h-48 rounded-2xl bg-muted" />
            <div className="h-32 rounded-2xl bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
