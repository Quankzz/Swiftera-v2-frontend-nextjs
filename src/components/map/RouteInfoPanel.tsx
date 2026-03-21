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

const RouteInfoPanel: React.FC<RouteInfoPanelProps> = ({ onClear }) => {
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
      <div className="flex flex-col flex-1 min-h-0 border-t-2 border-border p-4 gap-3">
        <div className="animate-pulse">
          <div className="rounded-2xl bg-info-muted p-4 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full bg-info/30" />
              <div className="h-5 bg-info/30 rounded-lg w-28" />
              <div className="h-4 bg-info/20 rounded-lg w-16" />
            </div>
            <div className="h-3 bg-info/20 rounded w-3/5" />
          </div>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex gap-3 px-1 py-2.5 border-b border-border/30"
            >
              <div className="w-7 h-7 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-1.5 pt-0.5">
                <div
                  className={`h-3.5 bg-muted rounded ${i === 1 ? 'w-4/5' : 'w-full'}`}
                />
                <div className="h-3 bg-muted/60 rounded w-2/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (routeInfoList.length === 0) return null;

  const selected = routeInfoList[selectedRouteIndex];

  return (
    <div className="flex flex-col flex-1 min-h-0 border-t border-border">
      {/* Summary card */}
      <div className="mx-5 mt-5 mb-4 shrink-0">
        <div className="p-4 bg-gradient-to-br from-info-muted to-card rounded-[20px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.3)] border border-info-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-info/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2.5 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Clock
                    size={16}
                    strokeWidth={2.5}
                    className="text-info shrink-0"
                  />
                  <span className="font-extrabold text-[22px] text-info leading-tight tabular-nums tracking-tight">
                    {selected.duration}
                  </span>
                </div>
              </div>
              {selected.summary && (
                <p className="text-muted-foreground flex items-center gap-1.5 mt-2 bg-card/50 w-fit px-2.5 py-1 rounded-lg border border-border/50">
                  <Route
                    size={12}
                    strokeWidth={2.2}
                    className="shrink-0 text-muted-foreground"
                  />
                  <span className="text-xl font-semibold text-muted-foreground">
                    {selected.distance}
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
                  bg-card
                  hover:bg-destructive/10
                  text-muted-foreground hover:text-destructive
                  border border-border/50
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
                  bg-card
                  hover:bg-info-muted
                  text-muted-foreground hover:text-info
                  border border-border/50
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

      {/* Step-by-step directions */}
      {isRouteInfoVisible && (
        <div className="flex-1 overflow-y-auto min-h-0 pb-4 [scrollbar-width:thin] px-2">
          <div className="border border-border/50 bg-card/50 backdrop-blur-sm mx-3 rounded-[20px] overflow-hidden shadow-sm">
            {selected.steps.map((step, idx) => (
              <div
                key={idx}
                className="flex gap-4 px-5 py-4 border-b border-border/30 hover:bg-accent/50 transition-colors group relative"
              >
                {/* timeline line */}
                <div className="absolute left-8 bottom-0 top-11 w-0.5 bg-border/50" />

                {idx === selected.steps.length - 1 ? (
                  <div className="flex gap-4 items-center relative z-10">
                    <div className="w-7 h-7 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0 shadow-sm">
                      <MapPin
                        size={13}
                        strokeWidth={2.5}
                        className="text-destructive"
                      />
                    </div>
                    <p className="text-[15px] text-foreground font-bold">
                      Đến nơi
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-info-muted border border-info-border text-info shrink-0 mt-0.5 text-xs font-bold shadow-sm relative z-10">
                      {idx + 1}
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5 pb-1">
                      <p className="text-[14px] font-medium text-foreground leading-relaxed">
                        {step.instruction}
                      </p>

                      {(step.distance || step.duration) && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-muted/80 text-[11px] font-semibold text-muted-foreground tracking-wide">
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
