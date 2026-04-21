import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import logo from '../../public/logo.png';

export function Footer() {
  return (
    <footer className='border-t-2 border-border/15 dark:border-white/5 bg-background dark:bg-[#0a0a0e] pt-10 pb-10 px-6 lg:px-18'>
      <div className='mx-auto max-w-full'>
        <div className='mb-20 grid gap-12 md:grid-cols-12'>
          <div className='md:col-span-5'>
            <Image
              src={logo}
              alt='logo'
              width={150}
              height={40}
              className='object-contain mb-6'
            />
            <p className='max-w-sm leading-relaxed text-text-sub'>
              Nền tảng thuê thiết bị công nghệ linh hoạt, giúp bạn tiếp cận sản
              phẩm mới với chi phí hợp lý mà không cần sở hữu lâu dài.
            </p>

            <div className='mt-6 space-y-2 text-sm'>
              <p className='text-text-main'>
                Email CSKH:{' '}
                <a
                  href='mailto:cskh@swiftera.vn'
                  className='font-semibold text-theme-primary-start hover:underline'
                >
                  cskh@swiftera.vn
                </a>
              </p>
              <p className='text-text-main'>
                Hotline:{' '}
                <a
                  href='tel:19001234'
                  className='font-semibold text-theme-primary-start hover:underline'
                >
                  1900 1234
                </a>
              </p>
            </div>
          </div>

          <div className='md:col-span-2'>
            <p className='mb-6 font-bold text-text-main'>Khám phá</p>
            <ul className='space-y-4 text-sm text-text-sub'>
              <li>
                <Link
                  href='/catalog'
                  className='transition-colors hover:text-theme-primary-start'
                >
                  Danh mục sản phẩm
                </Link>
              </li>
              <li>
                <Link
                  href='/faq'
                  className='transition-colors hover:text-theme-primary-start'
                >
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link
                  href='/q-and-a'
                  className='transition-colors hover:text-theme-primary-start'
                >
                  Giải đáp thắc mắc
                </Link>
              </li>
              <li>
                <Link
                  href='/feedback'
                  className='transition-colors hover:text-theme-primary-start'
                >
                  Gửi phản hồi
                </Link>
              </li>
            </ul>
          </div>

          <div className='md:col-span-2'>
            <p className='mb-6 font-bold text-text-main'>Công ty</p>
            <ul className='space-y-4 text-sm text-text-sub'>
              <li>
                <Link
                  href='/about'
                  className='transition-colors hover:text-theme-primary-start'
                >
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link
                  href='/contact-sales'
                  className='transition-colors hover:text-theme-primary-start'
                >
                  Liên hệ mua hàng
                </Link>
              </li>
              <li>
                <Link
                  href='/contact-info'
                  className='transition-colors hover:text-theme-primary-start'
                >
                  Thông tin liên hệ
                </Link>
              </li>
              <li>
                <Link
                  href='/policies'
                  className='transition-colors hover:text-theme-primary-start'
                >
                  Trung tâm chính sách
                </Link>
              </li>
            </ul>
          </div>

          <div className='md:col-span-3'>
            <p className='mb-6 font-bold text-text-main'>Nhận tin ưu đãi</p>
            <div className='flex rounded-xl bg-muted dark:bg-white/8 p-1'>
              <Input
                type='email'
                placeholder='Nhập email của bạn'
                className='flex-1 border-none bg-transparent focus-visible:ring-0'
              />
              <Button
                size='icon'
                className='shrink-0 rounded-lg bg-theme-primary-start text-white hover:opacity-90'
                aria-label='Đăng ký nhận tin'
              >
                <ArrowRight className='size-4' />
              </Button>
            </div>
          </div>
        </div>

        <div className='flex flex-col items-center justify-between gap-6 border-t border-border/10 dark:border-white/5 pt-8 md:flex-row'>
          <p className='text-xs text-text-sub'>
            © {new Date().getFullYear()} Swiftera. Bảo lưu mọi quyền.
          </p>
          <div className='flex gap-8 text-xs font-bold text-text-sub'>
            <Link
              href='/policies/returns'
              className='transition-colors hover:text-text-main'
            >
              Chính sách đổi trả
            </Link>
            <Link
              href='/policies/shipping'
              className='transition-colors hover:text-text-main'
            >
              Chính sách vận chuyển
            </Link>
            <Link
              href='/policies/warranty'
              className='transition-colors hover:text-text-main'
            >
              Chính sách bảo hành
            </Link>
            <Link
              href='/business-license'
              className='transition-colors hover:text-text-main'
            >
              Giấy phép kinh doanh
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
