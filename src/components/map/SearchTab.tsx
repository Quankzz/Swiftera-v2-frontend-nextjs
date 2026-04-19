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
  SlidersHorizontal,
} from 'lucide-react';
import { useMapStore } from '@/stores/use-map-store';
// import { MOCK_HUBS } from '@/data/mockHubs';
import type { Hub } from '@/types/map.types';

interface SearchTabProps {
  onFlyToHub: (hub: Hub) => void;
  onNavigateToHub: (hub: Hub) => void;
}

const RADIUS_MARKS = [5, 10, 20, 30, 50];

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
    hubs,
  } = useMapStore();
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);
  const [nearbyRadius, setNearbyRadius] = useState(10);

  const hasLocation = !!userLocation;

  const results = useMemo(() => {
    const baseHubs = nearbyHubs.length > 0 ? nearbyHubs : hubs;

    let filtered = baseHubs;

    if (showNearbyOnly) {
      filtered = filtered.filter((h) => {
        const distance = nearbyHubs.find(
          (n) => n.hub_id === h.hub_id,
        )?.distance;
        return distance !== undefined && distance <= nearbyRadius;
      });
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q),
      );
    }

    return filtered;
  }, [searchQuery, showNearbyOnly, nearbyRadius, nearbyHubs, hubs]);

  const handleClearQuery = () => setSearchQuery('');

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="px-5 pt-5 pb-3 shrink-0 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 group">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-theme-primary-start transition-colors pointer-events-none"
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm hub, địa chỉ..."
              className="
                w-full pl-10 pr-10 py-3
                bg-muted/40
                border border-border/50
                rounded-2xl text-[14px] font-medium outline-none
                focus:bg-card focus:ring-2 focus:ring-theme-primary-start/20 focus:border-transparent
                text-foreground placeholder-muted-foreground
                transition-all duration-300 shadow-[0_2px_10px_rgb(0,0,0,0.02)]
              "
            />
            {searchQuery && (
              <button
                onClick={handleClearQuery}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors active:scale-90"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {hasLocation && (
            <button
              onClick={() => setShowNearbyOnly((v) => !v)}
              title={showNearbyOnly ? 'Hiện tất cả hub' : 'Lọc hub gần đây'}
              className={`
                shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl border
                transition-all duration-300 active:scale-90
                ${
                  showNearbyOnly
                    ? 'bg-theme-primary-start border-theme-primary-start text-white shadow-[0_4px_12px_rgb(0,0,0,0.15)]'
                    : 'bg-card border-border/50 text-muted-foreground hover:border-theme-primary-start/50 hover:text-theme-primary-start shadow-[0_2px_10px_rgb(0,0,0,0.02)]'
                }
              `}
            >
              <RadioTower size={18} strokeWidth={showNearbyOnly ? 2.5 : 2} />
            </button>
          )}
        </div>

        {/* Radius slider - shown only when "nearby" filter is active */}
        {showNearbyOnly && hasLocation && (
          <div className="rounded-2xl border border-theme-primary-start/20 bg-theme-primary-start/5 px-4 py-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-theme-primary-start">
                <SlidersHorizontal size={12} />
                Bán kính tìm kiếm
              </div>
              <span className="text-sm font-black text-theme-primary-start tabular-nums">
                {nearbyRadius} km
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              step={1}
              value={nearbyRadius}
              onChange={(e) => setNearbyRadius(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                bg-theme-primary-start/20
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:size-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-theme-primary-start
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-white
                [&::-webkit-slider-thumb]:shadow-md
                [&::-webkit-slider-thumb]:transition-transform
                [&::-webkit-slider-thumb]:hover:scale-125
                [&::-moz-range-thumb]:size-4
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-theme-primary-start
                [&::-moz-range-thumb]:border-2
                [&::-moz-range-thumb]:border-white
                [&::-moz-range-thumb]:shadow-md"
              style={{
                background: `linear-gradient(to right, var(--theme-primary-start, #6366f1) ${((nearbyRadius - 1) / 49) * 100}%, rgba(99,102,241,0.2) ${((nearbyRadius - 1) / 49) * 100}%)`,
              }}
            />
            {/* Quick-pick marks */}
            <div className="flex justify-between">
              {RADIUS_MARKS.map((mark) => (
                <button
                  key={mark}
                  onClick={() => setNearbyRadius(mark)}
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-all ${
                    nearbyRadius === mark
                      ? 'bg-theme-primary-start text-white'
                      : 'text-muted-foreground hover:text-theme-primary-start'
                  }`}
                >
                  {mark}km
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Status row */}
        <div className="flex items-center justify-between px-0.5">
          {showNearbyOnly ? (
            <span className="flex items-center gap-1.5 text-xs text-theme-primary-start font-semibold">
              <MapPin size={11} />
              {results.length} hub trong {nearbyRadius} km
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              {results.length} hub
            </span>
          )}
          {!hasLocation && (
            <span className="text-[11px] text-muted-foreground italic">
              Bật vị trí để lọc gần đây
            </span>
          )}
        </div>
      </div>

      {/* Hub list */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3 [scrollbar-width:thin]">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center mb-4 shadow-sm">
              <RadioTower
                size={24}
                className="text-muted-foreground opacity-60"
              />
            </div>
            <p className="text-[15px] font-semibold text-foreground">
              Không tìm thấy hub
            </p>
            <p className="text-[13px] mt-1 text-muted-foreground">
              Thử thay đổi từ khoá hoặc bỏ lọc
            </p>
          </div>
        ) : (
          results.map((hub) => {
            const nearby = nearbyHubs.find((n) => n.hub_id === hub.hub_id);

            return (
              <HubCard
                key={hub.hub_id}
                hub={hub}
                nearby={nearby}
                onFly={() => {
                  onFlyToHub(hub);
                  openHubModal(hub);
                }}
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
  onFly: () => void;
  onOpenModal: () => void;
  onNavigate: () => void;
}

const HubCard: React.FC<HubCardProps> = ({
  hub,
  nearby,
  onFly,
  onOpenModal,
  onNavigate,
}) => (
  <div
    onClick={onFly}
    className="
      group p-4 rounded-[20px] cursor-pointer
      bg-card
      border border-border/50
      hover:border-theme-primary-start/30
      hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]
      shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all duration-300
    "
  >
    {/* Header */}
    <div className="flex items-start gap-3.5 mb-4">
      <div className="w-10 h-10 bg-theme-primary-start/10 rounded-2xl border border-theme-primary-start/20 flex items-center justify-center shrink-0">
        <Package
          size={18}
          strokeWidth={2.2}
          className="text-theme-primary-start"
        />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <h3 className="font-bold text-[15px] text-foreground leading-tight truncate">
          {hub.name}
        </h3>
        {hub.code && (
          <span className="text-[11px] font-mono font-bold text-muted-foreground/70">
            {hub.code}
          </span>
        )}
        <p className="text-[13px] text-muted-foreground mt-0.5 truncate">
          {hub.address}
        </p>
      </div>
      {/* Stats */}
      <div className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
        {nearby && (
          <span className="text-[12px] text-info font-semibold tabular-nums mt-0.5">
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
          onOpenModal();
        }}
        className="
          flex flex-1 items-center justify-center gap-1.5
          text-[13px] font-semibold px-3 py-2.5 rounded-xl
          bg-muted/40 border border-border/50
          text-muted-foreground
          hover:border-theme-primary-start/40
          hover:text-theme-primary-start
          hover:bg-card
          transition-all duration-200 active:scale-95
        "
      >
        <Package size={14} strokeWidth={2.5} />
        Sản phẩm
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNavigate();
        }}
        className="
          flex flex-1 items-center justify-center gap-1.5
          text-[13px] font-bold px-3 py-2.5 rounded-xl
          bg-linear-to-r from-theme-primary-start to-theme-primary-end hover:brightness-110
          text-white shadow-sm
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
