'use client';

import { useState } from 'react';
import Link from 'next/link';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ThumbsUp, MessageCircle, Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';

/* ---------- Rating (đánh giá tổng quan) ---------- */

function ReviewRatingStars({ rating, reviews }: { rating: number; reviews?: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-foreground">{rating.toFixed(1)}</span>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => {
          const starFill = Math.min(10, Math.max(0, (rating - index) * 10));
          return (
            <div key={index} className="relative inline-block w-4 h-4" style={{ fontSize: '14px' }}>
              <span className="absolute top-0 left-0 w-full h-full text-muted-foreground/40" style={{ display: 'inline-block' }}>
                ★
              </span>
              <span
                className="absolute top-0 left-0 h-full overflow-hidden text-yellow-400"
                style={{ display: 'inline-block', width: `${starFill * 10}%` }}
              >
                ★
              </span>
            </div>
          );
        })}
      </div>
      {reviews !== undefined && <span className="text-sm text-muted-foreground">({reviews})</span>}
    </div>
  );
}

/* ---------- Thẻ 1 bình luận ---------- */

interface ReviewImage {
  src: string;
  alt: string;
}

interface RentalReviewCardProps {
  author: string;
  avatar: string;
  joinedYears: number;
  reviewsCount: number;
  likesCount: number;
  rating: number;
  title: string;
  content: string;
  images: ReviewImage[];
  verifiedPurchase: boolean;
  timeAgo: string;
  usedDays: number;
  helpfulCount: number;
  shopResponse?: {
    author: string;
    content: string;
    timeAgo: string;
  };
}

function RentalReviewCard({
  author,
  avatar,
  joinedYears,
  reviewsCount,
  likesCount,
  rating,
  title,
  content,
  images,
  verifiedPurchase,
  timeAgo,
  usedDays,
  helpfulCount,
  shopResponse,
}: RentalReviewCardProps) {
  return (
    <div className="py-6 border-b">
      <div className="flex gap-4">
        <Avatar className="w-10 h-10">
          <AvatarImage src={avatar} alt="" />
          <AvatarFallback>{author.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">{author}</h3>
              <div className="text-sm text-muted-foreground">Đã tham gia {joinedYears} năm</div>
              <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
                <span>Đã viết {reviewsCount} đánh giá</span>
                <span>Đã nhận {likesCount} lượt cảm ơn</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-muted-foreground/25'}`}>
                    ★
                  </span>
                ))}
              </div>
              <span className="font-medium">{title}</span>
            </div>

            {verifiedPurchase && (
              <div className="flex items-center gap-1 text-green-600 text-sm mb-2">
                <Check className="w-4 h-4" />
                Đã thuê
              </div>
            )}

            <p className="mb-4 leading-relaxed text-foreground">{content}</p>

            {images.length > 0 && (
              <div className="flex gap-2 mb-4">
                {images.map((image, index) => (
                  <div key={index} className="relative w-[77px] h-[77px]">
                    <img src={image.src} alt={image.alt} className="object-cover rounded-lg" />
                  </div>
                ))}
              </div>
            )}

            <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span>Đánh giá vào {timeAgo}</span>
              <span>•</span>
              <span>Đã dùng {usedDays} ngày</span>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <ThumbsUp className="mr-2 size-4" />
                Hữu ích ({helpfulCount})
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <MessageCircle className="mr-2 size-4" />1
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Share2 className="mr-2 size-4" />
                Chia sẻ
              </Button>
            </div>

            {shopResponse && (
              <div className="mt-4 rounded-lg border border-border bg-muted/40 p-4 dark:bg-muted/20">
                <div className="mb-2 flex items-center gap-2">
                  <Avatar className="size-6">
                    <AvatarFallback>S</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-foreground">{shopResponse.author}</span>
                  <span className="text-sm text-muted-foreground">{shopResponse.timeAgo}</span>
                </div>
                <p className="leading-relaxed text-foreground">{shopResponse.content}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Khối đánh giá ---------- */

interface RentalReviewsSectionProps {
  rating: number;
  reviews: number;
}

const sampleReviews: RentalReviewCardProps[] = [
  {
    author: 'Phan Thuỷ',
    avatar: '/placeholder.svg?height=40&width=40',
    joinedYears: 3,
    reviewsCount: 15,
    likesCount: 2,
    rating: 5,
    title: 'Cực kỳ hài lòng',
    content: 'Máy mới, giao đúng hẹn, nhân viên hướng dẫn nhiệt tình. Sẽ thuê lại khi có sự kiện.',
    images: [
      { src: 'https://placehold.co/80x80', alt: 'Ảnh đánh giá 1' },
      { src: 'https://placehold.co/80x80', alt: 'Ảnh đánh giá 2' },
    ],
    verifiedPurchase: true,
    timeAgo: '3 tháng trước',
    usedDays: 7,
    helpfulCount: 1,
    shopResponse: {
      author: 'Swiftera',
      content:
        'Cảm ơn bạn đã tin tưởng dịch vụ cho thuê của Swiftera. Chúng tôi luôn cố gắng mang đến trải nghiệm tốt nhất và rất mong được đồng hành cùng bạn trong những lần sau.',
      timeAgo: '3 tháng trước',
    },
  },
  {
    author: 'Nguyễn Văn A',
    avatar: '/placeholder.svg?height=40&width=40',
    joinedYears: 1,
    reviewsCount: 5,
    likesCount: 0,
    rating: 4,
    title: 'Tốt',
    content: 'Thiết bị ổn, giao hàng nhanh.',
    images: [{ src: 'https://placehold.co/80x80', alt: 'Ảnh đánh giá' }],
    verifiedPurchase: true,
    timeAgo: '1 tháng trước',
    usedDays: 3,
    helpfulCount: 0,
  },
  {
    author: 'Trần Thị B',
    avatar: '/placeholder.svg?height=40&width=40',
    joinedYears: 2,
    reviewsCount: 10,
    likesCount: 1,
    rating: 3,
    title: 'Bình thường',
    content: 'Dùng được, mong lần sau có thêm lựa chọn giao nhanh hơn.',
    images: [],
    verifiedPurchase: true,
    timeAgo: '2 tuần trước',
    usedDays: 5,
    helpfulCount: 1,
  },
];

export function RentalReviewsSection({ rating, reviews }: RentalReviewsSectionProps) {
  const [selectedFilter, setSelectedFilter] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 2;

  const filters = [
    { id: 'newest', label: 'Mới nhất' },
    { id: 'has_image', label: 'Có hình ảnh' },
    { id: 'verified', label: 'Đã thuê' },
    { id: '5_star', label: '5 sao' },
    { id: '4_star', label: '4 sao' },
    { id: '3_star', label: '3 sao' },
    { id: '2_star', label: '2 sao' },
    { id: '1_star', label: '1 sao' },
  ];

  const ratingDistribution = [
    { stars: 5, count: 5 },
    { stars: 4, count: 0 },
    { stars: 3, count: 0 },
    { stars: 2, count: 0 },
    { stars: 1, count: 0 },
  ];

  const reviewImages = [
    { src: 'https://placehold.co/80x80', alt: '1' },
    { src: 'https://placehold.co/80x80', alt: '2' },
    { src: 'https://placehold.co/80x80', alt: '3' },
    { src: 'https://placehold.co/80x80', alt: '4' },
    { src: 'https://placehold.co/80x80', alt: '5' },
    { src: 'https://placehold.co/80x80', alt: '6' },
  ];

  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = sampleReviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(sampleReviews.length / reviewsPerPage);

  return (
    <div className="rounded-xl border border-border/60 bg-card p-6 font-sans ambient-glow">
      <h2 className="mb-6 text-xl font-bold tracking-tight text-foreground">Khách hàng đánh giá</h2>

      <div className="grid md:grid-cols-2 gap-8 mb-6">
        <div>
          <h3 className="mb-4 text-lg font-bold tracking-tight text-foreground">Tổng quan</h3>
          <div className="mb-4 flex items-baseline gap-2">
            <span className="text-5xl font-bold tracking-tight text-foreground">{rating.toFixed(1)}</span>
            <ReviewRatingStars rating={rating} />
          </div>
          <p className="mb-4 text-muted-foreground">({reviews} đánh giá)</p>

          <div className="space-y-2">
            {ratingDistribution.map((row) => (
              <div key={row.stars} className="flex items-center gap-2">
                <ReviewRatingStars rating={row.stars} />
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${reviews > 0 ? (row.count / reviews) * 100 : 0}%` }}
                  />
                </div>
                <span className="min-w-[20px] text-muted-foreground">{row.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-bold tracking-tight text-foreground">
            Tất cả hình ảnh ({reviewImages.length})
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {reviewImages.map((image, index) => (
              <div key={index} className="relative w-[69px] h-[69px]">
                <img src={image.src} alt={image.alt} className="object-cover rounded-lg w-full h-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="mb-4 text-lg font-bold tracking-tight text-foreground">Lọc theo</h3>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={selectedFilter === filter.id ? 'default' : 'outline'}
              onClick={() => setSelectedFilter(filter.id)}
              className="rounded-full"
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="divide-y">
        {currentReviews.map((review, index) => (
          <RentalReviewCard key={`${review.author}-${index}`} {...review} />
        ))}
      </div>

      <Pagination className="mt-6">
        <PaginationContent>
          {currentPage > 1 && <PaginationPrevious onClick={() => setCurrentPage(currentPage - 1)} />}
          {Array.from({ length: totalPages }, (_, index) => (
            <PaginationItem key={index}>
              <PaginationLink isActive={currentPage === index + 1} onClick={() => setCurrentPage(index + 1)}>
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          {currentPage < totalPages && <PaginationNext onClick={() => setCurrentPage(currentPage + 1)} />}
        </PaginationContent>
      </Pagination>
    </div>
  );
}

/* ---------- Sản phẩm liên quan ---------- */

interface RelatedRentalProduct {
  id: number;
  name: string;
  image: string;
  pricePerDay: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
}

interface ArrowProps {
  onClick?: () => void;
}

const relatedProducts: RelatedRentalProduct[] = [
  {
    id: 1,
    name: 'Cho thuê PlayStation 5 Slim Digital',
    image: 'https://placehold.co/280x280/f0f0f0/333?text=PS5+Digital',
    pricePerDay: 250000,
    originalPrice: 280000,
    discount: 10,
    rating: 4.9,
  },
  {
    id: 2,
    name: 'Cho thuê Xbox Series X 1TB',
    image: 'https://placehold.co/280x280/f0f0f0/333?text=Xbox+X',
    pricePerDay: 280000,
    rating: 4.8,
  },
  {
    id: 3,
    name: 'Cho thuê Nintendo Switch OLED',
    image: 'https://placehold.co/280x280/f0f0f0/333?text=Switch+OLED',
    pricePerDay: 200000,
    originalPrice: 220000,
    discount: 9,
    rating: 4.7,
  },
  {
    id: 4,
    name: 'Cho thuê MacBook Pro M3 14 inch',
    image: 'https://placehold.co/280x280/f0f0f0/333?text=MacBook+Pro',
    pricePerDay: 500000,
    rating: 5.0,
  },
  {
    id: 5,
    name: 'Cho thuê iPad Pro M4 13 inch',
    image: 'https://placehold.co/280x280/f0f0f0/333?text=iPad+Pro',
    pricePerDay: 350000,
    originalPrice: 400000,
    discount: 12,
    rating: 4.9,
  },
  {
    id: 6,
    name: 'Cho thuê kính VR Meta Quest 3',
    image: 'https://placehold.co/280x280/f0f0f0/333?text=Quest+3',
    pricePerDay: 300000,
    rating: 4.6,
  },
  {
    id: 7,
    name: 'Cho thuê loa JBL PartyBox 310',
    image: 'https://placehold.co/280x280/f0f0f0/333?text=JBL+310',
    pricePerDay: 400000,
    originalPrice: 450000,
    discount: 11,
    rating: 4.8,
  },
  {
    id: 8,
    name: 'Cho thuê máy chiếu Epson EB-FH52',
    image: 'https://placehold.co/280x280/f0f0f0/333?text=Epson+FH52',
    pricePerDay: 350000,
    rating: 4.7,
  },
];

export function RentalRelatedProducts() {
  function SampleNextArrow(props: ArrowProps) {
    const { onClick } = props;
    return (
      <div
        className="absolute top-1/2 right-[-12px] z-10 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-card shadow-lg transition-colors hover:bg-muted/50"
        onClick={onClick}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-5 text-foreground">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    );
  }

  function SamplePrevArrow(props: ArrowProps) {
    const { onClick } = props;
    return (
      <div
        className="absolute top-1/2 left-[-12px] z-10 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-card shadow-lg transition-colors hover:bg-muted/50"
        onClick={onClick}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-5 text-foreground">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 5l-7 7 7 7" />
        </svg>
      </div>
    );
  }

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
    ],
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 font-sans ambient-glow">
      <h2 className="mb-5 text-lg font-bold tracking-tight text-foreground">Sản phẩm liên quan</h2>
      <div className="px-4">
        <Slider {...settings}>
          {relatedProducts.map((product) => (
            <div key={product.id} className="px-2">
              <Link href={`/product/${product.id}`} className="block group">
                <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-muted/40">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.discount && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                      -{product.discount}%
                    </span>
                  )}
                </div>
                <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-foreground transition-colors group-hover:text-teal-600 dark:group-hover:text-teal-400">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-sm ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-muted-foreground/25'}`}>
                      ★
                    </span>
                  ))}
                  <span className="ml-1 text-xs text-muted-foreground">{product.rating}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold text-teal-600 dark:text-teal-400">{product.pricePerDay.toLocaleString()}₫</span>
                  <span className="text-xs text-muted-foreground">/ngày</span>
                </div>
                {product.originalPrice && (
                  <span className="text-xs text-muted-foreground line-through">{product.originalPrice.toLocaleString()}₫</span>
                )}
              </Link>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}
