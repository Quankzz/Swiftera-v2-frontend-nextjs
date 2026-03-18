'use client';

import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
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

const SIDEBAR_W = 390;
const MOBILE_SHEET_SNAP_POINTS = [52, 72, 92] as const;
const MOBILE_SHEET_MIN = MOBILE_SHEET_SNAP_POINTS[0];
const MOBILE_SHEET_MAX =
  MOBILE_SHEET_SNAP_POINTS[MOBILE_SHEET_SNAP_POINTS.length - 1];

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

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
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [mobileSheetHeight, setMobileSheetHeight] = useState(72);
  const dragStartYRef = useRef(0);
  const dragStartHeightRef = useRef(72);
  const isDraggingRef = useRef(false);
  const velocityRef = useRef(0);
  const lastYRef = useRef(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const snapToNearestPoint = useCallback((height: number, velocity = 0) => {
    // Factor in velocity for momentum snapping (like iOS sheets)
    const projected = height - velocity * 0.08;
    const nearest = MOBILE_SHEET_SNAP_POINTS.reduce((prev, curr) =>
      Math.abs(curr - projected) < Math.abs(prev - projected) ? curr : prev,
    );
    setMobileSheetHeight(nearest);
  }, []);

  const onHandlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      isDraggingRef.current = true;
      dragStartYRef.current = e.clientY;
      dragStartHeightRef.current = mobileSheetHeight;
      lastYRef.current = e.clientY;
      lastTimeRef.current = Date.now();
      velocityRef.current = 0;

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (!isDraggingRef.current) return;
        const now = Date.now();
        const dt = now - lastTimeRef.current;
        if (dt > 0) {
          velocityRef.current =
            ((((moveEvent.clientY - lastYRef.current) / window.innerHeight) *
              100) /
              dt) *
            16;
        }
        lastYRef.current = moveEvent.clientY;
        lastTimeRef.current = now;

        const deltaY = moveEvent.clientY - dragStartYRef.current;
        const deltaVh = (deltaY / window.innerHeight) * 100;
        const nextHeight = clamp(
          dragStartHeightRef.current - deltaVh,
          MOBILE_SHEET_MIN,
          MOBILE_SHEET_MAX,
        );
        setMobileSheetHeight(nextHeight);
      };

      const handlePointerUp = () => {
        if (!isDraggingRef.current) return;
        isDraggingRef.current = false;
        setMobileSheetHeight((current) => {
          const nearest = MOBILE_SHEET_SNAP_POINTS.reduce((prev, curr) =>
            Math.abs(curr - current) < Math.abs(prev - current) ? curr : prev,
          );
          return nearest;
        });
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [mobileSheetHeight],
  );

  // ── Tab header ────────────────────────────────────────────────────────────
  const tabBar = (
    <div className="flex shrink-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/80 p-1.5 gap-1.5 relative z-10">
      {(['search', 'direction'] as const).map((tab) => {
        const isActive = activeTab === tab;
        const Icon = tab === 'search' ? Search : Navigation2;
        const label = tab === 'search' ? 'Tra cứu' : 'Tìm đường';
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              relative flex flex-1 items-center justify-center gap-2 py-2.5 text-[13px] font-bold
              tracking-wide transition-all duration-300 rounded-xl overflow-hidden
              ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-800 shadow-[0_2px_10px_rgb(0,0,0,0.06)] dark:shadow-[0_2px_10px_rgb(0,0,0,0.2)]'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/40'
              }
            `}
          >
            {isActive && (
              <span className="absolute inset-0 bg-emerald-50/50 dark:bg-emerald-900/10" />
            )}
            <Icon size={14} strokeWidth={2.5} className="relative z-10" />
            <span className="relative z-10">{label}</span>
          </button>
        );
      })}
    </div>
  );

  // ── Tab content ───────────────────────────────────────────────────────────
  const tabContent = (
    <div className="flex-1 overflow-hidden relative min-h-0">
      <div
        className={`absolute inset-0 flex flex-col transition-all duration-250 ease-out ${
          activeTab === 'search'
            ? 'opacity-100 translate-x-0 pointer-events-auto'
            : 'opacity-0 -translate-x-3 pointer-events-none'
        }`}
      >
        <SearchTab onFlyToHub={onFlyToHub} onNavigateToHub={onNavigateToHub} />
      </div>

      <div
        className={`absolute inset-0 flex flex-col overflow-y-auto [scrollbar-width:none] transition-all duration-250 ease-out ${
          activeTab === 'direction'
            ? 'opacity-100 translate-x-0 pointer-events-auto'
            : 'opacity-0 translate-x-3 pointer-events-none'
        }`}
      >
        <DirectionTab
          onRouteSearch={onRouteSearch}
          onGetCurrentLocation={onGetCurrentLocation}
          onSuggestionOpenChange={setIsSuggestionOpen}
        />
        {/* Show RouteInfoPanel when suggestions are closed OR when loading
            (skeleton should appear even if user just opened a suggestion list) */}
        {!isSuggestionOpen && (
          <RouteInfoPanel
            onSelectRoute={onSelectRoute}
            onClear={onClearRoute}
          />
        )}
      </div>
    </div>
  );

  // ── Mobile: bottom sheet ──────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <div
          className={`
            fixed bottom-0 left-0 right-0 z-30 flex flex-col
            bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl
            rounded-t-[32px] border-t border-white/20 dark:border-white/5
            shadow-[0_-8px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_40px_rgba(0,0,0,0.6)]
            will-change-transform
            transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
            ${isSidebarOpen ? 'translate-y-0' : 'translate-y-full'}
          `}
          style={{
            height: `${mobileSheetHeight}dvh`,
            minHeight: '200px',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {/* Drag handle */}
          <div
            onPointerDown={onHandlePointerDown}
            onDoubleClick={() => snapToNearestPoint(72)}
            className="flex items-center justify-between px-4 pt-3 pb-1.5 shrink-0 cursor-grab active:cursor-grabbing touch-none select-none"
          >
            {/* Spacer */}
            <div className="w-8" />
            <div className="w-9 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
              aria-label="Đóng"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>

          {tabBar}
          {tabContent}
        </div>

        {/* FAB when sheet is closed */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="
              fixed bottom-24 left-1/2 -translate-x-1/2 z-30
              flex items-center gap-2 pl-4 pr-5 py-3
              bg-white dark:bg-slate-800
              rounded-full shadow-2xl
              border border-slate-200/80 dark:border-slate-700
              text-slate-700 dark:text-slate-100 font-semibold text-sm
              hover:shadow-xl hover:scale-[1.02] active:scale-95
              transition-all duration-200
            "
            aria-label="Mở bảng điều khiển"
          >
            <MapIcon size={15} className="text-emerald-500" />
            <span>Tra cứu · Tìm đường</span>
            <ChevronUp size={13} className="text-slate-400" />
          </button>
        )}
      </>
    );
  }

  // ── Desktop: left panel ───────────────────────────────────────────────────
  return (
    <>
      <div
        className={`
          fixed top-0 left-0 h-full z-20 flex
          transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ width: `${SIDEBAR_W}px` }}
      >
        {/* Panel body */}
        <div className="flex flex-col h-full flex-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-[4px_0_32px_rgba(0,0,0,0.1)] dark:shadow-[4px_0_32px_rgba(0,0,0,0.5)] border-r border-slate-200/60 dark:border-slate-800/80">
          {/* Branding strip */}
          <div className="flex items-center gap-3 px-5 py-4 shrink-0 bg-linear-to-r from-emerald-600 via-emerald-500 to-teal-500 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md shadow-inner relative z-10 border border-white/20">
              <MapIcon size={18} className="text-white drop-shadow-sm" />
            </div>
            <div className="relative z-10">
              <p className="text-white font-extrabold text-[15px] leading-tight tracking-tight drop-shadow-sm">
                Swiftera Hub Map
              </p>
              <p className="text-emerald-50 text-[12px] mt-0.5 font-medium opacity-90">
                Khám phá & Tìm đường thông minh
              </p>
            </div>
          </div>

          {tabBar}
          {tabContent}
        </div>

        {/* Collapse tab */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Đóng bảng"
          className="
            flex flex-col items-center justify-center self-center
            w-6 h-16
            bg-white dark:bg-slate-900
            shadow-[2px_0_12px_rgba(0,0,0,0.1)]
            rounded-r-xl text-slate-400
            hover:text-emerald-600 dark:hover:text-emerald-400
             transition-all duration-150
            border border-l-0 border-slate-200 dark:border-slate-800 shrink-0
          "
        >
          <ChevronLeft size={13} strokeWidth={2.5} />
        </button>
      </div>

      {/* Open ghost tab when closed */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Mở bảng điều khiển"
          className="
            fixed left-0 top-1/2 -translate-y-1/2 z-20
            flex flex-col items-center justify-center
            w-6 h-16
            bg-emerald-500 dark:bg-slate-800
            shadow-lg rounded-r-xl text-white
            hover:w-8 hover:bg-emerald-600
            transition-all duration-150
            border border-l-0 border-emerald-400 dark:border-slate-700
          "
        >
          <ChevronRight size={13} strokeWidth={2.5} />
        </button>
      )}
    </>
  );
};

export default MapSidebar;
