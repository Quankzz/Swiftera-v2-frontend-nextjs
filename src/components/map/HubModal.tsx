'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Phone, Navigation2 } from 'lucide-react';
import { useMapStore } from '@/stores/use-map-store';
import type { Hub } from '@/types/map.types';

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
            <div className="px-5 py-5 space-y-3">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin
                  size={14}
                  className="text-theme-primary-start mt-0.5 shrink-0"
                />
                <span className="leading-snug">
                  {selectedHub.address || '—'}
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HubModal;
