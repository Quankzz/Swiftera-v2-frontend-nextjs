import { Layout } from '@/components/Layout';
import { HeroBanner } from '@/components/home/hero-banner';
import { HomeCategories } from '@/components/home/home-categories';
import {
  HomeFeaturedProducts,
  HomeBudgetProducts,
} from '@/components/home/home-products';
import { CalendarRange, ShieldCheck, Smile, WalletCards } from 'lucide-react';

const heroSlides = [
  {
    title: 'Yêu công nghệ.',
    subtitle: 'Chọn Swiftera.',
    description:
      'Nâng cấp thiết bị dễ dàng, chi phí hợp lý, giao nhanh và đổi trả thuận tiện.',
    image:
      'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=400&q=80',
    // Tập hợp ảnh hiển thị trên orbit (sản phẩm cho thuê)
    orbitImages: [
      'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=400&q=80', // camera
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=400&q=80', // laptop
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=400&q=80', // drone
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=400&q=80', // iphone
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80', // smartwatch
      'https://images.unsplash.com/photo-1612293788016-88e434fd37ec?auto=format&fit=crop&w=400&q=80', // gaming
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80', // headphones
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80', // tablet
    ],
  },
];

const highlightStats = [
  { icon: Smile, label: '500.000+ khách hàng tin dùng' },
  { icon: WalletCards, label: 'Chi phí theo ngày tiết kiệm' },
  { icon: CalendarRange, label: 'Kỳ hạn thuê từ 1 đến 24+ tháng' },
  { icon: ShieldCheck, label: 'Có gói bảo hành & bảo vệ' },
];

// Sản phẩm nổi bật: giá cao nhất trước
// (moved to HomeFeaturedProducts — API driven)

// Có thể bạn thích: giá thấp nhất trước (entry-level)
// (moved to HomeBudgetProducts — API driven)

export default function Home() {
  return (
    <Layout>
      <div className='bg-white dark:bg-surface-base pb-20'>
        {/* Hero — full viewport, outside padding wrapper */}
        <HeroBanner slides={heroSlides} />

        <div className='mx-auto max-w-full px-4 py-3 lg:px-18'>
          {/* Highlight stats */}
          <div className='mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-border/40 dark:border-white/5 bg-white/80 dark:bg-white/4 p-4 shadow-sm md:grid-cols-2 lg:grid-cols-4'>
            {highlightStats.map((item) => (
              <div key={item.label} className='flex items-center gap-3'>
                <span className='flex size-11 items-center justify-center rounded-full bg-rose-50 dark:bg-theme-primary-start/15 text-theme-primary-start'>
                  <item.icon className='size-5' />
                </span>
                <p className='text-sm font-semibold text-text-main'>
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          {/* Danh mục */}
          <section className='mt-14 space-y-6'>
            <div className='flex items-end justify-between'>
              <div>
                <h2 className='text-3xl font-extrabold text-text-main'>
                  Danh mục
                </h2>
                <p className='text-text-sub'>
                  Khám phá thiết bị phù hợp với mọi nhu cầu sống.
                </p>
              </div>
            </div>
            <HomeCategories />
          </section>

          {/* Sản phẩm nổi bật + Có thể bạn thích — API-driven client components */}
          <HomeFeaturedProducts />
          <HomeBudgetProducts />
        </div>
        {/* end padding wrapper */}
      </div>
    </Layout>
  );
}
