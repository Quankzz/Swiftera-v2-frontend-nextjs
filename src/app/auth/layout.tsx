import { Montserrat } from "next/font/google";
import SplashCursor from "@/components/common/SplashCursor";
import Waves from "@/components/common/Waves";
import { AuthHeader } from "@/components/auth/AuthHeader";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${montserrat.className} relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-[#e0f2fe] via-[#bae6fd] to-[#7dd3fc] dark:from-[#0c1929] dark:via-[#0c2d48] dark:to-[#0c1929]`}
    >
      <div className="absolute inset-0 flex items-center justify-center opacity-70 dark:opacity-45">
        <Waves
          lineColor="#0ea5e9"
          backgroundColor="rgba(14, 165, 233, 0.08)"
          waveSpeedX={0.0125}
          waveSpeedY={0.01}
          waveAmpX={40}
          waveAmpY={20}
          friction={0.9}
          tension={0.01}
          maxCursorMove={120}
          xGap={12}
          yGap={36}
        />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1001,
          pointerEvents: "none",
        }}
      >
        {/* <SplashCursor
          SIM_RESOLUTION={128}
          DYE_RESOLUTION={1440}
          DENSITY_DISSIPATION={3.5}
          VELOCITY_DISSIPATION={2}
          PRESSURE={0.1}
          CURL={3}
          SPLAT_RADIUS={0.2}
          SPLAT_FORCE={6000}
          COLOR_UPDATE_SPEED={10}
        /> */}
      </div>
      <AuthHeader />
      {children}
    </div>
  );
}
