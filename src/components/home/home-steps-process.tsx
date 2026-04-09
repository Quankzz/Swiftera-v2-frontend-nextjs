import { PackageSearch, ShieldCheck, Rocket } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: PackageSearch,
    title: 'Chọn thiết bị',
    description:
      'Duyệt danh mục đa dạng và chọn gói thời gian thuê phù hợp nhất với nhu cầu của bạn.',
    highlight: false,
  },
  {
    number: '02',
    icon: ShieldCheck,
    title: 'Xác nhận & Cọc',
    description:
      'Xác thực nhanh chóng qua CCCD và thực hiện đặt cọc linh hoạt chỉ trong vài phút.',
    highlight: true,
  },
  {
    number: '03',
    icon: Rocket,
    title: 'Nhận máy & Sáng tạo',
    description:
      'Nhận máy tại cửa hàng hoặc giao tận nơi. Bắt đầu hành trình sáng tạo chuyên nghiệp của bạn.',
    highlight: false,
  },
] as const;

export function HomeStepsProcess() {
  return (
    <section className='py-24 bg-surface-container-lowest dark:bg-white/2'>
      <div className='mx-auto max-w-7xl px-6 lg:px-12'>
        {/* Heading */}
        <h2 className='text-center text-4xl font-extrabold uppercase tracking-tighter text-text-main mb-20'>
          QUY TRÌNH <span className='text-theme-primary-start'>3 BƯỚC</span> TỐI
          GIẢN
        </h2>

        <div className='relative grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-16'>
          {/* Dashed connector line (desktop only) */}
          <div
            aria-hidden
            className='hidden md:block absolute top-10 left-1/2 -translate-x-1/2 w-2/3 h-px border-t-2 border-dashed border-border/30 dark:border-white/10'
          />

          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className='relative flex flex-col items-center text-center'
              >
                {/* Number badge */}
                <div
                  className={[
                    'relative z-10 mb-8 flex size-20 items-center justify-center rounded-full text-3xl font-black shadow-xl',
                    step.highlight
                      ? 'bg-theme-primary-start text-white shadow-theme-primary-start/30'
                      : 'bg-white dark:bg-white/8 text-theme-primary-start border border-border/30 dark:border-white/8',
                  ].join(' ')}
                >
                  {step.number}
                  {/* Small icon badge */}
                  <span className='absolute -bottom-2 -right-2 flex size-7 items-center justify-center rounded-full bg-white dark:bg-surface-base border border-border/20 dark:border-white/10 shadow'>
                    <Icon
                      className={[
                        'size-3.5',
                        step.highlight
                          ? 'text-theme-primary-start'
                          : 'text-text-sub',
                      ].join(' ')}
                    />
                  </span>
                </div>

                <h3 className='mb-3 text-xl font-bold text-text-main'>
                  {step.title}
                </h3>
                <p className='max-w-xs text-sm leading-relaxed text-text-sub'>
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
