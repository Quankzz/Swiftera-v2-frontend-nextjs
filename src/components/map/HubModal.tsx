'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Phone,
  Clock,
  Package,
  ShoppingCart,
  Navigation2,
} from 'lucide-react';
import { useMapStore } from '@/stores/use-map-store';
import type { Hub, MapProductItem } from '@/types/map.types';

const STATUS_CONFIG: Record<
  MapProductItem['status'],
  { label: string; className: string }
> = {
  AVAILABLE: {
    label: 'Còn hàng',
    className: 'bg-success-muted text-success',
  },
  RENTED: {
    label: 'Đang thuê',
    className: 'bg-warning-muted text-warning',
  },
  MAINTENANCE: {
    label: 'Bảo trì',
    className: 'bg-muted text-muted-foreground',
  },
};

const HubModal = ({
  onNavigateToHub,
}: {
  onNavigateToHub?: (hub: Hub) => void;
}) => {
  const { isHubModalOpen, selectedHub, closeHubModal } = useMapStore();

  useEffect(() => {
    if (!isHubModalOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeHubModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isHubModalOpen, closeHubModal]);

  if (!selectedHub) return null;

  const availableCount = selectedHub.available_products;
  const totalCount = selectedHub.total_products;

  return (
    <AnimatePresence>
      {isHubModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
          onClick={closeHubModal}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="
              relative w-full sm:max-w-2xl
              max-h-[92dvh] sm:max-h-[88vh]
              bg-card
              rounded-t-3xl sm:rounded-2xl
              shadow-2xl overflow-hidden flex flex-col
            "
          >
            {/* Hero image */}
            {selectedHub.image_url ? (
              <div className="relative h-44 sm:h-48 shrink-0">
                <Image
                  src={selectedHub.image_url}
                  alt={selectedHub.name}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 pr-14 flex items-end justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-white font-bold text-xl sm:text-2xl leading-tight drop-shadow truncate">
                      {selectedHub.name}
                    </h2>
                    <p className="text-white/80 text-sm mt-1 line-clamp-1 drop-shadow-sm">
                      {selectedHub.address}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      closeHubModal();
                      onNavigateToHub?.(selectedHub);
                    }}
                    title="Chỉ đường đến đây"
                    className="
                      shrink-0 flex items-center justify-center gap-1.5
                      px-3 py-2 rounded-xl
                      bg-success hover:bg-success/80 active:bg-success/70
                      text-success-foreground font-semibold text-xs sm:text-sm
                      shadow-lg shadow-black/20
                      transition-all duration-150 active:scale-95
                    "
                  >
                    <Navigation2 size={16} strokeWidth={2.5} />
                    <span>Chỉ đường</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-5 pt-6 pb-4 pr-14 shrink-0 border-b border-border flex items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate flex-1">
                  {selectedHub.name}
                </h2>
                <button
                  onClick={() => {
                    closeHubModal();
                    onNavigateToHub?.(selectedHub);
                  }}
                  title="Chỉ đường đến đây"
                  className="
                    shrink-0 flex items-center justify-center gap-1.5
                    px-3 py-2 rounded-xl
                    bg-success hover:bg-success/80 active:bg-success/70
                    text-success-foreground font-semibold text-xs sm:text-sm
                    shadow-sm
                    transition-all duration-150 active:scale-95
                  "
                >
                  <Navigation2 size={16} strokeWidth={2.5} />
                  <span>Chỉ đường</span>
                </button>
              </div>
            )}

            {/* Close button */}
            <button
              onClick={closeHubModal}
              className="
                absolute top-4 right-4 p-2 rounded-full
                bg-muted/80 text-muted-foreground
                hover:bg-accent hover:text-foreground transition-all duration-150 backdrop-blur-md
                active:scale-95 z-20 shadow-sm
              "
              aria-label="Đóng"
            >
              <X size={16} strokeWidth={2.5} />
            </button>

            {/* Info strip */}
            <div className="px-5 py-4 border-b border-border shrink-0 space-y-3">
              {selectedHub.image_url && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin
                    size={14}
                    className="text-success mt-0.5 shrink-0"
                  />
                  <span className="leading-snug">{selectedHub.address}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {selectedHub.phone_number && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone size={13} className="text-success shrink-0" />
                    <a
                      href={`tel:${selectedHub.phone_number}`}
                      className="hover:text-success transition-colors"
                    >
                      {selectedHub.phone_number}
                    </a>
                  </div>
                )}
                {selectedHub.open_hours && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock size={13} className="text-success shrink-0" />
                    <span>{selectedHub.open_hours}</span>
                  </div>
                )}
              </div>

              {/* Availability */}
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Package size={13} className="text-success" />
                <span>
                  <b className="text-success font-bold">
                    {availableCount}
                  </b>
                  <span className="text-muted-foreground">
                    {' '}
                    / {totalCount} sản phẩm
                  </span>
                </span>
              </div>
            </div>

            {/* Products list */}
            <div className="flex-1 overflow-y-auto [scrollbar-width:thin]">
              <div className="px-4 py-3 space-y-2.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                  Danh sách sản phẩm
                </p>
                {selectedHub.products.map((product) => {
                  const status = STATUS_CONFIG[product.status];
                  const isAvailable = product.status === 'AVAILABLE';

                  return (
                    <div
                      key={product.product_item_id}
                      className="
                        flex gap-3 p-3.5 rounded-2xl
                        bg-muted/40
                        border border-border/50
                        hover:border-success/30
                        transition-all duration-150
                      "
                    >
                      {/* Product image */}
                      <div className="relative w-18 h-18 rounded-xl overflow-hidden shrink-0 bg-muted">
                        <Image
                          src={product.image_url ?? ''}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Product info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <h4 className="font-semibold text-sm text-foreground leading-tight line-clamp-1">
                            {product.name}
                          </h4>
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {product.category}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between mt-2.5">
                          <span className="text-success font-bold text-sm">
                            {product.current_daily_price.toLocaleString(
                              'vi-VN',
                            )}
                            đ
                            <span className="text-xs font-normal text-muted-foreground">
                              /ngày
                            </span>
                          </span>
                          <button
                            disabled={!isAvailable}
                            className={`
                              flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl
                              transition-all duration-150 active:scale-95
                              ${
                                isAvailable
                                  ? 'bg-success hover:bg-success/80 text-success-foreground shadow-sm'
                                  : 'bg-muted text-muted-foreground cursor-not-allowed'
                              }
                            `}
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
              <div className="h-4" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HubModal;
