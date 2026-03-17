'use client';

import type React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { useMapStore } from '@/stores/use-map-store';

interface DirectionSidebarProps {
  onRouteSearch: () => void;
}

const DirectionSidebar: React.FC<DirectionSidebarProps> = ({
  onRouteSearch,
}) => {
  const {
    startAddress,
    setStartAddress,
    endAddress,
    setEndAddress,
    currentLocationUsage,
    setCurrentLocationUsage,
  } = useMapStore();

  return (
    <div className="absolute top-2 left-2 z-10 md:w-80 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-emerald-600 px-4 py-3">
        <h2 className="text-white font-semibold text-sm md:text-base shrink-0 items-center gap-2">
          <Navigation size={16} />
          Tìm đường
        </h2>
      </div>

      {/* Inputs */}
      <div className="p-3 space-y-2">
        {/* Start */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400 border-2 border-white shadow shrink" />
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Điểm xuất phát"
              value={startAddress}
              onChange={(e) => {
                setStartAddress(e.target.value);
                if (currentLocationUsage === 'start')
                  setCurrentLocationUsage(null);
              }}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 pr-8"
            />
            <button
              title="Dùng vị trí hiện tại làm điểm xuất phát"
              onClick={() => {
                setCurrentLocationUsage('start');
                // Trigger to parent via store flag
                useMapStore.setState({ currentLocationUsage: 'start' });
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-700"
            >
              <MapPin size={14} />
            </button>
          </div>
        </div>

        {/* Divider line */}
        <div className="ml-1.5 border-l-2 border-dashed border-gray-300 h-2" />

        {/* End */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow shrink-0" />
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Điểm đến"
              value={endAddress}
              onChange={(e) => {
                setEndAddress(e.target.value);
                if (currentLocationUsage === 'end')
                  setCurrentLocationUsage(null);
              }}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 pr-8"
            />
            <button
              title="Dùng vị trí hiện tại làm điểm đến"
              onClick={() => {
                setCurrentLocationUsage('end');
                useMapStore.setState({ currentLocationUsage: 'end' });
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700"
            >
              <MapPin size={14} />
            </button>
          </div>
        </div>

        {/* Search button */}
        <button
          onClick={onRouteSearch}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 text-xs md:text-sm font-medium transition-colors mt-1"
        >
          Chỉ đường
        </button>
      </div>
    </div>
  );
};

export default DirectionSidebar;
