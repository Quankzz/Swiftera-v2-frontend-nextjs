'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import {
  Search,
  Navigation2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  MapIcon,
  X,
} from 'lucide-react';
import { useMapStore } from '@/stores/use-map-store';
import type { Hub } from '@/types/map.types';
import SearchTab from './SearchTab';
import DirectionTab from './DirectionTab';
import RouteInfoPanel from './RouteInfoPanel';

interface MapSidebarProps {
  onRouteSearch: () => void;
  onFlyToHub: (hub: Hub) => void;
  onNavigateToHub: (hub: Hub) => void;
  onGetCurrentLocation: (isStart: boolean) => void;
  onSelectRoute: (index: number) => void;
  onClearRoute: () => void;
}

const SIDEBAR_W = 380;

const MapSidebar: React.FC<MapSidebarProps> = ({
  onRouteSearch,
  onFlyToHub,
  onNavigateToHub,
  onGetCurrentLocation,
  onSelectRoute,
  onClearRoute,
}) => {
  const { isSidebarOpen, setIsSidebarOpen, activeTab, setActiveTab } =
    useMapStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Tab header (shared) ───────────────────────────────────────────────────
  const tabBar = (
    <div className="flex flex-shrink-0 bg-white dark:bg-slate-900 border-b-2 border-slate-100 dark:border-slate-800">
      <button
        onClick={() => setActiveTab('search')}
        className={`flex flex-1 items-center justify-center gap-2 py-4 text-xs font-bold tracking-widest uppercase transition-all border-b-2 -mb-0.5 ${
          activeTab === 'search'
            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30'
            : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }`}
      >
        <Search size={14} strokeWidth={2.5} />
        Tra cứu
      </button>
      <div className="w-px bg-slate-100 dark:bg-slate-800 my-3" />
      <button
        onClick={() => setActiveTab('direction')}
        className={`flex flex-1 items-center justify-center gap-2 py-4 text-xs font-bold tracking-widest uppercase transition-all border-b-2 -mb-0.5 ${
          activeTab === 'direction'
            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30'
            : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }`}
      >
        <Navigation2 size={14} strokeWidth={2.5} />
        Tìm đường
      </button>
    </div>
  );

  // ── Tab content (shared) ──────────────────────────────────────────────────
  const tabContent = (
    <div className="flex-1 overflow-hidden relative min-h-0">
      {/* Search tab */}
      <div
        className={`absolute inset-0 flex flex-col transition-all duration-300 ease-in-out ${
          activeTab === 'search'
            ? 'opacity-100 translate-x-0 pointer-events-auto'
            : 'opacity-0 -translate-x-4 pointer-events-none'
        }`}
      >
        <SearchTab onFlyToHub={onFlyToHub} onNavigateToHub={onNavigateToHub} />
      </div>

      {/* Direction tab */}
      <div
        className={`absolute inset-0 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          activeTab === 'direction'
            ? 'opacity-100 translate-x-0 pointer-events-auto'
            : 'opacity-0 translate-x-4 pointer-events-none'
        }`}
      >
        <DirectionTab
          onRouteSearch={onRouteSearch}
          onGetCurrentLocation={onGetCurrentLocation}
        />
        <RouteInfoPanel onSelectRoute={onSelectRoute} onClear={onClearRoute} />
      </div>
    </div>
  );

  // ── Mobile: bottom sheet ──────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <div
          className={`fixed bottom-0 left-0 right-0 z-30 flex flex-col bg-white dark:bg-slate-900 rounded-t-3xl shadow-[0_-12px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_-12px_50px_rgba(0,0,0,0.55)] transition-transform duration-350 ease-in-out ${
            isSidebarOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ maxHeight: '85dvh', minHeight: '220px' }}
        >
          {/* Drag handle + close */}
          <div className="flex items-center justify-center pt-3 pb-1 flex-shrink-0 relative">
            <div className="w-10 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              aria-label="Đóng"
            >
              <X size={16} />
            </button>
          </div>

          {tabBar}
          {tabContent}
        </div>

        {/* FAB when sheet is closed */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 pl-4 pr-5 py-3 bg-white dark:bg-slate-800 rounded-full shadow-2xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-100 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
            aria-label="Mở bảng điều khiển"
          >
            <MapIcon
              size={16}
              className="text-emerald-600 dark:text-emerald-400"
            />
            Tra cứu · Tìm đường
            <ChevronUp size={14} className="text-slate-400 ml-0.5" />
          </button>
        )}
      </>
    );
  }

  // ── Desktop / tablet: left panel ──────────────────────────────────────────
  return (
    <>
      <div
        className={`fixed top-0 left-0 h-full z-20 flex transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: `${SIDEBAR_W}px` }}
      >
        {/* Panel body — full height flex column */}
        <div className="flex flex-col h-full flex-1 bg-white dark:bg-slate-900 shadow-[4px_0_32px_rgba(0,0,0,0.10)] dark:shadow-[4px_0_32px_rgba(0,0,0,0.4)] border-r border-slate-200 dark:border-slate-800">
          {/* Branding strip */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0 bg-linear-to-r from-emerald-600 to-emerald-500">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <MapIcon size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">
                Swiftera Hub Map
              </p>
              <p className="text-emerald-100 text-[11px]">Tìm hub gần bạn</p>
            </div>
          </div>

          {tabBar}
          {tabContent}
        </div>

        {/* Collapse tab on right edge */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Đóng bảng"
          className="flex flex-col items-center justify-center gap-1 self-center w-7 h-20 bg-white dark:bg-slate-900 shadow-lg rounded-r-2xl text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border border-l-0 border-slate-200 dark:border-slate-800 flex-shrink-0"
        >
          <ChevronLeft size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* Ghost open tab when panel is closed */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Mở bảng điều khiển"
          className="fixed left-0 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center gap-1 w-7 h-20 bg-white dark:bg-slate-900 shadow-xl rounded-r-2xl text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all hover:w-8 border border-l-0 border-slate-200 dark:border-slate-800"
        >
          <ChevronRight size={14} strokeWidth={2.5} />
        </button>
      )}
    </>
  );
};

export default MapSidebar;
