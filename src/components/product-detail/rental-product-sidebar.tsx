'use client';

import { useState } from 'react';
import { MapPin, Clock, Truck, Shield, Wrench } from 'lucide-react';
import {
  CalendarDays,
  CreditCard,
  Package,
  RotateCcw,
  Wallet,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

/* ---------- Địa chỉ giao hàng (modal) ---------- */

function RentalDeliveryAddressDialog() {
  const [selectedOption, setSelectedOption] = useState('default');

  return (
    <Dialog>
      <DialogTrigger className='mt-2 inline-flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'>
        Nhập địa chỉ
      </DialogTrigger>
      <DialogContent className='max-h-[min(90dvh,720px)] overflow-y-auto sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='text-xl font-bold tracking-tight text-foreground'>
            Địa chỉ giao hàng
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6 font-sans'>
          <p className='text-sm leading-relaxed text-muted-foreground'>
            Hãy chọn địa chỉ nhận hàng để được dự báo thời gian giao hàng cùng
            phí đóng gói, vận chuyển một cách chính xác nhất.
          </p>

          <Button className='kinetic-gradient w-full rounded-xl font-bold text-white hover:opacity-90'>
            Đăng nhập để chọn địa chỉ giao hàng
          </Button>

          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <span className='w-full border-t border-border' />
            </div>
            <div className='relative flex justify-center text-xs font-bold uppercase tracking-widest'>
              <span className='bg-card px-2 text-muted-foreground'>hoặc</span>
            </div>
          </div>

          <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='default' id='default' />
              <Label htmlFor='default'>
                Phường Bến Nghé, Quận 1, Hồ Chí Minh
              </Label>
            </div>
            <div className='flex items-center space-x-2 mt-4'>
              <RadioGroupItem value='other' id='other' />
              <Label htmlFor='other'>Chọn khu vực giao hàng khác</Label>
            </div>
          </RadioGroup>

          {selectedOption === 'other' && (
            <div className='space-y-4'>
              <div>
                <Label>Tỉnh/Thành phố</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder='Vui lòng chọn tỉnh/thành phố' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='hcm'>Hồ Chí Minh</SelectItem>
                    <SelectItem value='hn'>Hà Nội</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quận/Huyện</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder='Vui lòng chọn quận/huyện' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='q1'>Quận 1</SelectItem>
                    <SelectItem value='q2'>Quận 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Phường/Xã</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder='Vui lòng chọn phường/xã' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='bn'>Bến Nghé</SelectItem>
                    <SelectItem value='bt'>Bến Thành</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Button className='h-11 w-full rounded-xl bg-rose-600 font-bold text-white hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600'>
            GIAO ĐẾN ĐỊA CHỈ NÀY
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Thông tin giao hàng + nhập địa chỉ */
export function RentalDeliverySection() {
  return (
    <div className='rounded-xl border border-border/60 bg-card p-4 font-sans ambient-glow sm:p-5'>
      <h2 className='mb-3 text-base font-bold tracking-tight text-foreground sm:mb-4 sm:text-lg'>
        Thông tin giao hàng
      </h2>
      <div className='space-y-3'>
        <div className='flex items-start gap-3'>
          <MapPin className='mt-0.5 size-5 shrink-0 text-rose-600 dark:text-rose-400' />
          <div className='min-w-0'>
            <p className='text-sm leading-relaxed text-muted-foreground'>
              Nhập địa chỉ để xem thời gian giao hàng và phí vận chuyển chính
              xác
            </p>
            <RentalDeliveryAddressDialog />
          </div>
        </div>
        <div className='flex items-start gap-3'>
          <Truck className='mt-0.5 size-5 shrink-0 text-indigo-600 dark:text-indigo-400' />
          <p className='text-sm text-muted-foreground'>
            Giao tận nơi hoặc nhận tại cửa hàng
          </p>
        </div>
        <div className='flex items-start gap-3'>
          <Clock className='mt-0.5 size-5 shrink-0 text-rose-600 dark:text-rose-400' />
          <p className='text-sm text-muted-foreground'>
            Nhận hàng trong 2-4h (nội thành TP.HCM, Hà Nội)
          </p>
        </div>
      </div>
    </div>
  );
}

const processSteps = [
  {
    step: 1,
    icon: <CalendarDays className='size-5 text-rose-600 dark:text-rose-400' />,
    title: 'Chọn thời gian thuê',
    desc: 'Chọn số ngày thuê phù hợp; hệ thống hiển thị tiền thuê tương ứng. Có thể chọn thêm dịch vụ bổ sung nếu cần.',
  },
  {
    step: 2,
    icon: (
      <CreditCard className='w-5 h-5 text-violet-500 dark:text-violet-400' />
    ),
    title: 'Thanh toán tiền thuê + cọc',
    desc: 'Thanh toán đủ tiền thuê và khoản cọc theo quy định. Giá chưa bao gồm phí vận chuyển và 8% VAT (nếu có).',
  },
  {
    step: 3,
    icon: (
      <Package className='w-5 h-5 text-emerald-500 dark:text-emerald-400' />
    ),
    title: 'Nhận thiết bị & đồng kiểm',
    desc: 'Nhận hàng tại cửa hàng hoặc giao tận nơi. Kiểm tra thiết bị cùng nhân viên trước khi nhận.',
  },
  {
    step: 4,
    icon: (
      <RotateCcw className='w-5 h-5 text-orange-500 dark:text-orange-400' />
    ),
    title: 'Sử dụng và trả đúng hạn',
    desc: 'Sử dụng thiết bị theo hướng dẫn. Trả máy đúng ngày; có thể gia hạn thuê nếu liên hệ trước hạn.',
  },
  {
    step: 5,
    icon: <Wallet className='w-5 h-5 text-rose-500 dark:text-rose-400' />,
    title: 'Hoàn cọc',
    desc: 'Sau khi trả thiết bị và hoàn tất kiểm tra, tiền cọc được hoàn trong tối đa 24 giờ.',
  },
];

/** Quy trình thuê (cột phụ) */
export function RentalProcessSection() {
  return (
    <div className='rounded-xl border border-border/60 bg-card p-4 font-sans ambient-glow sm:p-5'>
      <h2 className='mb-1 text-base font-bold tracking-tight text-foreground sm:text-lg'>
        Quy trình thuê
      </h2>
      <p className='mb-4 text-xs text-muted-foreground'>
        Các bước từ lúc đặt thuê đến khi nhận lại tiền cọc
      </p>
      <ol className='space-y-0'>
        {processSteps.map((item, index) => (
          <li key={item.step} className='relative flex gap-3 pb-5 last:pb-0'>
            {index < processSteps.length - 1 && (
              <span
                className='absolute top-9 bottom-0 left-[15px] w-px bg-border'
                aria-hidden
              />
            )}
            <div className='relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground ring-4 ring-card'>
              {item.step}
            </div>
            <div className='min-w-0 flex-1 pt-0.5'>
              <div className='flex items-start gap-2'>
                <span className='mt-0.5 shrink-0'>{item.icon}</span>
                <div>
                  <p className='text-sm font-semibold text-foreground'>
                    {item.title}
                  </p>
                  <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Dịch vụ bổ sung khi thuê */
export function RentalAddonServicesSection() {
  const services = [
    {
      icon: <Shield className='size-5 text-rose-600 dark:text-rose-400' />,
      name: 'Bảo hiểm thiết bị',
      desc: 'Bảo vệ khi hư hỏng ngoài ý muốn',
      price: '50,000₫/ngày',
      iconBg: 'bg-rose-100 dark:bg-rose-950/50',
    },
    {
      icon: <Truck className='size-5 text-indigo-600 dark:text-indigo-400' />,
      name: 'Giao & nhận tận nơi',
      desc: 'Giao hàng và thu hồi tại địa chỉ của bạn',
      price: '100,000₫',
      iconBg: 'bg-indigo-100 dark:bg-indigo-950/50',
    },
    {
      icon: <Wrench className='size-5 text-orange-600 dark:text-orange-400' />,
      name: 'Setup tại chỗ',
      desc: 'Nhân viên hỗ trợ cài đặt, hướng dẫn sử dụng',
      price: '150,000₫',
      iconBg: 'bg-orange-100 dark:bg-orange-950/50',
    },
  ];

  return (
    <div className='rounded-xl border border-border/60 bg-card p-4 font-sans ambient-glow sm:p-5'>
      <h2 className='mb-3 text-base font-bold tracking-tight text-foreground sm:mb-4 sm:text-lg'>
        Dịch vụ bổ sung
      </h2>
      <div className='space-y-3'>
        {services.map((service, index) => (
          <div
            key={index}
            className='flex flex-col gap-3 rounded-lg border border-border p-3 transition-colors hover:border-rose-500/40 sm:flex-row sm:items-center sm:justify-between dark:hover:border-rose-400/30'
          >
            <div className='flex min-w-0 items-center gap-3'>
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${service.iconBg}`}
              >
                {service.icon}
              </div>
              <div className='min-w-0'>
                <span className='block text-sm font-semibold text-foreground'>
                  {service.name}
                </span>
                <span className='text-xs text-muted-foreground'>
                  {service.desc}
                </span>
              </div>
            </div>
            <div className='flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center sm:text-right'>
              <div className='text-xs font-semibold text-muted-foreground sm:mb-0 sm:text-right'>
                {service.price}
              </div>
              <Button
                variant='outline'
                size='xs'
                className='border-rose-200 font-bold text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/50'
              >
                Thêm
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
