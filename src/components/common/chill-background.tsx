"use client";

/**
 * Nền “chill”: gradient nhẹ + blob mờ chuyển động chậm (CSS only, nhẹ CPU).
 */
export function ChillBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {/* Lớp nền wash */}
      <div className="chill-bg-wash absolute inset-0" />

      {/* Mesh mờ */}
      <div
        className="absolute inset-0 opacity-60 mix-blend-multiply dark:opacity-40 dark:mix-blend-screen"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, oklch(0.85 0.08 195 / 0.45), transparent 55%),
            radial-gradient(ellipse 70% 60% at 80% 60%, oklch(0.88 0.06 280 / 0.4), transparent 50%),
            radial-gradient(ellipse 50% 40% at 50% 100%, oklch(0.92 0.05 160 / 0.35), transparent 45%)
          `,
        }}
      />
      <div
        className="absolute inset-0 hidden opacity-50 dark:block dark:opacity-35"
        style={{
          background: `
            radial-gradient(ellipse 75% 55% at 15% 30%, oklch(0.35 0.12 200 / 0.5), transparent 55%),
            radial-gradient(ellipse 65% 50% at 85% 70%, oklch(0.32 0.1 280 / 0.45), transparent 50%),
            radial-gradient(ellipse 55% 45% at 50% 95%, oklch(0.38 0.08 170 / 0.4), transparent 45%)
          `,
        }}
      />

      {/* Blob di chuyển chậm */}
      <div
        className="absolute -left-[15%] top-[-20%] h-[min(85vw,520px)] w-[min(85vw,520px)] rounded-full bg-teal-400/25 blur-[100px] dark:bg-teal-500/15 animate-chill-drift"
        style={{ animationDuration: "26s" }}
      />
      <div
        className="absolute -right-[10%] top-[25%] h-[min(70vw,440px)] w-[min(70vw,440px)] rounded-full bg-violet-400/20 blur-[110px] dark:bg-indigo-500/18 animate-chill-drift-reverse"
        style={{ animationDuration: "32s", animationDelay: "-6s" }}
      />
      <div
        className="absolute bottom-[-15%] left-[20%] h-[min(65vw,400px)] w-[min(65vw,400px)] rounded-full bg-cyan-300/22 blur-[95px] dark:bg-cyan-600/12 animate-chill-drift"
        style={{ animationDuration: "22s", animationDelay: "-12s" }}
      />
      <div
        className="absolute bottom-[10%] right-[5%] h-[min(50vw,320px)] w-[min(50vw,320px)] rounded-full bg-amber-200/30 blur-[80px] dark:bg-teal-900/25 animate-chill-drift-reverse"
        style={{ animationDuration: "28s", animationDelay: "-3s" }}
      />

      {/* Noise siêu nhẹ (grain) */}
      <div
        className="absolute inset-0 opacity-[0.35] mix-blend-overlay dark:opacity-[0.2] dark:mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />
    </div>
  );
}
