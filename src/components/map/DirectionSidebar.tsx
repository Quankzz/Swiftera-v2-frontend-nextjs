'use client';
// NOTE: DirectionSidebar is a legacy overlay used on mobile maps outside the sidebar context.
// Most direction logic has been consolidated into DirectionTab + MapSidebar.
// This component is kept for backward compatibility.

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
    <div className="absolute top-2 left-2 z-10 md:w-80 w-64 bg-card rounded-2xl shadow-xl overflow-hidden border border-border">
      {/* Header */}
      <div className="bg-gradient-to-r from-theme-primary-start to-theme-primary-end px-4 py-3 flex items-center gap-2">
        <Navigation size={15} className="text-white" />
        <h2 className="text-white font-semibold text-sm">Tìm đường</h2>
      </div>

      {/* Inputs */}
      <div className="p-3 space-y-2">
        {/* Start input */}
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-theme-primary-start shrink-0" />
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
              className="
                w-full border border-border
                bg-muted/40 text-foreground
                rounded-xl px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-theme-primary-start/50
                pr-8 transition-all
              "
            />
            <button
              title="Dùng vị trí hiện tại làm điểm xuất phát"
              onClick={() =>
                useMapStore.setState({ currentLocationUsage: 'start' })
              }
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-theme-primary-start hover:text-theme-primary-start/80 transition-colors"
            >
              <MapPin size={14} />
            </button>
          </div>
        </div>

        {/* Connector */}
        <div className="ml-1 flex flex-col gap-1 pl-0.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-0.5 h-0.5 rounded-full bg-muted-foreground/30"
            />
          ))}
        </div>

        {/* End input */}
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-destructive shrink-0" />
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
              className="
                w-full border border-border
                bg-muted/40 text-foreground
                rounded-xl px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-destructive/50
                pr-8 transition-all
              "
            />
            <button
              title="Dùng vị trí hiện tại làm điểm đến"
              onClick={() =>
                useMapStore.setState({ currentLocationUsage: 'end' })
              }
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-destructive hover:text-destructive/80 transition-colors"
            >
              <MapPin size={14} />
            </button>
          </div>
        </div>

        {/* Search button */}
        <button
          onClick={onRouteSearch}
          className="
            w-full bg-gradient-to-r from-theme-primary-start to-theme-primary-end hover:brightness-110 active:scale-95
            text-white rounded-xl py-2.5 text-sm font-semibold
            transition-all duration-150 shadow-sm shadow-theme-primary-start/20
          "
        >
          Chỉ đường
        </button>
      </div>
    </div>
  );
};

export default DirectionSidebar;
