'use client';

import type React from 'react';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Milestone,
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
  } = useMapStore();

  if (routeInfoList.length === 0) return null;

  const selected = routeInfoList[selectedRouteIndex];

  return (
    <div className="flex flex-col flex-1 min-h-0 border-t-2 border-slate-100 dark:border-slate-800">
      {/* Summary card */}
      <div className="mx-4 mt-4 mb-3 p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900/50 flex-shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Clock
                size={15}
                className="text-blue-600 dark:text-blue-400 flex-shrink-0"
              />
              <span className="font-bold text-lg text-blue-700 dark:text-blue-300 leading-tight">
                {selected.duration}
              </span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                · {selected.distance}
              </span>
            </div>
            {selected.summary && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                <Route size={11} className="flex-shrink-0" />
                {selected.summary}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={onClear}
              title="Xóa tuyến đường"
              className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-500 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <RotateCcw size={13} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => setIsRouteInfoVisible(!isRouteInfoVisible)}
              title={isRouteInfoVisible ? 'Thu gọn' : 'Xem chi tiết'}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-600 transition-colors border border-slate-200 dark:border-slate-700"
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

      {/* Route alternative tabs */}
      {routeInfoList.length > 1 && (
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none flex-shrink-0">
          {routeInfoList.map((route, idx) => (
            <button
              key={idx}
              onClick={() => onSelectRoute(idx)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                idx === selectedRouteIndex
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200/50 dark:shadow-blue-900/40'
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              Tuyến {idx + 1} · {route.duration}
            </button>
          ))}
        </div>
      )}

      {/* Step-by-step directions — only this section scrolls */}
      {isRouteInfoVisible && (
        <div className="flex-1 overflow-y-auto border-t border-slate-100 dark:border-slate-800 pb-2 min-h-0">
          {selected.steps.map((step, idx) => (
            <div
              key={idx}
              className="flex gap-3 px-4 py-3 border-b border-slate-50 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5 text-xs font-bold">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  {step.instruction}
                </p>
                {(step.distance || step.duration) && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                    <Milestone size={10} className="flex-shrink-0" />
                    {[step.distance, step.duration].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Destination row */}
          <div className="flex gap-3 px-4 py-3 bg-red-50 dark:bg-red-950/20">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/40 flex-shrink-0">
              <MapPin size={13} className="text-red-500" />
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-200 font-bold self-center">
              Đến nơi
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteInfoPanel;
