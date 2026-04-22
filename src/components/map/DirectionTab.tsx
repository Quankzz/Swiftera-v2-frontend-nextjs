"use client";

import React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  MapPin,
  ArrowUpDown,
  LocateFixed,
  Loader2,
  X,
  Search,
} from "lucide-react";
import axios from "axios";
import { useMapStore } from "@/stores/use-map-store";
import { apiKey } from "@/configs/goongmapKeys";

// ── Types ──────────────────────────────────────────────────────────────────────
interface GoongPrediction {
  description: string;
  place_id: string;
}

type FieldType = "start" | "end";

const MIN_QUERY_LEN = 2;
const MAX_SUGGESTIONS = 5;
const DEBOUNCE_MS = 200;

// ── Highlighted text helper ────────────────────────────────────────────────────
const Highlighted: React.FC<{ text: string; query?: string }> = ({
  text,
  query,
}) => {
  if (!query || query.length < 1) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-theme-primary-start/10 text-theme-primary-start font-semibold rounded-sm not-italic px-0">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
};

// ── Suggestion item ────────────────────────────────────────────────────────────
const SuggestionItem: React.FC<{
  icon: React.ReactNode;
  primary: string;
  secondary?: string;
  query?: string;
  onClick: () => void;
}> = ({ icon, primary, secondary, query, onClick }) => (
  <button
    onMouseDown={(e) => {
      e.preventDefault();
      onClick();
    }}
    onTouchEnd={(e) => {
      e.preventDefault();
      onClick();
    }}
    className="
      w-full flex items-center gap-3 px-4 py-2.5
      hover:bg-accent/50
      active:bg-theme-primary-start/10
      text-left transition-colors duration-150 group
    "
  >
    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 group-hover:bg-theme-primary-start/10 transition-colors">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-foreground truncate leading-snug">
        <Highlighted text={primary} query={query} />
      </p>
      {secondary && (
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {secondary}
        </p>
      )}
    </div>
  </button>
);

// ── Props ──────────────────────────────────────────────────────────────────────
export interface DirectionTabProps {
  onRouteSearch: () => void;
  onGetCurrentLocation: (isStart: boolean) => void;
  onSuggestionOpenChange?: (isOpen: boolean) => void;
}

// ── Component ──────────────────────────────────────────────────────────────────
const DirectionTab: React.FC<DirectionTabProps> = ({
  onRouteSearch,
  onGetCurrentLocation,
  onSuggestionOpenChange,
}) => {
  const {
    startAddress,
    setStartAddress,
    endAddress,
    setEndAddress,
    currentLocationUsage,
    setCurrentLocationUsage,
    swapAddresses,
  } = useMapStore();

  const [activeField, setActiveField] = useState<FieldType | null>(null);
  const [startSugs, setStartSugs] = useState<GoongPrediction[]>([]);
  const [endSugs, setEndSugs] = useState<GoongPrediction[]>([]);
  const [loadingField, setLoadingField] = useState<FieldType | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<
    Record<FieldType, ReturnType<typeof setTimeout> | null>
  >({ start: null, end: null });
  const reqIds = useRef<Record<FieldType, number>>({ start: 0, end: 0 });
  const pendingSearchRef = useRef(false);
  const onRouteSearchRef = useRef(onRouteSearch);
  useEffect(() => {
    onRouteSearchRef.current = onRouteSearch;
  }, [onRouteSearch]);

  const { isRouteLoading } = useMapStore();

  const isSuggestionOpen = activeField !== null;

  useEffect(() => {
    onSuggestionOpenChange?.(isSuggestionOpen);
  }, [isSuggestionOpen, onSuggestionOpenChange]);

  useEffect(() => {
    if (pendingSearchRef.current && startAddress.trim() && endAddress.trim()) {
      pendingSearchRef.current = false;
      if (startAddress.trim() === endAddress.trim()) return;
      const t = setTimeout(() => onRouteSearchRef.current(), 60);
      return () => clearTimeout(t);
    }
  }, [startAddress, endAddress]);

  const closeSuggestions = useCallback(() => {
    setActiveField(null);
    setStartSugs([]);
    setEndSugs([]);
    setLoadingField(null);
  }, []);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) closeSuggestions();
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeSuggestions();
        (document.activeElement as HTMLElement)?.blur();
      }
    };
    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [closeSuggestions]);

  useEffect(
    () => () => {
      if (timers.current.start) clearTimeout(timers.current.start);
      if (timers.current.end) clearTimeout(timers.current.end);
    },
    [],
  );

  const fetchSugs = useCallback(async (query: string, field: FieldType) => {
    const normalized = query.trim();
    const setter = field === "start" ? setStartSugs : setEndSugs;

    if (normalized.length < MIN_QUERY_LEN) {
      setter([]);
      setLoadingField(null);
      return;
    }

    reqIds.current[field]++;
    const reqId = reqIds.current[field];
    setLoadingField(field);

    try {
      const res = await axios.get(
        `https://rsapi.goong.io/Place/AutoComplete?input=${encodeURIComponent(normalized)}&api_key=${apiKey}&limit=${MAX_SUGGESTIONS}`,
      );
      if (reqId !== reqIds.current[field]) return;
      const preds = ((res.data?.predictions ?? []) as GoongPrediction[]).slice(
        0,
        MAX_SUGGESTIONS,
      );
      setter(preds);
    } catch {
      if (reqId !== reqIds.current[field]) return;
      setter([]);
    } finally {
      if (reqId === reqIds.current[field]) {
        setLoadingField((prev) => (prev === field ? null : prev));
      }
    }
  }, []);

  const handleInputChange = (field: FieldType, val: string) => {
    if (field === "start") {
      setStartAddress(val);
      if (currentLocationUsage === "start") setCurrentLocationUsage(null);
    } else {
      setEndAddress(val);
      if (currentLocationUsage === "end") setCurrentLocationUsage(null);
    }
    if (timers.current[field]) clearTimeout(timers.current[field]!);
    timers.current[field] = setTimeout(
      () => fetchSugs(val, field),
      DEBOUNCE_MS,
    );
  };

  const handleFocus = (field: FieldType) => {
    setActiveField(field);
    const val = field === "start" ? startAddress : endAddress;
    if (val.trim().length >= MIN_QUERY_LEN) fetchSugs(val, field);
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: FieldType) => {
    if (e.key === "Enter") {
      e.preventDefault();
      closeSuggestions();
      if (startAddress.trim() && endAddress.trim()) {
        onRouteSearch();
      } else if (field === "start") {
        endInputRef.current?.focus();
      } else {
        startInputRef.current?.focus();
      }
    } else if (e.key === "Escape") {
      closeSuggestions();
      (e.target as HTMLElement).blur();
    }
  };

  const handleSelectSuggestion = (field: FieldType, desc: string) => {
    if (field === "start") setStartAddress(desc);
    else setEndAddress(desc);
    setCurrentLocationUsage(null);
    closeSuggestions();
    pendingSearchRef.current = true;
  };

  const handleCurrentLocationSelect = (field: FieldType) => {
    onGetCurrentLocation(field === "start");
    closeSuggestions();
    pendingSearchRef.current = true;
  };

  const handleClearField = (field: FieldType, e: React.MouseEvent) => {
    e.preventDefault();
    const setter = field === "start" ? setStartAddress : setEndAddress;
    const sugs = field === "start" ? setStartSugs : setEndSugs;
    const ref = field === "start" ? startInputRef : endInputRef;
    setter("");
    setCurrentLocationUsage(null);
    sugs([]);
    setActiveField(field);
    setTimeout(() => ref.current?.focus(), 0);
  };

  const handleSwap = () => {
    swapAddresses();
    closeSuggestions();
    if (startAddress.trim() && endAddress.trim()) {
      pendingSearchRef.current = true;
    }
  };

  const renderSuggestions = (field: FieldType) => {
    if (activeField !== field) return null;
    const sugs = field === "start" ? startSugs : endSugs;
    const isLoading = loadingField === field;
    const query = field === "start" ? startAddress : endAddress;
    const showEmpty =
      !isLoading && sugs.length === 0 && query.trim().length >= MIN_QUERY_LEN;

    return (
      <div className="border-t border-border bg-card">
        <SuggestionItem
          icon={<LocateFixed size={14} className="text-info" />}
          primary="Vị trí của tôi"
          onClick={() => handleCurrentLocationSelect(field)}
        />

        {(isLoading || sugs.length > 0 || showEmpty) && (
          <div className="h-px bg-border mx-4" />
        )}

        {isLoading && (
          <div className="flex items-center gap-2.5 px-4 py-3">
            <Loader2
              size={13}
              className="animate-spin shrink-0 text-theme-primary-start"
            />
            <span className="text-sm text-muted-foreground">
              Đang tìm kiếm...
            </span>
          </div>
        )}

        {!isLoading &&
          sugs.map((s) => {
            const commaIdx = s.description.indexOf(",");
            const primary =
              commaIdx !== -1
                ? s.description.slice(0, commaIdx)
                : s.description;
            const secondary =
              commaIdx !== -1 ? s.description.slice(commaIdx + 2) : undefined;
            return (
              <SuggestionItem
                key={s.place_id}
                icon={<MapPin size={13} className="text-muted-foreground" />}
                primary={primary}
                secondary={secondary}
                query={query.trim()}
                onClick={() => handleSelectSuggestion(field, s.description)}
              />
            );
          })}

        {showEmpty && (
          <div className="flex items-center gap-2 px-4 py-3 text-muted-foreground">
            <Search size={13} className="shrink-0" />
            <span className="text-sm">Không tìm thấy địa điểm phù hợp</span>
          </div>
        )}
      </div>
    );
  };

  const fields: Array<{
    type: FieldType;
    ref: React.RefObject<HTMLInputElement | null>;
    value: string;
    placeholder: string;
    dotColor: string;
  }> = [
    {
      type: "start",
      ref: startInputRef,
      value: startAddress,
      placeholder: "Điểm xuất phát",
      dotColor: "bg-theme-primary-start",
    },
    {
      type: "end",
      ref: endInputRef,
      value: endAddress,
      placeholder: "Điểm đến",
      dotColor: "bg-destructive",
    },
  ];

  return (
    <div ref={containerRef} className="shrink-0">
      <div className="px-5 pt-5 pb-4 flex gap-3 items-stretch relative bg-card border-b border-border/50 z-10">
        <div className="flex flex-col flex-1 gap-2.5 min-w-0">
          {fields.map((field, idx) => (
            <React.Fragment key={field.type}>
              <div
                className={`
                  group flex items-center gap-3 rounded-2xl px-3.5 py-3 transition-all duration-300
                  ${
                    activeField === field.type
                      ? "bg-card shadow-[0_4px_20px_rgb(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.4)] border border-transparent ring-2 ring-theme-primary-start/20"
                      : "bg-muted/40 border border-border/50 hover:border-border"
                  }
                `}
              >
                <div
                  className={`relative w-3.5 h-3.5 rounded-full ${field.dotColor} shrink-0 shadow-inner flex items-center justify-center`}
                >
                  <div className="w-1.5 h-1.5 bg-white rounded-full opacity-70" />
                </div>
                <input
                  ref={field.ref}
                  value={field.value}
                  onChange={(e) =>
                    handleInputChange(field.type, e.target.value)
                  }
                  onFocus={() => handleFocus(field.type)}
                  onKeyDown={(e) => handleKeyDown(e, field.type)}
                  placeholder={field.placeholder}
                  autoComplete="off"
                  spellCheck={false}
                  className="flex-1 bg-transparent text-[14px] font-medium outline-none text-foreground placeholder-muted-foreground min-w-0"
                />
                {field.value && (
                  <button
                    onMouseDown={(e) => handleClearField(field.type, e)}
                    className={`
                      shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground 
                      hover:bg-accent hover:text-foreground 
                      transition-all active:scale-90 opacity-0 group-hover:opacity-100
                      ${activeField === field.type ? "opacity-100 bg-muted" : ""}
                    `}
                    aria-label="Xoá"
                  >
                    <X size={12} strokeWidth={2.5} />
                  </button>
                )}
              </div>

              {idx === 0 && (
                <div className="absolute left-9.5 top-14.5 bottom-14.5 w-0.5 border-l-2 border-dashed border-border" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Swap button */}
        <div className="flex items-center self-center z-10 pt-1">
          <button
            onClick={handleSwap}
            title="Hoán đổi điểm đầu và điểm cuối"
            className="
              w-10 h-10 rounded-full flex items-center justify-center
              bg-card shadow-[0_4px_12px_rgb(0,0,0,0.06)] dark:shadow-[0_4px_12px_rgb(0,0,0,0.3)]
              border border-border
              text-muted-foreground
              hover:bg-theme-primary-start/10
              hover:border-theme-primary-start/20
              hover:text-theme-primary-start
              transition-all duration-300 hover:rotate-180 hover:scale-105 active:scale-90
            "
          >
            <ArrowUpDown size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Suggestion panels */}
      {renderSuggestions("start")}
      {renderSuggestions("end")}

      {/* Route-search loading bar */}
      <div
        className={`h-0.5 overflow-hidden transition-opacity duration-300 ${
          isRouteLoading ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="relative h-full bg-muted">
          <div className="absolute inset-y-0 w-1/3 bg-linear-to-r from-transparent via-theme-primary-start to-transparent animate-[loading-bar_1.3s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
};

export default DirectionTab;
