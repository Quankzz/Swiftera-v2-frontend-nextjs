import { Layout } from '@/components/Layout';
import SplashCursor from '@/components/common/SplashCursor';
import { ChillBackground } from '@/components/common/chill-background';

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout>
      {/* <SplashCursor /> */}
      <ChillBackground />
      {children}
    </Layout>
  );
}
