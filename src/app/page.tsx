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
    title: 'Thiết bị của bạn.',
    subtitle: 'Theo cách của bạn.',
    description:
      'Sử dụng công nghệ theo nhu cầu với mức phí theo ngày phù hợp ngân sách, không cần trả trước quá lớn.',
    image:
      'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=1400&q=80',
    accent: 'Linh hoạt mỗi ngày',
  },
  {
    title: 'Yêu công nghệ.',
    subtitle: 'Chọn Swiftera.',
    description:
      'Nâng cấp thiết bị dễ dàng, chi phí hợp lý, giao nhanh và đổi trả thuận tiện.',
    image:
      'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1400&q=80',
    accent: 'Nâng cấp nhanh',
  },
  {
    title: 'Thuê thiết bị cao cấp.',
    subtitle: 'Giữ trọn tự do.',
    description:
      'Chọn điện thoại, máy chơi game, laptop và wearables mới nhất với kỳ hạn thuê linh hoạt từ 1 đến 24+ tháng.',
    image:
      'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1400&q=80',
    accent: 'Kỳ hạn linh hoạt',
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
        <div className='mx-auto max-w-full px-4 py-3 lg:px-18'>
          <HeroBanner slides={heroSlides} />

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
      </div>
    </Layout>
  );
}
