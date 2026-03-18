'use client';

import type React from 'react';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  RotateCcw,
  Route,
} from 'lucide-react';
import { useMapStore } from '@/stores/use-map-store';

interface RouteInfoPanelProps {
  onSelectRoute: (index: number) => void;
  onClear: () => void;
}

const RouteInfoPanel: React.FC<RouteInfoPanelProps> = ({
  onSelectRoute,
  onClear,
}) => {
  const {
    routeInfoList,
    selectedRouteIndex,
    isRouteInfoVisible,
    setIsRouteInfoVisible,
    isRouteLoading,
  } = useMapStore();

  // Loading skeleton
  if (isRouteLoading) {
    return (
      <div className="flex flex-col flex-1 min-h-0 border-t-2 border-slate-100 dark:border-slate-800 p-4 gap-3">
        <div className="animate-pulse">
          {/* Summary card skeleton */}
          <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/30 p-4 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full bg-blue-200 dark:bg-blue-800" />
              <div className="h-5 bg-blue-200 dark:bg-blue-800 rounded-lg w-28" />
              <div className="h-4 bg-blue-100 dark:bg-blue-900 rounded-lg w-16" />
            </div>
            <div className="h-3 bg-blue-100 dark:bg-blue-900 rounded w-3/5" />
          </div>
          {/* Step skeletons */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex gap-3 px-1 py-2.5 border-b border-slate-50 dark:border-slate-800/60"
            >
              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
              <div className="flex-1 space-y-1.5 pt-0.5">
                <div
                  className={`h-3.5 bg-slate-200 dark:bg-slate-700 rounded ${i === 1 ? 'w-4/5' : 'w-full'}`}
                />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (routeInfoList.length === 0) return null;

  const selected = routeInfoList[selectedRouteIndex];
  const hasAlternatives = routeInfoList.length > 1;

  return (
    <div className="flex flex-col flex-1 min-h-0 border-t border-slate-100 dark:border-slate-800/80">
      {/* Summary card */}
      <div className="mx-5 mt-5 mb-4 shrink-0">
        <div className="p-4 bg-linear-to-br from-sky-50 to-white dark:from-slate-800 dark:to-slate-800/80 rounded-[20px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.3)] border border-sky-100/80 dark:border-slate-700/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100/30 dark:bg-sky-900/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2.5 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Clock
                    size={16}
                    strokeWidth={2.5}
                    className="text-sky-600 dark:text-sky-400 shrink-0"
                  />
                  <span className="font-extrabold text-[22px] text-sky-700 dark:text-sky-300 leading-tight tabular-nums tracking-tight">
                    {selected.duration}
                  </span>
                </div>
                <span className="text-[15px] font-semibold text-slate-500 dark:text-slate-400">
                  · {selected.distance}
                </span>
              </div>
              {selected.summary && (
                <p className="text-[13px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-2 bg-white/50 dark:bg-slate-900/50 w-fit px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700/50">
                  <Route
                    size={12}
                    strokeWidth={2.2}
                    className="shrink-0 text-slate-400"
                  />
                  <span className="truncate font-medium">
                    {selected.summary}
                  </span>
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onClear}
                title="Xóa tuyến đường"
                className="
                  p-2.5 rounded-xl
                  bg-white dark:bg-slate-700
                  hover:bg-red-50 dark:hover:bg-red-900/30
                  text-slate-400 hover:text-red-500
                  border border-slate-200/80 dark:border-slate-600
                  shadow-sm transition-all duration-200 active:scale-90
                "
              >
                <RotateCcw size={14} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => setIsRouteInfoVisible(!isRouteInfoVisible)}
                title={isRouteInfoVisible ? 'Thu gọn' : 'Xem chi tiết'}
                className="
                  p-2.5 rounded-xl
                  bg-white dark:bg-slate-700
                  hover:bg-sky-50 dark:hover:bg-sky-900/30
                  text-slate-400 hover:text-sky-600 dark:hover:text-sky-400
                  border border-slate-200/80 dark:border-slate-600
                  shadow-sm transition-all duration-200 active:scale-90
                "
              >
                {isRouteInfoVisible ? (
                  <ChevronUp size={14} strokeWidth={2.5} />
                ) : (
                  <ChevronDown size={14} strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Route alternatives tabs */}
      {hasAlternatives && (
        <div className="flex gap-2.5 px-5 pb-4 overflow-x-auto [scrollbar-width:none] shrink-0">
          {routeInfoList.map((route, idx) => {
            const isActive = idx === selectedRouteIndex;
            return (
              <button
                key={idx}
                onClick={() => onSelectRoute(idx)}
                className={`
                  shrink-0 px-4 py-2.5 rounded-[14px] text-[13px] font-bold transition-all duration-300 active:scale-95
                  ${
                    isActive
                      ? 'bg-sky-500 dark:bg-sky-600 text-white shadow-[0_4px_12px_rgb(14,165,233,0.3)] dark:shadow-[0_4px_12px_rgb(14,165,233,0.2)] ring-2 ring-sky-500/20 ring-offset-1 dark:ring-offset-slate-900'
                      : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-700 hover:text-sky-600 dark:hover:text-sky-400 shadow-sm'
                  }
                `}
              >
                Tuyến {idx + 1} <span className="opacity-60 ml-1">·</span>{' '}
                <span className="ml-1">{route.duration}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Step-by-step directions */}
      {isRouteInfoVisible && (
        <div className="flex-1 overflow-y-auto min-h-0 pb-4 [scrollbar-width:thin] px-2">
          <div className="border border-slate-100 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm mx-3 rounded-[20px] overflow-hidden shadow-sm">
            {selected.steps.map((step, idx) => (
              <div
                key={idx}
                className="flex gap-4 px-5 py-4 border-b border-slate-100/60 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors group relative"
              >
                {/* timeline line */}
                <div className="absolute left-8 bottom-0 top-11 w-0.5 bg-slate-100 dark:bg-slate-800" />

                {idx === selected.steps.length - 1 ? (
                  <div className="flex gap-4 items-center relative z-10">
                    <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800/50 flex items-center justify-center shrink-0 shadow-sm">
                      <MapPin
                        size={13}
                        strokeWidth={2.5}
                        className="text-red-500"
                      />
                    </div>
                    <p className="text-[15px] text-slate-800 dark:text-slate-100 font-bold">
                      Đến nơi
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-sky-50 dark:bg-sky-900/30 border border-sky-100 dark:border-sky-800/50 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5 text-xs font-bold shadow-sm relative z-10">
                      {idx + 1}
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5 pb-1">
                      <p className="text-[14px] font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
                        {step.instruction}
                      </p>

                      {(step.distance || step.duration) && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100/80 dark:bg-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
                            {[step.distance, step.duration]
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteInfoPanel;
