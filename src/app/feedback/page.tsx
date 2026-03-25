'use client';

import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RichEditor from '@/components/feedback/rich-editor';

export default function FeedbackPage() {
  return (
    <Layout>
      <section className='min-h-screen bg-white dark:bg-surface-base py-10'>
        <div className='mx-auto max-w-6xl px-4 lg:px-8'>
          <div className='mb-6 rounded-2xl border border-border/60 dark:border-white/8 bg-white dark:bg-surface-card p-6 md:p-8'>
            <h1 className='text-4xl font-extrabold text-text-main'>
              Ý kiến khách hàng
            </h1>
            <p className='mt-3 text-text-sub'>
              Chúng tôi trân trọng mọi ý kiến đóng góp để nâng cao chất lượng
              dịch vụ. Vui lòng điền thông tin bên dưới.
            </p>
          </div>

          <form className='space-y-6'>
            <div className='rounded-2xl border border-border/60 dark:border-white/8 bg-white dark:bg-surface-card p-6 md:p-8'>
              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <label className='text-sm font-semibold text-text-main'>
                    Tiêu đề (*)
                  </label>
                  <Input
                    placeholder='Nhập tiêu đề góp ý'
                    maxLength={150}
                    className='h-12 text-text-main placeholder:text-text-sub'
                  />
                  <p className='text-xs text-text-sub'>Tối đa 150 ký tự</p>
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-semibold text-text-main'>
                    Mã đơn hàng
                  </label>
                  <select className='h-12 w-full rounded-md border border-input dark:border-white/10 bg-white dark:bg-white/5 px-3 text-sm text-text-main focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20 transition'>
                    <option value=''>-- Chọn đơn hàng (nếu có) --</option>
                    <option value='DH-2026-001'>#DH-2026-001</option>
                    <option value='DH-2026-002'>#DH-2026-002</option>
                    <option value='DH-2026-003'>#DH-2026-003</option>
                  </select>
                </div>
              </div>

              <div className='mt-4 space-y-2'>
                <label className='text-sm font-semibold text-text-main'>
                  Chi tiết (*)
                </label>
                <RichEditor
                  placeholder='Mô tả chi tiết ý kiến của bạn...'
                  minHeight='200px'
                />
              </div>

              <div className='mt-4 grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <label className='text-sm font-semibold text-text-main'>
                    Họ và tên (*)
                  </label>
                  <Input
                    placeholder='Nhập đầy đủ họ và tên'
                    className='h-12 text-text-main placeholder:text-text-sub'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-semibold text-text-main'>
                    Email (*)
                  </label>
                  <Input
                    type='email'
                    placeholder='Nhập email liên hệ'
                    className='h-12 text-text-main placeholder:text-text-sub'
                  />
                </div>
              </div>

              <div className='mt-4 grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <label className='text-sm font-semibold text-text-main'>
                    Số điện thoại (*)
                  </label>
                  <Input
                    placeholder='Nhập số điện thoại'
                    className='h-12 text-text-main placeholder:text-text-sub'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-semibold text-text-main'>
                    Kênh hỗ trợ mong muốn
                  </label>
                  <Input
                    placeholder='Ví dụ: Điện thoại / Email'
                    className='h-12 text-text-main placeholder:text-text-sub'
                  />
                </div>
              </div>
            </div>

            <div className='flex justify-end'>
              <Button
                type='submit'
                className='rounded-full bg-theme-primary-start px-8 text-white hover:opacity-90'
              >
                Gửi yêu cầu
              </Button>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
}
