"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Search,
  ArrowRight,
  SearchCheck,
  Rocket,
  RefreshCcw,
} from 'lucide-react';
import { RotatingText } from '@/components/ui/rotate-text';
import { NumberCounter } from '@/components/ui/number-counter';
import { Magnetic } from '@/components/ui/magnetic';
import { HighlightText } from '@/components/ui/highlight-text';
import { RainbowButton } from '@/components/ui/rainbow-button';

const categories = [
  {
    title: 'Tech',
    desc: 'Latest MacBooks, Consoles & Sound',
    colSpan: 'md:col-span-2',
    rowSpan: '',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC9NtMUZC0ui4QzRA788rSraHYEe5n2HYwnBznbh6L6UKtsryOT5oxBcUTH46naNHT8GExaHMkqRhoKmmGv311rA1-oTrZGMm3VNjxhG7S7HlJoJEhkC-JjF1a1y2a5Iu4Z_OLV-iwkIFEQgsu9TR5pfxkCvRIMZ3cZMf96fdJU8HL5b8iHPNQb0XizCAHjjLcb70ieS79j54BqkOXykoCdz-XRXS9_LK-UILLXHZDCgaREuNSP8lyoPKA6DWNL63z699kKAyf5UJBX',
    alt: 'Premium laptop and headphones',
  },
  {
    title: 'Travel Gear',
    desc: '',
    colSpan: '',
    rowSpan: '',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBWyM745H5JmddWk9J0YsNJle6RLZ9W8ZLM6irOs67cdHt259MPtG5W1Sni0AxR3LeP6sTmMtws9A3A0b8Ef0KC3W6AbOfwQ5cq69WrX0JnmyUafvyPpnLuyFVjxoo2sDTU8mx3krdTFpovaE4BY6bbX8RPJ2B14rhIiA_SrqP2DUW69fvrhiylWWjxqSLk-r-Rm-qufIyuPhUD9J1ruWjSXW86iuQXk_tExmXGcoBaE04mEo-bw6ZmK79zL_zxwXxlcdbm2RekzVJw',
    alt: 'Adventure travel gear',
  },
  {
    title: 'Leisure',
    desc: 'Electric Bikes & Scooters',
    colSpan: '',
    rowSpan: 'row-span-2',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuApup79FgnbHgi6XlC2Xeh_xykwIPNrwtjh3omoaYtMJEivp9164Ssz05Qs6sc533KIbwN_bouOHWzGLfWbXRRxgQ407UERiwnX6s9cNUjiWtVF32lJODzEZHExqU1Qq7zQI0CL5bOxXGBhxwG6M_tDHaDG_hIgupYNU1cp0n8t6wY33mZDgdyv-DkcY1Q0hE3R_tZnlhPFCT4e4msmxKscPBRYDeKgqu_kIycKnr67XcNPKwecJE-vzB-klgJjk7-Hm6Rao-hkLPVd',
    alt: 'Electric bike in city',
  },
  {
    title: 'Home Office',
    desc: 'Ergonomic chairs & 4K Displays',
    colSpan: 'md:col-span-2',
    rowSpan: '',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCYCqBc1qTCYK6KsHvQ1FYsXnE0XkvohZg85T3A8R0V2h9ngMXVSqDuDcX8EpGgYHMUb5UaaoEkIg3kQ9v5zU7rDeSOHw4ur4ccjQezC9VCJT-pg9CubiEl8f_C37pocj1p4Nu9fsNw4aWAyiblW9xfmdiED2bMVqOgBlAd2Fasg_uwGDaHq4HwA1vFQw84LKWdbeMgzxmn9pdWrSpLSad5Ijc_LUooh6t15nV0y-_TUcJRZAJgk0T8Lare6x62bP0HAOcYn4zeAZ9H',
    alt: 'Minimalist desk setup',
  },
];

const howItWorks = [
  {
    icon: SearchCheck,
    title: 'Browse & Select',
    desc: 'Choose from our curated collection of verified high-end equipment. No hidden fees, just pure access.',
    bgColor: 'bg-teal-100 dark:bg-teal-900/30',
    iconColor: 'text-teal-700 dark:text-teal-400',
  },
  {
    icon: Rocket,
    title: 'Rapid Delivery',
    desc: 'Our logistics engine ensures your item arrives at your doorstep in under 4 hours within urban hubs.',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    iconColor: 'text-indigo-700 dark:text-indigo-400',
  },
  {
    icon: RefreshCcw,
    title: 'Easy Exchange',
    desc: 'Done with it? We pick it up. Want to keep it longer? Extend with one tap in the app.',
    bgColor: 'bg-secondary',
    iconColor: 'text-foreground',
  },
];

const stats = [
  { value: 15000, label: 'Active Users', suffix: '+', prefix: '' },
  { value: 100, label: 'Insured Gear', suffix: '%', prefix: '' },
  { value: 4.9, label: 'Member Rating', suffix: '/5', prefix: '', decimals: 1 },
  { value: 24, label: 'Expert Support', suffix: '/7', prefix: '' },
];

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className='px-6 pt-32 pb-16'>
        <div className='mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-12'>
          <div className='lg:col-span-7'>
            <h1 className='mb-8 text-6xl font-extrabold leading-[0.9] tracking-tighter text-foreground md:text-8xl'>
              RENT THE{' '}
              <RotatingText
                words={['FUTURE', 'BEST', 'LATEST', 'PREMIUM']}
                interval={2500}
                className='italic text-teal-600 dark:text-teal-400'
              />{' '}
              IN MINUTES.
            </h1>
            <p className='mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl'>
              Access{' '}
              <HighlightText variant='marker' color='teal' strokeWidth={3}>
                premium products
              </HighlightText>{' '}
              on-demand. From high-end cameras to ergonomic office setups,{' '}
              <HighlightText variant='underline' color='teal' animationDelay={0.3}>
                skip ownership
              </HighlightText>{' '}
              and embrace kinetic living.
            </p>

            {/* Search bar */}
            <Card className='max-w-2xl border-border/15 p-2'>
              <div className='flex flex-col gap-2 md:flex-row'>
                <div className='flex flex-1 items-center rounded-xl bg-muted/50 px-4 py-3'>
                  <Search className='mr-3 size-5 text-teal-600 dark:text-teal-400' />
                  <input
                    type='text'
                    placeholder='What do you need today?'
                    className='w-full border-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none'
                  />
                </div>
                <Button className='kinetic-gradient rounded-xl px-8 py-4 font-bold text-white hover:opacity-90'>
                  Explore Now
                </Button>
              </div>
            </Card>
          </div>

          <div className='relative lg:col-span-5'>
            <div className='relative aspect-4/5 overflow-hidden rounded-xl bg-muted'>
              <Image
                src='https://lh3.googleusercontent.com/aida-public/AB6AXuDQ_jMrjusvM9eTqXzDdr_qGUFBJN3mWwwNBol2-6g5HS3s90MH7w1_k9MgMQvrG4Yzhhdre3WwW5zU3F82S3ndn_hnoVdOqCnFHUm0Mo5BJOfZUC9Ipv6nD-81FKYo2-tlXeeyZpCtaZp9U5NnlqeVWhnDEeeyjqUJRzI5S1WmwW6AAEemOs6VDcZHwNTmqge6_YS0ecgEOWxI8QQXdZqZXhuvX47RNj6QTSMlopIBuLC4tovnXUMXraSWmfVKzf5PZfeUDhRaiMRR'
                alt='High-end cinema camera on a stabilizer'
                fill
                className='object-cover'
                unoptimized
              />
              {/* Floating tag */}
              <div className='absolute bottom-6 left-6 rounded-xl border border-white/20 bg-background/80 p-4 backdrop-blur-md'>
                <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400'>
                  Current Availability
                </p>
                <p className='text-lg font-bold'>Sony FX3 Cinema</p>
                <div className='mt-2 flex items-center gap-2'>
                  <span className='size-2 animate-pulse rounded-full bg-teal-500' />
                  <span className='text-xs font-medium'>Ready for Rent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Bento Grid */}
      <section className='bg-muted/50 px-6 py-24'>
        <div className='mx-auto max-w-7xl'>
          <div className='mb-16 flex items-end justify-between'>
            <div>
              <span className='mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400'>
                Collections
              </span>
              <h2 className='text-4xl font-bold'>Curated Categories</h2>
            </div>
            <Button
              variant='link'
              className='gap-2 font-bold text-teal-600 dark:text-teal-400'
            >
              Rent Now
              <ArrowRight className='size-4' />
            </Button>
          </div>

          <div className='grid h-[600px] gap-6 md:grid-cols-4'>
            {categories.map((cat) => (
              <Link
                key={cat.title}
                href='/categories'
                className={`group relative cursor-pointer overflow-hidden rounded-xl bg-background ${cat.colSpan} ${cat.rowSpan}`}
              >
                <Image
                  src={cat.image}
                  alt={cat.alt}
                  fill
                  className='object-cover transition-transform duration-700 group-hover:scale-110'
                  unoptimized
                />
                <div className='absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/60 via-transparent to-transparent p-8'>
                  <h3
                    className={`font-bold text-white ${cat.colSpan ? 'text-3xl' : 'text-2xl'}`}
                  >
                    {cat.title}
                  </h3>
                  {cat.desc && (
                    <p className='text-sm text-white/80'>{cat.desc}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className='bg-background px-6 py-24'>
        <div className='mx-auto flex max-w-7xl flex-col items-center gap-20 lg:flex-row'>
          {/* Steps */}
          <div className='order-2 space-y-12 lg:order-1 lg:w-1/2'>
            {howItWorks.map((step) => (
              <div key={step.title} className='group flex gap-8'>
                <Magnetic intensity={0.4} range={80}>
                  <div
                    className={`flex size-16 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${step.bgColor}`}
                  >
                    <step.icon className={`size-7 ${step.iconColor}`} />
                  </div>
                </Magnetic>
                <div>
                  <h4 className='mb-2 text-xl font-bold'>{step.title}</h4>
                  <p className='leading-relaxed text-muted-foreground'>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Active rental card */}
          <div className='relative order-1 lg:order-2 lg:w-1/2'>
            <div className='absolute -top-10 -left-10 size-40 rounded-full bg-teal-200/30 blur-3xl dark:bg-teal-800/20' />
            <div className='absolute -right-10 -bottom-10 size-40 rounded-full bg-violet-200/30 blur-3xl dark:bg-violet-800/20' />

            <Card className='ambient-glow relative border-border/15 p-6'>
              <div className='mb-6 flex items-center justify-between'>
                <span className='text-sm font-bold uppercase tracking-widest opacity-50'>
                  Active Rental
                </span>
                <Badge className='rounded-full bg-teal-600/10 text-teal-600 dark:bg-teal-400/10 dark:text-teal-400'>
                  In Transit
                </Badge>
              </div>

              <div className='mb-8 flex gap-4'>
                <div className='relative size-20 overflow-hidden rounded-lg bg-muted'>
                  <Image
                    src='https://lh3.googleusercontent.com/aida-public/AB6AXuBzkRYpUPyF4qbkjvdGSZLorg1CwfHjD6LlEf8FD2ajKbH_fw8aVTTzrHmlORn4SN3gctMWXAX0-XeVfmFRPZVKJLCjjItq7_6-gi6ZLESDuK-cSiTjYXL1SdgUJCUtVmyRWc5rK-h9zoHnL7Wlw78Ni77oyio-ghTsE8WNMTj25VTHpOYyy_T2uPHAAE1CsQOIyJnIocH3X62l_FVi1X5tF9KmUbaovDvXo-7Bu6Bu4J_8NUTWZCpvDA_yr9XyB-2iDrd1MmU7CK9u'
                    alt='Mirrorless camera'
                    fill
                    className='object-cover'
                    unoptimized
                  />
                </div>
                <div>
                  <h5 className='font-bold'>Lumix GH6 Cinema Kit</h5>
                  <p className='text-sm text-muted-foreground'>
                    Renter: Alex Johnson
                  </p>
                  <p className='mt-1 text-xs text-muted-foreground/60'>
                    ID: SW-9022-X
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className='mb-2 flex justify-between text-xs font-bold'>
                <span>2h 14m remaining</span>
                <span>ETA 4:30 PM</span>
              </div>
              <div className='relative h-3 w-full overflow-hidden rounded-full bg-muted'>
                <div className='kinetic-gradient absolute top-0 left-0 h-full w-3/4 rounded-full shadow-[0_0_12px_rgba(0,229,255,0.5)]' />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Signals with Animated Counters */}
      <section className='border-y border-border/10 bg-background px-6 py-16'>
        <div className='mx-auto grid max-w-7xl grid-cols-2 gap-8 md:grid-cols-4'>
          {stats.map((stat) => (
            <div key={stat.label} className='text-center'>
              <p className='text-3xl font-extrabold text-teal-600 dark:text-teal-400'>
                <NumberCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                  decimals={stat.decimals ?? 0}
                  duration={2.5}
                  easing='easeOut'
                />
              </p>
              <p className='mt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground'>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Rent Now FAB */}
      <div className='fixed right-10 bottom-10 z-50'>
        <Magnetic intensity={0.3} range={120}>
          <Link href='/categories'>
            <RainbowButton
              colors={['#006875', '#00e5ff', '#8b5cf6', '#006875']}
              duration={3}
              borderWidth={2}
              className='shadow-lg bg-teal-600 dark:bg-teal-400'
            >
              <Rocket className='size-4' />
              Rent Now
            </RainbowButton>
          </Link>
        </Magnetic>
      </div>
    </Layout>
  );
}
