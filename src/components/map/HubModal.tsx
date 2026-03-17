'use client';
import Image from 'next/image';
import type React from 'react';
import { X, MapPin, Phone, Clock, Package, ShoppingCart } from 'lucide-react';
import { useMapStore } from '@/stores/use-map-store';
import type { ProductItem } from '@/types/map.types';

const statusConfig: Record<
  ProductItem['status'],
  { label: string; color: string }
> = {
  AVAILABLE: { label: 'Còn hàng', color: 'bg-emerald-100 text-emerald-700' },
  RENTED: { label: 'Đang thuê', color: 'bg-orange-100 text-orange-700' },
  MAINTENANCE: {
    label: 'Bảo trì',
    color: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
  },
};

const HubModal: React.FC = () => {
  const { isHubModalOpen, selectedHub, closeHubModal } = useMapStore();

  if (!isHubModalOpen || !selectedHub) return null;

  return (
    <div
      className="fixed inset-0 z-50 shrink-0 items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={closeHubModal}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] shrink-0 shrink-0-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header image */}
        {selectedHub.imageUrl && (
          <div className="relative h-36 md:h-48 rounded-t-2xl overflow-hidden shrink-0">
            <Image
              src={selectedHub.imageUrl}
              alt={selectedHub.name}
              layout="fill"
              objectFit="cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-4 right-12">
              <h2 className="text-white font-bold text-lg md:text-xl leading-tight">
                {selectedHub.name}
              </h2>
            </div>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={closeHubModal}
          className="absolute top-3 right-3 bg-white/90 hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-700 rounded-full p-1.5 shadow-md transition-colors z-10 text-slate-600 dark:text-slate-300"
          aria-label="Đóng"
        >
          <X size={16} />
        </button>

        {/* Hub info */}
        <div className="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-700/80 shrink-0">
          {!selectedHub.imageUrl && (
            <h2 className="font-bold text-lg text-emerald-600 mb-2">
              {selectedHub.name}
            </h2>
          )}
          <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 shrink-0 text-emerald-500" />
              <span>{selectedHub.address}</span>
            </div>
            {selectedHub.phoneNumber && (
              <div className="flex items-center gap-2">
                <Phone size={14} className="flex text-emerald-500" />
                <span>{selectedHub.phoneNumber}</span>
              </div>
            )}
            {selectedHub.openHours && (
              <div className="flex items-center gap-2">
                <Clock size={14} className="flex text-emerald-500" />
                <span>{selectedHub.openHours}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Package size={14} className="flex text-emerald-500" />
              <span>
                <span className="font-semibold text-emerald-600">
                  {selectedHub.availableProducts}
                </span>{' '}
                / {selectedHub.totalProducts} sản phẩm còn trống
              </span>
            </div>
          </div>
        </div>

        {/* Products list */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="font-semibold text-sm mb-3 text-slate-700 dark:text-slate-200">
            Sản phẩm tại hub
          </h3>
          <div className="space-y-3">
            {selectedHub.products.map((product) => {
              const status = statusConfig[product.status];
              return (
                <div
                  key={product.id}
                  className="flex gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800 hover:border-emerald-200 dark:hover:border-emerald-700/60 transition-colors"
                >
                  {/* Product image */}
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 shrink-0-wrap">
                      <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 leading-tight">
                        {product.name}
                      </h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {product.category}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mt-2 shrink-0-wrap gap-1">
                      <div>
                        <span className="text-emerald-600 font-bold text-sm">
                          {product.dailyPrice.toLocaleString('vi-VN')}đ
                        </span>
                        <span className="text-gray-400 text-xs">/ngày</span>
                      </div>
                      <button
                        disabled={product.status !== 'AVAILABLE'}
                        className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
                      >
                        <ShoppingCart size={12} />
                        Thuê ngay
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HubModal;
