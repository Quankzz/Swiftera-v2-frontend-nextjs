import { Layout } from '@/components/Layout';
import { HeroBanner } from '@/components/home/hero-banner';
import { CategoryCarousel } from '@/components/home/category-carousel';
import { ProductCard } from '@/components/home/product-card';
import { categories } from '@/data/categories';
import { products } from '@/data/products';
import { Button } from '@/components/ui/button';
import { CalendarRange, ShieldCheck, Smile, WalletCards } from 'lucide-react';

const heroSlides = [
  {
    title: 'Your game. Your world.',
    subtitle: 'Your rules.',
    description:
      'Play on your terms with a monthly rate that fits your budget. Rent the gear you need without a big upfront cost.',
    image:
      'https://images.unsplash.com/photo-1606813909355-245f1ac35b53?auto=format&fit=crop&w=1400&q=80',
    accent: 'Grover inspired',
  },
  {
    title: 'Love tech.',
    subtitle: 'Love Swiftera.',
    description:
      'Affordable, flexible, planet-friendly upgrades with next-day delivery and zero hassle returns.',
    image:
      'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1400&q=80',
    accent: 'Fast upgrades',
  },
  {
    title: 'Rent premium.',
    subtitle: 'Keep freedom.',
    description:
      'Choose the latest phones, consoles, laptops, and wearables with rental terms from 1 to 24+ months.',
    image:
      'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1400&q=80',
    accent: 'Flexible terms',
  },
];

const highlightStats = [
  { icon: Smile, label: '500,000+ customers' },
  { icon: WalletCards, label: 'Low monthly costs' },
  { icon: CalendarRange, label: 'Rent from 1 to 24+ months' },
  { icon: ShieldCheck, label: 'Care & protection available' },
];

export default function Home() {
  return (
    <Layout>
      <div className='bg-white pb-20'>
        <div className='mx-auto max-w-full px-4 py-3 lg:px-18'>
          <HeroBanner slides={heroSlides} />

          <div className='mt-8 grid grid-cols-1 gap-4 rounded-2xl border border-border/40 bg-white/80 p-4 shadow-sm md:grid-cols-2 lg:grid-cols-4'>
            {highlightStats.map((item) => (
              <div key={item.label} className='flex items-center gap-3'>
                <span className='flex size-11 items-center justify-center rounded-full bg-rose-50 text-theme-primary-start'>
                  <item.icon className='size-5' />
                </span>
                <p className='text-sm font-semibold text-text-main'>
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          <section className='mt-14 space-y-6'>
            <div className='flex items-end justify-between'>
              <div>
                <h2 className='text-3xl font-extrabold text-text-main'>
                  Categories
                </h2>
                <p className='text-text-sub'>
                  Explore tech that fits every lifestyle.
                </p>
              </div>
              <div className='hidden lg:block'>
                <Button
                  variant='ghost'
                  className='rounded-full border border-border/60'
                >
                  Show all
                </Button>
              </div>
            </div>
            <CategoryCarousel items={categories} />
          </section>

          <section className='mt-16 space-y-6'>
            <div className='flex items-end justify-between'>
              <div>
                <h2 className='text-3xl font-extrabold text-text-main'>
                  Most popular
                </h2>
                <p className='text-text-sub'>
                  Top picks from our renters this week.
                </p>
              </div>
              <Button variant='link' className='text-rose-600'>
                Show all
              </Button>
            </div>

            <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
              {products.map((product) => (
                <ProductCard key={product.productId} product={product} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
