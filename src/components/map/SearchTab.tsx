'use client';

import type React from 'react';
import { useState } from 'react';
import { Search, Navigation, Package, MapPin, RadioTower } from 'lucide-react';
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

  const filtered = searchQuery.trim()
    ? MOCK_HUBS.filter(
        (h) =>
          h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.address.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : MOCK_HUBS;

  const results = showNearbyOnly
    ? MOCK_HUBS.filter((h) => nearbyHubs.some((n) => n.id === h.id))
    : filtered;

  const hasLocation = !!userLocation;

  return (
    <div className="flex flex-col h-full">
      {/* Search bar + nearby toggle */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tên hub, địa chỉ..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400 dark:text-white placeholder-slate-400 transition-all"
            />
          </div>
          {hasLocation && (
            <button
              onClick={() => setShowNearbyOnly((v) => !v)}
              title={showNearbyOnly ? 'Hiển thị tất cả hub' : 'Chỉ hub gần đây'}
              className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl border-2 transition-all ${
                showNearbyOnly
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/50'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-emerald-400 hover:text-emerald-500'
              }`}
            >
              <RadioTower size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="px-4 pb-2.5 flex-shrink-0 flex items-center justify-between">
        {showNearbyOnly ? (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
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

      {/* Hub list */}
      <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-2">
        {results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-600">
            <RadioTower size={32} className="mb-3 opacity-50" />
            <p className="text-sm font-medium">Không tìm thấy hub</p>
            <p className="text-xs mt-1">Thử thay đổi từ khoá hoặc bỏ lọc</p>
          </div>
        )}
        {results.map((hub) => {
          const nearby = nearbyHubs.find((n) => n.id === hub.id);
          return (
            <div
              key={hub.id}
              onClick={() => onFlyToHub(hub)}
              className="p-4 rounded-2xl cursor-pointer bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md dark:hover:shadow-emerald-950/30 shadow-sm transition-all"
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Package
                      size={14}
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-tight">
                      {hub.name}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                      {hub.address}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-xs font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                    {hub.availableProducts} còn
                  </span>
                  {nearby && (
                    <span className="text-[11px] text-blue-500 dark:text-blue-400 font-semibold">
                      {nearby.distance.toFixed(1)} km
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openHubModal(hub);
                  }}
                  className="flex flex-1 items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border-2 border-emerald-200 dark:border-emerald-700/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                >
                  <Package size={12} />
                  Sản phẩm
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToHub(hub);
                  }}
                  className="flex flex-1 items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white transition-colors shadow-sm"
                >
                  <Navigation size={12} />
                  Chỉ đường
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SearchTab;
