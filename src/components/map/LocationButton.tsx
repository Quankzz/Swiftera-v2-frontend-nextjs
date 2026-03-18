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
              ? 'bg-white text-emerald-600 border-emerald-100 dark:bg-slate-800 dark:text-emerald-400 dark:border-emerald-900/50'
              : 'bg-white text-slate-600 border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:text-emerald-500 dark:hover:text-emerald-400'
          }
        `}
        aria-label="Định vị của tôi"
      >
        <div
          className={`absolute inset-0 bg-emerald-50 dark:bg-emerald-900/20 scale-0 transition-transform duration-300 rounded-2xl ${isLocationOn ? 'scale-100' : 'group-hover:scale-100'}`}
        />
        <LocateFixed
          size={20}
          strokeWidth={2.2}
          className="relative z-10 transition-transform duration-300 group-hover:scale-110"
        />
        {/* Pulse ring when active */}
        {isLocationOn && (
          <span className="absolute inset-0 rounded-2xl border-2 border-emerald-400 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-30 pointer-events-none" />
        )}
      </button>
    </div>
  );
};

export default LocationButton;
