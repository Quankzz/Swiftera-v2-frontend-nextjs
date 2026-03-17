'use client';

import type React from 'react';
import { useState, useRef } from 'react';
import { MapPin, ArrowUpDown, Navigation } from 'lucide-react';
import axios from 'axios';
import { useMapStore } from '@/stores/use-map-store';
import { apiKey } from '@/configs/goongmapKeys';

interface GoongPrediction {
  description: string;
  place_id: string;
}

interface DropdownPos {
  top: number;
  left: number;
  width: number;
}

interface SuggestionDropdownProps {
  suggestions: GoongPrediction[];
  pos: DropdownPos | null;
  onSelect: (desc: string) => void;
  onClose: () => void;
}

const SuggestionDropdown: React.FC<SuggestionDropdownProps> = ({
  suggestions,
  pos,
  onSelect,
  onClose,
}) => {
  if (!suggestions.length || !pos) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        width: pos.width,
        zIndex: 9999,
      }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
    >
      {suggestions.map((s) => (
        <button
          key={s.place_id}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(s.description);
            onClose();
          }}
          className="w-full flex items-start gap-2.5 px-4 py-2.5 hover:bg-emerald-50 dark:hover:bg-slate-700 text-left border-b border-slate-100 dark:border-slate-700/50 last:border-0 transition-colors"
        >
          <MapPin size={13} className="flex-shrink-0 text-slate-400 mt-0.5" />
          <span className="text-sm text-slate-700 dark:text-slate-200 line-clamp-2 leading-snug">
            {s.description}
          </span>
        </button>
      ))}
    </div>
  );
};

interface DirectionTabProps {
  onRouteSearch: () => void;
  onGetCurrentLocation: (isStart: boolean) => void;
}

const DirectionTab: React.FC<DirectionTabProps> = ({
  onRouteSearch,
  onGetCurrentLocation,
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

  const [startSugs, setStartSugs] = useState<GoongPrediction[]>([]);
  const [endSugs, setEndSugs] = useState<GoongPrediction[]>([]);
  const [startPos, setStartPos] = useState<DropdownPos | null>(null);
  const [endPos, setEndPos] = useState<DropdownPos | null>(null);

  const startRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const startTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSugs = async (
    query: string,
    setter: (s: GoongPrediction[]) => void,
    ref: React.RefObject<HTMLDivElement | null>,
    posSetter: (p: DropdownPos | null) => void,
  ) => {
    if (query.trim().length < 2) {
      setter([]);
      posSetter(null);
      return;
    }
    try {
      const res = await axios.get(
        `https://rsapi.goong.io/Place/AutoComplete?input=${encodeURIComponent(query)}&api_key=${apiKey}&limit=5`,
      );
      const preds = (res.data?.predictions ?? []) as GoongPrediction[];
      setter(preds);
      if (preds.length > 0 && ref.current) {
        const r = ref.current.getBoundingClientRect();
        posSetter({ top: r.bottom + 4, left: r.left, width: r.width });
      }
    } catch {
      setter([]);
    }
  };

  const handleStartChange = (val: string) => {
    setStartAddress(val);
    if (currentLocationUsage === 'start') setCurrentLocationUsage(null);
    if (startTimer.current) clearTimeout(startTimer.current);
    startTimer.current = setTimeout(
      () => fetchSugs(val, setStartSugs, startRef, setStartPos),
      350,
    );
  };

  const handleEndChange = (val: string) => {
    setEndAddress(val);
    if (currentLocationUsage === 'end') setCurrentLocationUsage(null);
    if (endTimer.current) clearTimeout(endTimer.current);
    endTimer.current = setTimeout(
      () => fetchSugs(val, setEndSugs, endRef, setEndPos),
      350,
    );
  };

  const clearStart = () => {
    setStartSugs([]);
    setStartPos(null);
  };
  const clearEnd = () => {
    setEndSugs([]);
    setEndPos(null);
  };

  return (
    <div className="p-5 space-y-4 flex-shrink-0">
      {/* Label */}
      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
        Nhập địa điểm
      </p>

      {/* Start / End inputs with swap */}
      <div className="flex gap-3 items-stretch">
        {/* Input column */}
        <div className="flex flex-col flex-1 gap-1">
          {/* Start input */}
          <div
            ref={startRef}
            className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 focus-within:border-emerald-400 dark:focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 dark:focus-within:ring-emerald-900/30 transition-all"
          >
            <div className="flex-shrink-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-100 dark:ring-emerald-900/50" />
            <input
              value={startAddress}
              onChange={(e) => handleStartChange(e.target.value)}
              onBlur={() => setTimeout(clearStart, 180)}
              placeholder="Điểm xuất phát"
              className="flex-1 bg-transparent text-sm outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 min-w-0"
            />
            <button
              onClick={() => {
                onGetCurrentLocation(true);
                clearStart();
              }}
              title="Dùng vị trí hiện tại"
              className="flex-shrink-0 text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
            >
              <MapPin size={15} />
            </button>
          </div>

          {/* Dotted connector */}
          <div className="flex items-center h-4 pl-[22px]">
            <div className="flex flex-col gap-[4px]">
              <div className="w-[2px] h-[2px] rounded-full bg-slate-300 dark:bg-slate-600" />
              <div className="w-[2px] h-[2px] rounded-full bg-slate-300 dark:bg-slate-600" />
              <div className="w-[2px] h-[2px] rounded-full bg-slate-300 dark:bg-slate-600" />
            </div>
          </div>

          {/* End input */}
          <div
            ref={endRef}
            className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 focus-within:border-rose-400 dark:focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-100 dark:focus-within:ring-rose-900/30 transition-all"
          >
            <div className="flex-shrink-0 w-3 h-3 rounded-full bg-rose-500 ring-2 ring-rose-100 dark:ring-rose-900/50" />
            <input
              value={endAddress}
              onChange={(e) => handleEndChange(e.target.value)}
              onBlur={() => setTimeout(clearEnd, 180)}
              placeholder="Điểm đến"
              className="flex-1 bg-transparent text-sm outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 min-w-0"
            />
            <button
              onClick={() => {
                onGetCurrentLocation(false);
                clearEnd();
              }}
              title="Dùng vị trí hiện tại"
              className="flex-shrink-0 text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
            >
              <MapPin size={15} />
            </button>
          </div>
        </div>

        {/* Swap button — vertically centred between inputs */}
        <div className="flex items-center pb-5">
          <button
            onClick={swapAddresses}
            title="Hoán đổi điểm đầu và điểm cuối"
            className="w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          >
            <ArrowUpDown
              size={16}
              strokeWidth={2.5}
              className="text-slate-500 dark:text-slate-400"
            />
          </button>
        </div>
      </div>

      {/* Find route CTA */}
      <button
        onClick={onRouteSearch}
        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-200/70 dark:shadow-emerald-900/40 hover:-translate-y-0.5 active:translate-y-0"
      >
        <Navigation size={16} strokeWidth={2.5} />
        Tìm đường
      </button>

      {/* Autocomplete dropdowns — fixed-position to escape overflow clipping */}
      <SuggestionDropdown
        suggestions={startSugs}
        pos={startPos}
        onSelect={setStartAddress}
        onClose={clearStart}
      />
      <SuggestionDropdown
        suggestions={endSugs}
        pos={endPos}
        onSelect={setEndAddress}
        onClose={clearEnd}
      />
    </div>
  );
};

export default DirectionTab;
