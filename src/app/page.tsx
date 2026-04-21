import { Layout } from '@/components/Layout';
import { HeroBanner } from '@/components/home/hero-banner';
import { HomeCategories } from '@/components/home/home-categories';
import {
  HomeFeaturedProducts,
  HomeBudgetProducts,
} from '@/components/home/home-products';
import { HomeStepsProcess } from '@/components/home/home-steps-process';

export default function Home() {
  return (
    <Layout>
      <div className='bg-white dark:bg-surface-base pb-20'>
        {/* Hero - full viewport, self-fetches categories */}
        <HeroBanner />

        <div className='mx-auto max-w-full px-4 py-3 lg:px-18'>
          {/* Danh mục */}
          <section className='mt-8 space-y-6'>
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

          {/* Sản phẩm nổi bật */}
          <HomeFeaturedProducts />
        </div>

        {/* Quy trình 3 bước - full-bleed */}
        <HomeStepsProcess />

        <div className='mx-auto max-w-full px-4 lg:px-18'>
          <HomeBudgetProducts />
        </div>
      </div>
    </Layout>
  );
}
