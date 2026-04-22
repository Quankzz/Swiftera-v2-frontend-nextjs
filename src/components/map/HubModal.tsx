"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Phone,
  Navigation2,
  Package,
  Loader2,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { useMapStore } from "@/stores/use-map-store";
import type { Hub } from "@/types/map.types";
import { useHubAvailableProducts } from "@/features/products/hooks/use-hub-products";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
}

const HubModal = ({
  onNavigateToHub,
}: {
  onNavigateToHub?: (hub: Hub) => void;
}) => {
  const { isHubModalOpen, selectedHub, closeHubModal } = useMapStore();

  const { data, isLoading, isError, refetch } = useHubAvailableProducts(
    selectedHub?.hub_id,
    isHubModalOpen,
  );
  const hubProducts = data?.hubProducts ?? [];
  const totalAvailable = data?.totalAvailable ?? 0;

  useEffect(() => {
    if (!isHubModalOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeHubModal();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isHubModalOpen, closeHubModal]);

  if (!selectedHub) return null;

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
            {/* Header */}
            <div className="px-5 pt-6 pb-4 pr-14 shrink-0 border-b border-border flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate flex-1">
                  {selectedHub.name}
                </h2>
                {selectedHub.code && (
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-[11px] font-mono font-bold text-muted-foreground border border-border/50 shrink-0">
                    {selectedHub.code}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  const hub = selectedHub; // capture before closing
                  closeHubModal();
                  onNavigateToHub?.(hub);
                }}
                title="Chỉ đường đến đây"
                className="
                  shrink-0 flex items-center justify-center gap-1.5
                  px-3 py-2 rounded-xl
                  bg-linear-to-r from-theme-primary-start to-theme-primary-end hover:brightness-110
                  text-white font-semibold text-xs sm:text-sm shadow-sm
                  transition-all duration-150 active:scale-95
                "
              >
                <Navigation2 size={16} strokeWidth={2.5} />
                <span>Chỉ đường</span>
              </button>
            </div>

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
            <div className="px-5 py-4 shrink-0 space-y-2 border-b border-border">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin
                  size={14}
                  className="text-theme-primary-start mt-0.5 shrink-0"
                />
                <span className="leading-snug">
                  {selectedHub.address || "-"}
                </span>
              </div>

              {selectedHub.phone && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone
                    size={13}
                    className="text-theme-primary-start shrink-0"
                  />
                  <a
                    href={`tel:${selectedHub.phone}`}
                    className="hover:text-theme-primary-start transition-colors"
                  >
                    {selectedHub.phone}
                  </a>
                </div>
              )}
            </div>

            {/* Products section */}
            <div className="flex-1 overflow-y-auto">
              {/* Section header */}
              <div className="px-5 py-3 flex items-center gap-2 sticky top-0 bg-card/95 backdrop-blur-sm z-10 border-b border-border/50">
                <Package
                  size={15}
                  className="text-theme-primary-start shrink-0"
                />
                <span className="text-sm font-semibold text-foreground">
                  Thiết bị có sẵn
                </span>
                {!isLoading && !isError && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {totalAvailable > 0
                      ? `${totalAvailable} chiếc · ${hubProducts.length} loại`
                      : "Không có thiết bị"}
                  </span>
                )}
              </div>
              {/* Loading */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
                  <Loader2 size={28} className="animate-spin opacity-60" />
                  <span className="text-sm">Đang tải thiết bị…</span>
                </div>
              )}
              {/* Error */}
              {!isLoading && isError && (
                <div className="flex flex-col items-center justify-center gap-3 py-10 px-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Package
                      size={22}
                      strokeWidth={1.4}
                      className="text-destructive opacity-50"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      Không thể tải thiết bị
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Vui lòng thử lại
                    </p>
                  </div>
                  <button
                    onClick={() => void refetch()}
                    className="
                      mt-1 px-4 py-2 rounded-xl text-xs font-bold
                      bg-destructive/10 text-destructive
                      hover:bg-destructive/20 transition-all active:scale-95
                    "
                  >
                    Tải lại
                  </button>
                </div>
              )}
              {/* Empty */}
              {!isLoading && !isError && hubProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2.5 py-10 px-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Package
                      size={22}
                      strokeWidth={1.4}
                      className="text-muted-foreground/40"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-foreground">
                      Hub chưa có thiết bị khả dụng
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedHub.name} hiện chưa có sản phẩm nào sẵn sàng cho
                      thuê.
                    </p>
                  </div>
                </div>
              )}
              {/* Product list */}
              {!isLoading && !isError && hubProducts.length > 0 && (
                <div className="block divide-y divide-border/60">
                  {hubProducts.map(({ product, availableCount }) => {
                    const primaryImage =
                      product.images.find((img) => img.isPrimary)?.imageUrl ??
                      product.images[0]?.imageUrl;

                    return (
                      <div
                        key={product.productId}
                        className="flex gap-4 px-5 py-4 hover:bg-muted/40 transition-colors"
                      >
                        {/* Thumbnail */}
                        <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                          {primaryImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={primaryImage}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package
                              size={24}
                              strokeWidth={1.4}
                              className="opacity-30"
                            />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
                              {product.name}
                            </p>
                            <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                              {availableCount} chiếc
                            </span>
                          </div>

                          {(() => {
                            const colorLabel =
                              product.colors.length > 0
                                ? product.colors.map((c) => c.name).join(", ")
                                : product.color;
                            if (!colorLabel && !product.brand) return null;
                            return (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {[product.brand, colorLabel]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </p>
                            );
                          })()}

                          {product.dailyPrice > 0 && (
                            <div className="flex items-center justify-between gap-2 mt-1">
                              <div className="flex items-baseline gap-2">
                                <span className="text-sm font-bold text-theme-primary-start">
                                  {formatPrice(product.dailyPrice)}
                                  <span className="text-xs font-normal text-muted-foreground">
                                    /ngày
                                  </span>
                                </span>
                                {product.oldDailyPrice &&
                                  product.oldDailyPrice >
                                    product.dailyPrice && (
                                    <span className="text-xs text-muted-foreground line-through">
                                      {formatPrice(product.oldDailyPrice)}
                                    </span>
                                  )}
                              </div>
                              <Link
                                href={`/product/${product.productId}`}
                                onClick={closeHubModal}
                                className="
                                  shrink-0 flex items-center gap-1.5
                                  px-3 py-1.5 rounded-lg text-sm font-bold
                                  bg-linear-to-r from-theme-primary-start to-theme-primary-end
                                  text-white shadow-sm hover:brightness-110
                                  transition-all duration-150 active:scale-95
                                "
                              >
                                <ShoppingCart size={16} strokeWidth={2.5} />
                                Thuê ngay
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HubModal;
