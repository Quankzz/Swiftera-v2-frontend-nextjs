'use client';

import { useState, useMemo } from 'react';
import {
  RentalProductGallery,
  RentalProductSummary,
  RentalCheckoutCard,
  RentalDeliverySection,
  RentalProcessSection,
  RentalAddonServicesSection,
  RentalSpecifications,
  RentalProductDescription,
  RentalReviewsSection,
  RentalRelatedProducts,
  type RentalDuration,
  type ProductVariant,
} from '@/components/product-detail';

const rentalDurations: RentalDuration[] = [
  { id: '1d', label: '1 ngày', price: 300000, originalPrice: 350000 },
  { id: '2d', label: '2 ngày', price: 540000, originalPrice: 630000 },
  { id: '3d', label: '3 ngày', price: 750000, originalPrice: 900000 },
  { id: '5d', label: '5 ngày', price: 1100000, originalPrice: 1400000 },
  { id: '7d', label: '7 ngày', price: 1400000, originalPrice: 1890000 },
  { id: '14d', label: '14 ngày', price: 2400000, originalPrice: 3500000 },
  { id: '30d', label: '30 ngày', price: 4200000, originalPrice: 6300000 },
];

const productVariants: ProductVariant[] = [
  { id: 'disc', label: 'PS5 Slim (Ổ đĩa)' },
  { id: 'digital', label: 'PS5 Slim (Digital)' },
];

const mockProduct = {
  name: 'Cho thuê PlayStation 5 Slim - Combo 2 Tay cầm + 3 Game',
  sku: 'PS5-SLIM-2C3G-RENT',
  brand: 'Sony',
  productType: 'Máy chơi game',
  discount: 15,
  rating: 4.8,
  reviews: 86,
  rentedCount: 1240,
  deposit: 2000000,
  images: [
    'https://placehold.co/750x750/f8f8f8/333?text=PS5+Slim+Front',
    'https://placehold.co/750x750/f8f8f8/333?text=PS5+Slim+Side',
    'https://placehold.co/750x750/f8f8f8/333?text=PS5+Controller',
    'https://placehold.co/750x750/f8f8f8/333?text=PS5+Package',
    'https://placehold.co/750x750/f8f8f8/333?text=PS5+Gaming',
  ],
  specifications: [
    { label: 'Thương hiệu', value: 'Sony' },
    { label: 'Model', value: 'PlayStation 5 Slim CFI-2000' },
    { label: 'Tình trạng', value: 'Mới 99% - Đầy đủ phụ kiện' },
    { label: 'Bảo hành', value: 'Đổi máy trong 24h nếu lỗi kỹ thuật' },
    { label: 'Bộ nhớ', value: 'SSD 1TB' },
    { label: 'Phụ kiện kèm theo', value: '2 Tay cầm DualSense, Dây HDMI 2.1, Dây nguồn, 3 Game đĩa' },
    { label: 'Tiền cọc', value: '2,000,000₫ (hoàn trả khi trả máy)' },
    { label: 'Khu vực cho thuê', value: 'TP.HCM, Hà Nội' },
    { label: 'Giao hàng', value: 'Giao tận nơi hoặc nhận tại cửa hàng' },
  ],
  description: `Swiftera cung cấp dịch vụ cho thuê PlayStation 5 Slim kèm combo 2 tay cầm DualSense và 3 game hot nhất — lý tưởng cho buổi tiệc, cuối tuần, sự kiện hoặc trải nghiệm trước khi mua.

## Quy trình thuê

1. Chọn thời gian thuê và thanh toán tiền thuê + cọc 2,000,000₫
2. Nhận máy tại cửa hàng hoặc giao tận nơi (phụ thu phí ship)
3. Sử dụng và hoàn trả thiết bị đúng hạn
4. Hoàn cọc trong vòng 24h sau khi trả máy

*Giá thuê chưa bao gồm phí vận chuyển và 8% VAT.*

## Sản phẩm bao gồm

- PlayStation 5 Slim (CFI-2000) — Ổ đĩa hoặc Digital
- 2x Tay cầm DualSense (trắng)
- Dây HDMI 2.1
- Dây nguồn AC
- 3 Game đĩa (có thể chọn theo danh sách)
- Hộp đựng và túi bảo vệ

## Đặc điểm nổi bật

- **Hiệu năng mạnh mẽ**: GPU AMD RDNA 2, hỗ trợ 4K 120fps, Ray Tracing
- **SSD siêu tốc 1TB**: Load game chỉ trong vài giây
- **DualSense Haptic Feedback**: Trải nghiệm phản hồi xúc giác sống động
- **Thiết kế Slim nhỏ gọn**: Dễ dàng mang theo cho sự kiện
- **Tương thích ngược**: Chơi được hàng ngàn game PS4

## Lưu ý khi thuê

- Vui lòng giữ gìn thiết bị cẩn thận trong suốt thời gian thuê
- Trường hợp hư hỏng do sử dụng sai cách, khách hàng chịu chi phí sửa chữa
- Có thể gia hạn thuê bằng cách liên hệ trước 12h khi hết hạn`,
};

export default function ProductDetailPage() {
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(productVariants[0].id);
  const [selectedDuration, setSelectedDuration] = useState(rentalDurations[0].id);
  const [quantity, setQuantity] = useState(1);

  const currentDuration = useMemo(
    () => rentalDurations.find((d) => d.id === selectedDuration) ?? rentalDurations[0],
    [selectedDuration]
  );

  const currentPrice = currentDuration.price;
  const originalPrice = currentDuration.originalPrice;

  return (
    <div className="min-h-screen bg-muted/30 font-sans">
      <div className="mx-auto max-w-7xl px-3 pb-8 pt-20 sm:px-4 sm:pb-10 sm:pt-24 md:px-6 md:pt-28">
        <nav className="mb-4 text-xs text-muted-foreground sm:mb-6 sm:text-sm">
          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <li>
              <a
                href="/"
                className="font-medium text-teal-600 transition-colors hover:underline dark:text-teal-400"
              >
                Trang chủ
              </a>
            </li>
            <li className="text-border">/</li>
            <li>
              <span className="cursor-pointer font-medium text-teal-600 transition-colors hover:underline dark:text-teal-400">
                Gaming
              </span>
            </li>
            <li className="text-border">/</li>
            <li>
              <span className="cursor-pointer font-medium text-teal-600 transition-colors hover:underline dark:text-teal-400">
                PlayStation
              </span>
            </li>
            <li className="text-border">/</li>
            <li className="min-w-0 max-w-full flex-[1_1_100%] font-semibold text-foreground sm:max-w-xs sm:flex-[unset] sm:truncate">
              {mockProduct.name}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-12 gap-4 sm:gap-6">
          <div className="col-span-12 lg:col-span-5">
            <div className="rounded-xl border border-border/60 bg-card p-3 ambient-glow sm:p-4 lg:sticky lg:top-24">
              <RentalProductGallery
                images={mockProduct.images}
                currentImage={currentImage}
                setCurrentImage={setCurrentImage}
              />
            </div>
          </div>

          <div className="col-span-12 flex flex-col gap-4 sm:gap-5 lg:col-span-7">
            <div className="rounded-xl border border-border/60 bg-card p-4 ambient-glow sm:p-5">
              <RentalProductSummary
                productData={{
                  name: mockProduct.name,
                  sku: mockProduct.sku,
                  brand: mockProduct.brand,
                  productType: mockProduct.productType,
                  discount: mockProduct.discount,
                  rating: mockProduct.rating,
                  reviews: mockProduct.reviews,
                  rentedCount: mockProduct.rentedCount,
                  variants: productVariants,
                  durations: rentalDurations,
                }}
                selectedVariant={selectedVariant}
                onVariantChange={setSelectedVariant}
                selectedDuration={selectedDuration}
                onDurationChange={setSelectedDuration}
                currentPrice={currentPrice}
                originalPrice={originalPrice}
              />
            </div>

            <RentalCheckoutCard
              rentalPrice={currentPrice}
              deposit={mockProduct.deposit}
              selectedDuration={currentDuration.label}
              quantity={quantity}
              setQuantity={setQuantity}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-12 gap-4 sm:mt-6 sm:gap-6">
          <div className="col-span-12 flex flex-col gap-4 sm:gap-5 lg:col-span-8">
            <div className="rounded-xl border border-border/60 bg-card p-4 ambient-glow sm:p-5">
              <h2 className="mb-3 text-base font-bold tracking-tight text-foreground sm:mb-4 sm:text-lg">
                Mô tả sản phẩm
              </h2>
              <RentalProductDescription text={mockProduct.description} maxHeight={300} />
            </div>

            <RentalSpecifications specifications={mockProduct.specifications} />
          </div>

          <div className="col-span-12 flex flex-col gap-4 sm:gap-5 lg:col-span-4">
            <RentalDeliverySection />
            <RentalProcessSection />
            {/* <RentalAddonServicesSection /> */}
          </div>
        </div>

        <div className="mt-4 sm:mt-6">
          <RentalReviewsSection rating={mockProduct.rating} reviews={mockProduct.reviews} />
        </div>

        <div className="mt-4 sm:mt-6">
          <RentalRelatedProducts />
        </div>
      </div>
    </div>
  );
}
