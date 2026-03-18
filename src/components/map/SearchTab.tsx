'use client';

import type React from 'react';
import { useState, useMemo } from 'react';
import {
  Search,
  Navigation,
  Package,
  MapPin,
  RadioTower,
  X,
} from 'lucide-react';
import { useMapStore } from '@/stores/use-map-store';
import { MOCK_HUBS } from '@/data/mockHubs';
import type { Hub } from '@/types/map.types';

interface SearchTabProps {
  onFlyToHub: (hub: Hub) => void;
  onNavigateToHub: (hub: Hub) => void;
}

const SearchTab: React.FC<SearchTabProps> = ({
  onFlyToHub,
  onNavigateToHub,
}) => {
  const {
    searchQuery,
    setSearchQuery,
    nearbyHubs,
    openHubModal,
    userLocation,
  } = useMapStore();
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);

  const hasLocation = !!userLocation;

  // Derived: filter results from query or nearby toggle
  const results = useMemo(() => {
    if (showNearbyOnly) {
      return MOCK_HUBS.filter((h) => nearbyHubs.some((n) => n.id === h.id));
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) return MOCK_HUBS;
    return MOCK_HUBS.filter(
      (h) =>
        h.name.toLowerCase().includes(q) || h.address.toLowerCase().includes(q),
    );
  }, [searchQuery, showNearbyOnly, nearbyHubs]);

  const handleClearQuery = () => setSearchQuery('');

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="px-5 pt-5 pb-3 shrink-0 space-y-4">
        <div className="flex items-center gap-3">
          {/* Input */}
          <div className="relative flex-1 group">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors pointer-events-none"
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm hub, địa chỉ..."
              className="
                w-full pl-10 pr-10 py-3
                bg-slate-50 dark:bg-slate-800/60
                border border-slate-200/60 dark:border-slate-700/60
                rounded-2xl text-[14px] font-medium outline-none
                focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 focus:border-transparent
                dark:text-white placeholder-slate-400
                transition-all duration-300 shadow-[0_2px_10px_rgb(0,0,0,0.02)]
              "
            />
            {searchQuery && (
              <button
                onClick={handleClearQuery}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-200/80 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors active:scale-90"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* Nearby filter — only shown when location is available */}
          {hasLocation && (
            <button
              onClick={() => setShowNearbyOnly((v) => !v)}
              title={showNearbyOnly ? 'Hiển thị tất cả hub' : 'Chỉ hub gần đây'}
              className={`
                shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl border
                transition-all duration-300 active:scale-90
                ${
                  showNearbyOnly
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_4px_12px_rgb(16,185,129,0.3)] dark:shadow-[0_4px_12px_rgb(16,185,129,0.2)]'
                    : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-500 hover:border-emerald-300 dark:hover:border-emerald-700/60 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-[0_2px_10px_rgb(0,0,0,0.02)]'
                }
              `}
            >
              <RadioTower size={18} strokeWidth={showNearbyOnly ? 2.5 : 2} />
            </button>
          )}
        </div>

        {/* Status row */}
        <div className="flex items-center justify-between px-0.5">
          {showNearbyOnly ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <MapPin size={11} />
              {results.length} hub gần bạn
            </span>
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {results.length} hub
            </span>
          )}
          {!hasLocation && (
            <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
              Bật vị trí để lọc gần đây
            </span>
          )}
        </div>
      </div>

      {/* Hub list */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3 [scrollbar-width:thin]">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-center mb-4 shadow-sm">
              <RadioTower size={24} className="text-slate-400 dark:text-slate-500 opacity-60" />
            </div>
            <p className="text-[15px] font-semibold text-slate-600 dark:text-slate-300">
              Không tìm thấy hub
            </p>
            <p className="text-[13px] mt-1 text-slate-400">
              Thử thay đổi từ khoá hoặc bỏ lọc
            </p>
          </div>
        ) : (
          results.map((hub) => {
            const nearby = nearbyHubs.find((n) => n.id === hub.id);
            const availabilityRatio = hub.availableProducts / hub.totalProducts;
            const availColor =
              availabilityRatio > 0.5
                ? 'bg-emerald-500'
                : availabilityRatio > 0.2
                  ? 'bg-amber-500'
                  : 'bg-red-400';

            return (
              <HubCard
                key={hub.id}
                hub={hub}
                nearby={nearby}
                availColor={availColor}
                onFly={() => onFlyToHub(hub)}
                onOpenModal={() => openHubModal(hub)}
                onNavigate={() => onNavigateToHub(hub)}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

// ── Sub-component: Hub Card ────────────────────────────────────────────────────
interface HubCardProps {
  hub: Hub;
  nearby?: { distance: number };
  availColor: string;
  onFly: () => void;
  onOpenModal: (e: React.MouseEvent) => void;
  onNavigate: (e: React.MouseEvent) => void;
}

const HubCard: React.FC<HubCardProps> = ({
  hub,
  nearby,
  availColor,
  onFly,
  onOpenModal,
  onNavigate,
}) => (
  <div
    onClick={onFly}
    className="
      group p-4 rounded-[20px] cursor-pointer
      bg-white dark:bg-slate-800/80
      border border-slate-200/60 dark:border-slate-700/50
      hover:border-emerald-300 dark:hover:border-emerald-600/50
      hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]
      shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all duration-300
    "
  >
    {/* Header */}
    <div className="flex items-start gap-3.5 mb-4">
      <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/30 flex items-center justify-center shrink-0">
        <Package size={18} strokeWidth={2.2} className="text-emerald-600 dark:text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <h3 className="font-bold text-[15px] text-slate-800 dark:text-slate-100 leading-tight truncate">
          {hub.name}
        </h3>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 truncate">
          {hub.address}
        </p>
      </div>
      {/* Stats */}
      <div className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
        <span
          className={`text-[11px] font-bold text-white px-2.5 py-1 rounded-full shadow-sm ${availColor}`}
        >
          {hub.availableProducts} còn
        </span>
        {nearby && (
          <span className="text-[12px] text-sky-500 dark:text-sky-400 font-semibold tabular-nums mt-0.5">
            {nearby.distance.toFixed(1)} km
          </span>
        )}
      </div>
    </div>

    {/* Action buttons */}
    <div className="flex gap-2.5">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenModal(e);
        }}
        className="
          flex flex-1 items-center justify-center gap-1.5
          text-[13px] font-semibold px-3 py-2.5 rounded-xl
          bg-slate-50 dark:bg-slate-700/50 border border-slate-200/80 dark:border-slate-600/50
          text-slate-600 dark:text-slate-300
          hover:border-emerald-300 dark:hover:border-emerald-700/60
          hover:text-emerald-600 dark:hover:text-emerald-400 
          hover:bg-white dark:hover:bg-slate-700
          transition-all duration-200 active:scale-95
        "
      >
        <Package size={14} strokeWidth={2.5} />
        Sản phẩm
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNavigate(e);
        }}
        className="
          flex flex-1 items-center justify-center gap-1.5
          text-[13px] font-bold px-3 py-2.5 rounded-xl
          bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700
          text-white shadow-[0_4px_12px_rgb(16,185,129,0.25)] dark:shadow-[0_4px_12px_rgb(16,185,129,0.15)]
          transition-all duration-200 active:scale-95
        "
      >
        <Navigation size={14} strokeWidth={2.5} />
        Chỉ đường
      </button>
    </div>
  </div>
);

export default SearchTab;
