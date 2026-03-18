import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BookOpenText, PhoneCall, Truck } from 'lucide-react';

const ratingOptions = ['Rất tốt', 'Tốt', 'Trung bình', 'Kém', 'Rất kém'];

function SectionCard({
  title,
  icon: Icon,
  questions,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  questions: Array<{ label: string; options: string[] }>;
}) {
  return (
    <div className='overflow-hidden rounded-2xl border border-border/60 bg-white'>
      <div className='grid md:grid-cols-[260px_1fr]'>
        <div className='flex flex-col items-center justify-center gap-3 border-b border-border/50 bg-background p-8 md:border-b-0 md:border-r'>
          <Icon className='size-10 text-theme-primary-start' />
          <h3 className='text-center text-2xl font-bold text-text-main'>
            {title}
          </h3>
        </div>

        <div className='space-y-7 p-6 md:p-8'>
          {questions.map((question, questionIndex) => (
            <fieldset key={question.label} className='space-y-3'>
              <legend className='text-lg font-semibold text-text-main'>
                {questionIndex + 1}. {question.label}
              </legend>
              <div className='grid gap-2 sm:grid-cols-2'>
                {question.options.map((option) => (
                  <label
                    key={option}
                    className='flex cursor-pointer items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm text-text-sub transition hover:border-theme-primary-start/60 hover:text-text-main'
                  >
                    <input
                      type='radio'
                      name={`${title}-${questionIndex}`}
                      value={option}
                      className='size-4 accent-theme-primary-start'
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <Layout>
      <section className='bg-background py-10'>
        <div className='mx-auto max-w-6xl px-4 lg:px-8'>
          <div className='mb-6 rounded-2xl border border-border/60 bg-white p-6 md:p-8'>
            <h1 className='text-4xl font-extrabold text-text-main'>
              Ý kiến khách hàng
            </h1>
            <p className='mt-3 text-text-sub'>
              Chúng tôi trân trọng mọi ý kiến đóng góp để nâng cao chất lượng
              dịch vụ. Vui lòng điền thông tin bên dưới.
            </p>
          </div>

          <form className='space-y-6'>
            <div className='rounded-2xl border border-border/60 bg-white p-6 md:p-8'>
              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <label className='text-sm font-semibold text-text-main'>
                    Tiêu đề (*)
                  </label>
                  <Input
                    placeholder='Nhập tiêu đề góp ý'
                    className='text-text-main placeholder:text-text-sub'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-semibold text-text-main'>
                    Mã đơn hàng
                  </label>
                  <Input
                    placeholder='Nhập mã đơn hàng (nếu có)'
                    className='text-text-main placeholder:text-text-sub'
                  />
                </div>
              </div>

              <div className='mt-4 space-y-2'>
                <label className='text-sm font-semibold text-text-main'>
                  Chi tiết (*)
                </label>
                <Textarea
                  rows={4}
                  placeholder='Mô tả chi tiết ý kiến của bạn'
                  className='text-text-main placeholder:text-text-sub'
                />
              </div>

              <div className='mt-4 grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <label className='text-sm font-semibold text-text-main'>
                    Họ và tên (*)
                  </label>
                  <Input
                    placeholder='Nhập đầy đủ họ và tên'
                    className='text-text-main placeholder:text-text-sub'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-semibold text-text-main'>
                    Email (*)
                  </label>
                  <Input
                    type='email'
                    placeholder='Nhập email liên hệ'
                    className='text-text-main placeholder:text-text-sub'
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
                    className='text-text-main placeholder:text-text-sub'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-semibold text-text-main'>
                    Kênh hỗ trợ mong muốn
                  </label>
                  <Input
                    placeholder='Ví dụ: Điện thoại / Email'
                    className='text-text-main placeholder:text-text-sub'
                  />
                </div>
              </div>
            </div>

            <SectionCard
              title='Chất lượng sản phẩm'
              icon={BookOpenText}
              questions={[
                {
                  label: 'Đánh giá tổng quan sản phẩm thuê',
                  options: ratingOptions,
                },
              ]}
            />

            <SectionCard
              title='Chất lượng giao hàng'
              icon={Truck}
              questions={[
                {
                  label: 'Thời gian giao hàng',
                  options: [
                    'Rất nhanh',
                    'Nhanh',
                    'Bình thường',
                    'Chậm',
                    'Rất chậm',
                  ],
                },
                {
                  label: 'Thái độ nhân viên giao hàng',
                  options: [
                    'Vui vẻ, dễ chịu',
                    'Bình thường',
                    'Khó chịu, cáu gắt',
                  ],
                },
                {
                  label: 'Nhân viên có liên hệ trước khi giao',
                  options: ['Có', 'Không'],
                },
              ]}
            />

            <SectionCard
              title='Chăm sóc khách hàng'
              icon={PhoneCall}
              questions={[
                {
                  label: 'Mức độ hài lòng khi liên hệ tổng đài',
                  options: [
                    'Rất hài lòng',
                    'Hài lòng',
                    'Bình thường',
                    'Không hài lòng',
                  ],
                },
              ]}
            />

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
