export default function Loading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen animate-pulse">
      <div className="max-w-4xl mx-auto flex flex-col gap-5">
        {/* Title */}
        <div className="h-8 w-44 rounded-lg bg-muted" />

        {/* Search + filter bar */}
        <div className="flex gap-2">
          <div className="h-10 flex-1 rounded-xl bg-muted" />
          <div className="h-10 w-24 rounded-xl bg-muted" />
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 overflow-hidden">
          {[80, 100, 90, 95, 85, 70, 80, 75].map((w, i) => (
            <div
              key={i}
              className="h-8 rounded-full bg-muted shrink-0"
              style={{ width: w }}
            />
          ))}
        </div>

        {/* Order cards */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 w-28 rounded-lg bg-muted" />
              <div className="h-6 w-20 rounded-full bg-muted" />
            </div>
            <div className="h-4 w-48 rounded-lg bg-muted" />
            <div className="flex gap-3">
              <div className="h-4 w-24 rounded-lg bg-muted" />
              <div className="h-4 w-24 rounded-lg bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
