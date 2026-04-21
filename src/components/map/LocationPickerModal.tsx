'use client';

/**
 * LocationPickerModal
 *
 * Dialog chọn vị trí trên GoongMap:
 * - Search bar (Goong Place AutoComplete) để tìm nhanh địa điểm
 * - Click lên bản đồ hoặc kéo marker để đặt vị trí
 * - Reverse geocode → hiển thị địa chỉ
 * - Confirm trả về { lat, lng, address }
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, MapPin, Loader2, CheckCircle2, Search } from 'lucide-react';
import goongjs from '@goongmaps/goong-js';
import type {
  Map as GoongMapInstance,
  Marker as GoongMarker,
} from '@goongmaps/goong-js';
import axios from 'axios';
import '@goongmaps/goong-js/dist/goong-js.css';
import { maptilesKey, apiKey } from '@/configs/goongmapKeys';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PickedLocation {
  lat: number;
  lng: number;
  address?: string;
}

interface LocationPickerModalProps {
  /** Tọa độ ban đầu (nếu đã có từ trước) */
  initialLat?: number;
  initialLng?: number;
  onConfirm: (location: PickedLocation) => void;
  onClose: () => void;
}

interface PlaceSuggestion {
  place_id: string;
  description: string;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await axios.get<{
      results?: { formatted_address?: string }[];
    }>(`https://rsapi.goong.io/Geocode?latlng=${lat},${lng}&api_key=${apiKey}`);
    return res.data.results?.[0]?.formatted_address ?? '';
  } catch {
    return '';
  }
}

async function autoComplete(input: string): Promise<PlaceSuggestion[]> {
  try {
    const res = await axios.get<{ predictions?: PlaceSuggestion[] }>(
      `https://rsapi.goong.io/Place/AutoComplete?input=${encodeURIComponent(input)}&api_key=${apiKey}`,
    );
    return res.data.predictions ?? [];
  } catch {
    return [];
  }
}

async function placeDetail(
  placeId: string,
): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await axios.get<{
      result?: { geometry?: { location?: { lat: number; lng: number } } };
    }>(
      `https://rsapi.goong.io/Place/Detail?place_id=${placeId}&api_key=${apiKey}`,
    );
    const loc = res.data.result?.geometry?.location;
    return loc ?? null;
  } catch {
    return null;
  }
}

// ─── Tạo HTML element cho marker đỏ (pin) ────────────────────────────────────

function createPinElement(): HTMLElement {
  const el = document.createElement('div');
  const svg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">` +
      `<path fill="#E53935" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>` +
      `<circle cx="12" cy="9" r="2.5" fill="white"/>` +
      `</svg>`,
  );
  el.style.cssText =
    `width:36px;height:36px;cursor:grab;` +
    `background-image:url("data:image/svg+xml,${svg}");` +
    `background-repeat:no-repeat;background-size:contain;` +
    `filter:drop-shadow(0 2px 6px rgba(0,0,0,0.45));`;
  return el;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_CENTER: [number, number] = [105.8412, 21.0278]; // Hà Nội
const DEFAULT_ZOOM = 13;
const SEARCH_DEBOUNCE_MS = 650;

// ─── Component ────────────────────────────────────────────────────────────────

export function LocationPickerModal({
  initialLat,
  initialLng,
  onConfirm,
  onClose,
}: LocationPickerModalProps) {
  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoongMapInstance | null>(null);
  const markerRef = useRef<GoongMarker | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Search refs
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Map state
  const [picked, setPicked] = useState<PickedLocation | null>(
    initialLat != null && initialLng != null
      ? { lat: initialLat, lng: initialLng }
      : null,
  );
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  // Search state
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // ── Reverse geocode & cập nhật picked ───────────────────────────────────────
  const updatePickedLocation = useCallback(async (lat: number, lng: number) => {
    setIsGeocoding(true);
    const address = await reverseGeocode(lat, lng);
    setIsGeocoding(false);
    setPicked({ lat, lng, address });
  }, []);

  // ── Đặt/di chuyển marker trên bản đồ ─────────────────────────────────────
  const placeMarker = useCallback(
    (lat: number, lng: number) => {
      const map = mapRef.current;
      if (!map) return;

      if (!markerRef.current) {
        const el = createPinElement();
        const marker = new goongjs.Marker({
          element: el,
          draggable: true,
          anchor: 'bottom',
        })
          .setLngLat([lng, lat])
          .addTo(map);
        markerRef.current = marker;

        // Drag end - DOM event vì GoongMarker type không có .on()
        const onDragEnd = () => {
          const lngLat = marker.getLngLat();
          void updatePickedLocation(lngLat.lat, lngLat.lng);
        };
        el.addEventListener('mouseup', onDragEnd);
        el.addEventListener('touchend', onDragEnd);
      } else {
        markerRef.current.setLngLat([lng, lat]);
      }

      void updatePickedLocation(lat, lng);
    },
    [updatePickedLocation],
  );

  // ── Init GoongMap ─────────────────────────────────────────────────────────
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapRef.current) return;

    goongjs.accessToken = maptilesKey;

    const center: [number, number] =
      initialLng != null && initialLat != null
        ? [initialLng, initialLat]
        : DEFAULT_CENTER;

    const map = new goongjs.Map({
      container,
      style: 'https://tiles.goong.io/assets/goong_map_web.json',
      center,
      zoom: initialLat != null ? 15 : DEFAULT_ZOOM,
    });

    mapRef.current = map;

    map.on('load', () => {
      setIsMapReady(true);

      // Fix canvas bị 150px: resize sau khi layout settle, rồi observe thêm
      requestAnimationFrame(() => {
        map.resize();
        if (initialLat != null && initialLng != null) {
          placeMarker(initialLat, initialLng);
        }
      });

      resizeObserverRef.current = new ResizeObserver(() => map.resize());
      resizeObserverRef.current.observe(container);
    });

    // Click lên map → đặt marker + đóng suggestion
    map.on('click', (e: unknown) => {
      const ev = e as { lngLat: { lat: number; lng: number } };
      setShowSuggestions(false);
      placeMarker(ev.lngLat.lat, ev.lngLat.lng);
    });

    return () => {
      resizeObserverRef.current?.disconnect();
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Search: debounce autocomplete ─────────────────────────────────────────
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      setIsSuggesting(true);
      const results = await autoComplete(value);
      setSuggestions(results);
      setIsSuggesting(false);
      setShowSuggestions(results.length > 0);
    }, SEARCH_DEBOUNCE_MS);
  };

  // ── Chọn gợi ý → bay đến + đặt marker ───────────────────────────────────
  const handleSelectSuggestion = async (suggestion: PlaceSuggestion) => {
    setShowSuggestions(false);
    setSearchValue(suggestion.description);
    setSuggestions([]);

    const loc = await placeDetail(suggestion.place_id);
    if (!loc || !mapRef.current) return;

    mapRef.current.flyTo({
      center: [loc.lng, loc.lat],
      zoom: 16,
      essential: true,
    });
    placeMarker(loc.lat, loc.lng);
  };

  // ── Confirm ───────────────────────────────────────────────────────────────
  function handleConfirm() {
    if (!picked) return;
    onConfirm(picked);
    onClose();
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className='fixed inset-0 z-60 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={onClose}
      />

      {/*
        Panel - fixed px height (không dùng min() vì GoongMap cần clientHeight
        xác định ngay khi mount, min() làm browser tính lazy)
      */}
      <div
        className='relative z-10 flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white dark:bg-surface-card shadow-2xl'
        style={{ height: '620px', maxHeight: '90dvh' }}
      >
        {/* ── Header ── */}
        <div className='flex shrink-0 items-center justify-between border-b border-gray-100 dark:border-white/8 px-5 py-3.5'>
          <div className='flex items-center gap-2.5'>
            <MapPin size={18} className='text-theme-primary-start' />
            <h3 className='text-sm font-semibold text-text-main'>
              Chọn vị trí trên bản đồ
            </h3>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='flex size-7 items-center justify-center rounded-md text-text-sub transition hover:bg-gray-100 dark:hover:bg-white/8 hover:text-text-main'
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Search bar ── */}
        <div className='relative shrink-0 px-4 py-2.5 border-b border-gray-100 dark:border-white/8'>
          <div className='relative flex items-center'>
            {isSuggesting ? (
              <Loader2
                size={15}
                className='absolute left-3 animate-spin text-text-sub pointer-events-none'
              />
            ) : (
              <Search
                size={15}
                className='absolute left-3 text-text-sub pointer-events-none'
              />
            )}
            <input
              ref={searchInputRef}
              type='text'
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder='Tìm địa điểm, đường, quận...'
              className='w-full rounded-lg border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-base pl-9 pr-8 py-2 text-sm text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-theme-primary-start/30'
            />
            {searchValue && (
              <button
                type='button'
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setSearchValue('');
                  setSuggestions([]);
                  setShowSuggestions(false);
                  searchInputRef.current?.focus();
                }}
                className='absolute right-2.5 flex size-5 items-center justify-center rounded text-text-sub hover:text-text-main transition'
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Suggestion dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className='absolute left-4 right-4 top-full mt-1 z-20 overflow-hidden rounded-lg border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card shadow-lg'>
              {suggestions.map((s) => (
                <button
                  key={s.place_id}
                  type='button'
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => void handleSelectSuggestion(s)}
                  className='flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-sm text-text-main hover:bg-gray-50 dark:hover:bg-white/5 transition border-b border-gray-100 dark:border-white/5 last:border-0'
                >
                  <MapPin
                    size={14}
                    className='mt-0.5 shrink-0 text-theme-primary-start'
                  />
                  <span className='line-clamp-2 leading-snug'>
                    {s.description}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Hint ── */}
        <div className='shrink-0 bg-blue-50 dark:bg-blue-950/30 px-5 py-1.5 text-xs text-blue-700 dark:text-blue-300'>
          Click lên bản đồ để đặt vị trí • Kéo marker để điều chỉnh chính xác
          hơn
        </div>

        {/* ── Map ─────────────────────────────────────────────────────────────
          Quan trọng: wrapper dùng position:relative + flex-1, còn inner div
          dùng position:absolute inset:0 với width/height 100% rõ ràng để
          GoongMap đọc được clientWidth/clientHeight ngay khi init.
        ── */}
        <div className='relative flex-1' style={{ minHeight: 0 }}>
          <div
            ref={mapContainerRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: '100%',
            }}
          />
          {!isMapReady && (
            <div className='absolute inset-0 z-10 flex items-center justify-center bg-gray-100 dark:bg-surface-base'>
              <Loader2 className='size-6 animate-spin text-theme-primary-start' />
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className='shrink-0 flex items-center justify-between gap-3 border-t border-gray-100 dark:border-white/8 px-5 py-3.5'>
          <div className='min-w-0 flex-1'>
            {picked ? (
              <div className='flex flex-col gap-0.5'>
                <div className='flex items-center gap-1.5'>
                  {isGeocoding ? (
                    <Loader2
                      size={13}
                      className='animate-spin text-text-sub shrink-0'
                    />
                  ) : (
                    <CheckCircle2
                      size={13}
                      className='text-green-500 shrink-0'
                    />
                  )}
                  <span className='text-xs font-mono text-text-main'>
                    {picked.lat.toFixed(6)}, {picked.lng.toFixed(6)}
                  </span>
                </div>
                {!isGeocoding && picked.address && (
                  <p className='truncate text-xs text-text-sub pl-5'>
                    {picked.address}
                  </p>
                )}
                {isGeocoding && (
                  <p className='text-xs text-text-sub pl-5 italic'>
                    Đang tìm địa chỉ…
                  </p>
                )}
              </div>
            ) : (
              <p className='text-xs text-text-sub italic'>Chưa chọn vị trí</p>
            )}
          </div>

          <div className='flex shrink-0 items-center gap-2'>
            <button
              type='button'
              onClick={onClose}
              className='rounded-lg border border-gray-200 dark:border-white/8 px-3 py-1.5 text-sm font-medium text-text-main transition hover:bg-gray-50 dark:hover:bg-white/5'
            >
              Hủy
            </button>
            <button
              type='button'
              disabled={!picked || isGeocoding}
              onClick={handleConfirm}
              className='inline-flex items-center gap-1.5 rounded-lg bg-theme-primary-start px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <CheckCircle2 size={14} />
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
