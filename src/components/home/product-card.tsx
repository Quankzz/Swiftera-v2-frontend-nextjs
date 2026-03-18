import Image from "next/image";
import { Heart } from "lucide-react";
import type { Product } from "@/types/catalog";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
}

const formatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

export function ProductCard({ product }: ProductCardProps) {
  const monthlyPrice = product.dailyPrice;
  const oldMonthly = product.oldDailyPrice;
  const discount =
    oldMonthly && oldMonthly > monthlyPrice
      ? Math.round(((oldMonthly - monthlyPrice) / oldMonthly) * 100)
      : null;

  return (
    <div className='group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/40 bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg'>
      <div className='absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 shadow-sm'>
        <Heart className='size-4 text-muted-foreground' />
      </div>

      {product.badge && (
        <span className='absolute left-3 top-3 z-10 rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white shadow-sm'>
          {product.badge}
        </span>
      )}

      <div className='relative h-64 w-full bg-muted'>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes='(min-width: 1024px) 300px, 50vw'
          className='object-contain transition-transform duration-500 group-hover:scale-105'
        />
      </div>

      <div className='flex flex-1 flex-col gap-3 px-4 py-4'>
        <div>
          <h3 className='text-lg font-semibold text-text-main'>
            {product.name}
          </h3>
          <p className='text-sm text-text-sub line-clamp-2'>
            {product.description}
          </p>
        </div>

        <div className='mt-auto space-y-2'>
          <div className='flex items-baseline gap-2 text-rose-600'>
            <span className='text-2xl font-bold'>
              {formatter.format(monthlyPrice)}
            </span>
            <span className='text-sm text-text-sub font-medium'>/ Month</span>
            {oldMonthly && (
              <span className='text-sm text-text-sub line-through'>
                {formatter.format(oldMonthly)}
              </span>
            )}
          </div>
          {discount && (
            <div className='inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600'>
              Save {discount}%
            </div>
          )}
          {product.color && (
            <p className='text-xs text-text-sub'>Color: {product.color}</p>
          )}
          {product.depositAmount !== undefined && (
            <p className='text-xs text-text-sub'>
              Deposit from {formatter.format(product.depositAmount)}
            </p>
          )}
          <Button className='w-full rounded-full bg-linear-to-r from-theme-primary-start to-theme-primary-end font-semibold text-white shadow-md hover:opacity-90'>
            Rent now
          </Button>
        </div>
      </div>
    </div>
  );
}
