'use client';

import type React from 'react';
import { LocateFixed } from 'lucide-react';
import { useMapStore } from '@/stores/use-map-store';

interface LocationButtonProps {
  onGetLocation: () => void;
}

const LocationButton: React.FC<LocationButtonProps> = ({ onGetLocation }) => {
  const { isLocationOn } = useMapStore();

  return (
    <div className="fixed right-12 bottom-12 md:bottom-8 md:right-12 z-10">
      <button
        onClick={onGetLocation}
        title="Định vị của tôi"
        className={`
          group relative flex items-center justify-center w-11 h-11 rounded-2xl
          shadow-[0_8px_30px_rgb(0,0,0,0.12)] border transition-all duration-300
          active:scale-90 overflow-hidden
          ${
            isLocationOn
              ? 'bg-card text-success border-success-border'
              : 'bg-card text-muted-foreground border-border/80 hover:text-success'
          }
        `}
        aria-label="Định vị của tôi"
      >
        <div
          className={`absolute inset-0 bg-success-muted scale-0 transition-transform duration-300 rounded-2xl ${isLocationOn ? 'scale-100' : 'group-hover:scale-100'}`}
        />
        <LocateFixed
          size={20}
          strokeWidth={2.2}
          className="relative z-10 transition-transform duration-300 group-hover:scale-110"
        />
        {/* Pulse ring when active */}
        {isLocationOn && (
          <span className="absolute inset-0 rounded-2xl border-2 border-success animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-30 pointer-events-none" />
        )}
      </button>
    </div>
  );
};

export default LocationButton;
