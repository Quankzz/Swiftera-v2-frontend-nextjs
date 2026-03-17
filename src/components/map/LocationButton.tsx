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
    <div className="fixed bottom-32 right-4 md:bottom-28 md:right-4 z-10">
      <button
        onClick={onGetLocation}
        title="Định vị của tôi"
        className={`flex items-center justify-center p-3 rounded-full shadow-lg border transition-all ${
          isLocationOn
            ? 'bg-blue-500 text-white border-blue-400 shadow-blue-200 dark:shadow-blue-900'
            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-xl'
        }`}
      >
        <LocateFixed size={20} />
      </button>
    </div>
  );
};

export default LocationButton;
