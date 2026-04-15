import React, { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  ExternalLink,
  LocateFixed,
  Navigation,
  Truck,
} from 'lucide-react';
import type {
  Map as GoongMapInstance,
  Marker as GoongMarker,
} from '@goongmaps/goong-js';
import axios from 'axios';
import polyline from '@mapbox/polyline';
import '@goongmaps/goong-js/dist/goong-js.css';
import { maptilesKey, apiKey } from '@/configs/goongmapKeys';
import { cn } from '@/lib/utils';

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

let _goongPromise: Promise<
  (typeof import('@goongmaps/goong-js'))['default']
> | null = null;
export function getGoong(): Promise<
  (typeof import('@goongmaps/goong-js'))['default']
> {
  if (!_goongPromise)
    _goongPromise = import('@goongmaps/goong-js').then((m) => m.default);
  return _goongPromise;
}

export function DeliveryMiniMap({
  destLat,
  destLng,
  destAddress,
  staffLat,
  staffLng,
  fullMapHref,
  onLocateMe,
  destPinColor = 'red',
  destLabel,
  mapHeightClass = 'h-64 sm:h-72 md:h-80',
}: {
  destLat?: number;
  destLng?: number;
  destAddress?: string;
  staffLat?: number;
  staffLng?: number;
  fullMapHref?: string;
  onLocateMe?: () => void;
  destPinColor?: 'red' | 'green';
  destLabel?: string;
  mapHeightClass?: string;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoongMapInstance | null>(null);
  const staffMarkerRef = useRef<GoongMarker | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const goongjsRef = useRef<any>(null);
  const routeDrawnRef = useRef(false);
  const routeStartRef = useRef<{ lat: number; lng: number } | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Fit both markers into view
  const fitRoute = useCallback(() => {
    if (
      !mapRef.current ||
      staffLat == null ||
      staffLng == null ||
      destLat == null ||
      destLng == null
    )
      return;
    mapRef.current.fitBounds(
      [
        [Math.min(staffLng, destLng), Math.min(staffLat, destLat)],
        [Math.max(staffLng, destLng), Math.max(staffLat, destLat)],
      ],
      { padding: 60, maxZoom: 16 },
    );
  }, [staffLat, staffLng, destLat, destLng]);

  // Center on staff marker
  const centerOnStaff = useCallback(() => {
    if (!mapRef.current || staffLat == null || staffLng == null) return;
    mapRef.current.flyTo({
      center: [staffLng, staffLat],
      zoom: 16,
      speed: 1.4,
    });
  }, [staffLat, staffLng]);

  // ── Initialize map once — dynamic import avoids SSR "self is not defined" ──
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    let cancelled = false;

    getGoong().then((goongjs) => {
      if (cancelled || !mapContainerRef.current || mapRef.current) return;
      goongjsRef.current = goongjs;

      const centerLng = destLng ?? staffLng ?? 106.7009;
      const centerLat = destLat ?? staffLat ?? 10.7769;

      goongjs.accessToken = maptilesKey;
      const map = new goongjs.Map({
        container: mapContainerRef.current,
        style: 'https://tiles.goong.io/assets/goong_map_web.json',
        center: [centerLng, centerLat],
        zoom: 14,
        attributionControl: false,
      }) as GoongMapInstance;
      map.addControl(new goongjs.NavigationControl(), 'top-right');
      mapRef.current = map;

      map.on('load', () => {
        // Ensure the canvas matches the container's actual dimensions
        try {
          map.resize();
        } catch {
          /* ignore */
        }
        setMapLoading(false);

        // Destination pin (static — doesn't change)
        if (destLat != null && destLng != null) {
          const pinHex = destPinColor === 'green' ? '#22c55e' : '#ef4444';
          const labelText =
            destLabel ??
            destAddress?.split(',')[0] ??
            (destPinColor === 'green' ? 'Hub' : 'Điểm giao');
          const destEl = document.createElement('div');
          destEl.title = labelText;
          destEl.innerHTML = `<div style="position:relative;display:flex;flex-direction:column;align-items:center;"><div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:${pinHex};border:3px solid white;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(0,0,0,0.4)"></div><div style="font-size:10px;font-weight:700;color:${pinHex};background:white;padding:2px 6px;border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,0.2);margin-top:2px;white-space:nowrap;max-width:120px;overflow:hidden;text-overflow:ellipsis;">${labelText}</div></div>`;
          destEl.style.cursor = 'pointer';
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          new (goongjs.Marker as any)({ element: destEl, anchor: 'bottom' })
            .setLngLat([destLng, destLat])
            .addTo(map);
        }

        setMapReady(true);
      });
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      staffMarkerRef.current = null;
      goongjsRef.current = null;
      routeDrawnRef.current = false;
      routeStartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Add/update staff marker and draw route when GPS becomes available ──────
  useEffect(() => {
    const goongjs = goongjsRef.current;
    const map = mapRef.current;
    if (!mapReady || !goongjs || !map || staffLat == null || staffLng == null)
      return;

    // Create marker on first GPS fix; reposition on subsequent updates
    if (!staffMarkerRef.current) {
      const staffEl = document.createElement('div');
      staffEl.innerHTML = `<div style="width:20px;height:20px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 6px rgba(59,130,246,0.2)"></div>`;
      staffMarkerRef.current = new goongjs.Marker({ element: staffEl })
        .setLngLat([staffLng, staffLat])
        .addTo(map) as GoongMarker;
    } else {
      staffMarkerRef.current.setLngLat([staffLng, staffLat]);
    }

    // Re-route if staff has moved >500m from the last route start
    if (
      routeDrawnRef.current &&
      routeStartRef.current &&
      haversineKm(
        routeStartRef.current.lat,
        routeStartRef.current.lng,
        staffLat,
        staffLng,
      ) > 0.5
    ) {
      // Clear existing route layers/sources so a fresh route can be drawn
      const m = mapRef.current;
      if (m) {
        if (m.getLayer('delivery-route')) m.removeLayer('delivery-route');
        if (m.getLayer('delivery-route-casing'))
          m.removeLayer('delivery-route-casing');
        if (m.getSource('delivery-route')) m.removeSource('delivery-route');
        if (m.getSource('delivery-route-casing'))
          m.removeSource('delivery-route-casing');
      }
      routeDrawnRef.current = false;
      routeStartRef.current = null;
    }

    // Fetch and draw route when not yet drawn
    if (!routeDrawnRef.current && destLat != null && destLng != null) {
      routeDrawnRef.current = true;
      routeStartRef.current = { lat: staffLat, lng: staffLng };
      void (async () => {
        try {
          const res = await axios.get<{
            routes?: {
              overview_polyline: { points: string };
              legs?: {
                distance?: { text: string };
                duration?: { text: string };
              }[];
            }[];
          }>(
            `https://rsapi.goong.io/Direction?origin=${staffLat},${staffLng}&destination=${destLat},${destLng}&vehicle=car&api_key=${apiKey}`,
          );
          const route = res.data?.routes?.[0];
          if (!route?.overview_polyline?.points || !mapRef.current) return;

          const leg = route.legs?.[0];
          setRouteInfo({
            distance: leg?.distance?.text ?? '',
            duration: leg?.duration?.text ?? '',
          });
          const coords: [number, number][] = polyline
            .decode(route.overview_polyline.points)
            .map(
              ([lat, lng]: [number, number]) => [lng, lat] as [number, number],
            );

          // Casing (white border)
          mapRef.current.addSource('delivery-route-casing', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates: coords },
            },
          });
          mapRef.current.addLayer({
            id: 'delivery-route-casing',
            type: 'line',
            source: 'delivery-route-casing',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#ffffff',
              'line-width': 8,
              'line-opacity': 0.6,
            },
          });
          // Main route line
          mapRef.current.addSource('delivery-route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates: coords },
            },
          });
          mapRef.current.addLayer({
            id: 'delivery-route',
            type: 'line',
            source: 'delivery-route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#3b82f6',
              'line-width': 5,
              'line-opacity': 0.92,
            },
          });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (mapRef.current as any).fitBounds(
            [
              [Math.min(staffLng, destLng), Math.min(staffLat, destLat)],
              [Math.max(staffLng, destLng), Math.max(staffLat, destLat)],
            ],
            { padding: 70, maxZoom: 16, animate: false },
          );
        } catch {
          // Route fetch failed — markers still visible
        }
      })();
    }
  }, [mapReady, staffLat, staffLng, destLat, destLng]);

  return (
    <div
      className={cn(
        'relative w-full rounded-2xl overflow-hidden border border-border shadow-sm',
        mapHeightClass,
      )}
    >
      <div
        ref={mapContainerRef}
        className="w-full h-full dark:invert-[.95] dark:hue-rotate-180 dark:contrast-[0.85] dark:saturate-150"
      />

      {mapLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/95">
          <div className="size-10 rounded-full border-4 border-border border-t-theme-primary-start animate-spin" />
          <p className="text-sm font-semibold text-muted-foreground">
            Đang tải bản đồ...
          </p>
        </div>
      )}

      {/* Route info badge */}
      {routeInfo && (
        <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-card/95 backdrop-blur-sm rounded-xl border border-border shadow-md px-3 py-2">
          <Truck className="size-3.5 text-blue-500 shrink-0" />
          <span className="text-xs font-bold text-foreground">
            {routeInfo.distance}
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <Clock className="size-3 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground">
            {routeInfo.duration}
          </span>
        </div>
      )}

      {/* Custom overlay buttons */}
      <div className="absolute top-3 left-3 flex flex-col gap-2">
        {/* Locate me */}
        <button
          type="button"
          onClick={() => {
            centerOnStaff();
            onLocateMe?.();
          }}
          title="Định vị chính mình"
          className="size-9 rounded-xl bg-card/95 backdrop-blur-sm border border-border shadow-md flex items-center justify-center hover:bg-card transition-colors active:scale-95"
        >
          <LocateFixed className="size-4 text-blue-500" />
        </button>
        {/* Fit route */}
        {staffLat != null && destLat != null && (
          <button
            type="button"
            onClick={fitRoute}
            title="Xem toàn bộ tuyến đường"
            className="size-9 rounded-xl bg-card/95 backdrop-blur-sm border border-border shadow-md flex items-center justify-center hover:bg-card transition-colors active:scale-95"
          >
            <Navigation className="size-4 text-theme-primary-start" />
          </button>
        )}
      </div>

      {/* Full map link */}
      {fullMapHref && (
        <Link
          href={fullMapHref}
          className="absolute top-3 right-12 flex items-center gap-1.5 bg-card/95 backdrop-blur-sm rounded-xl border border-border shadow-md px-2.5 py-2 text-xs font-bold text-foreground hover:bg-card transition-colors"
        >
          <ExternalLink className="size-3.5" />
          <span className="hidden sm:inline">Mở bản đồ</span>
        </Link>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 bg-card/90 backdrop-blur-sm rounded-xl border border-border shadow-sm px-2.5 py-2">
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-blue-500 border-2 border-white shadow-sm shrink-0" />
          <span className="text-[10px] font-semibold text-foreground whitespace-nowrap">
            Bạn
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              'size-2.5 rounded-full border-2 border-white shadow-sm shrink-0',
              destPinColor === 'green' ? 'bg-green-500' : 'bg-red-500',
            )}
          />
          <span className="text-[10px] font-semibold text-foreground whitespace-nowrap">
            {destLabel ?? (destPinColor === 'green' ? 'Hub' : 'Điểm giao')}
          </span>
        </div>
      </div>
    </div>
  );
}
