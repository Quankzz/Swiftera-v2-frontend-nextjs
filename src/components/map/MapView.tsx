'use client';

import type React from 'react';
import { useEffect, useRef, useCallback, useState } from 'react';
import goongjs from '@goongmaps/goong-js';
import type {
  Map as GoongMapInstance,
  Marker as GoongMarker,
} from '@goongmaps/goong-js';
import axios from 'axios';
import polyline from '@mapbox/polyline';
import '@goongmaps/goong-js/dist/goong-js.css';

import { maptilesKey, apiKey } from '@/configs/goongmapKeys';
import { useMapStore } from '@/stores/use-map-store';
import { MOCK_HUBS } from '@/data/mockHubs';
import type { Hub, HubWithDistance, RouteInfo } from '@/types/map.types';

import MapSidebar from '@/components/map/MapSidebar';
import LocationButton from '@/components/map/LocationButton';
import HubModal from '@/components/map/HubModal';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

// ─── constants ─────────────────────────────────────────────────────────────────
const ROUTE_COLORS = ['#0EA5E9', '#6B7280', '#9CA3AF'] as const;
const ROUTE_ACTIVE_COLOR = '#0EA5E9';
const ROUTE_INACTIVE_COLOR = '#94A3B8';
const NEARBY_RADIUS_KM = 10;
const FIT_BOUNDS_PADDING = {
  top: 80,
  bottom: 80,
  left: 420,
  right: 80,
} as const;

// ─── types ─────────────────────────────────────────────────────────────────────
interface Notification {
  id: number;
  type: 'error' | 'info' | 'success';
  message: string;
}

interface GoongStep {
  html_instructions?: string;
  distance?: { text: string; value: number };
  duration?: { text: string; value: number };
}

interface GoongLeg {
  distance?: { text: string; value: number };
  duration?: { text: string; value: number };
  steps?: GoongStep[];
}

interface GoongRoute {
  legs?: GoongLeg[];
  overview_polyline: { points: string };
  summary?: string;
}

// ─── helpers ───────────────────────────────────────────────────────────────────
function haversineDistance(
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

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

let notifCounter = 0;

// ─── component ─────────────────────────────────────────────────────────────────
const MapView: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoongMapInstance | null>(null);
  const startMarkerRef = useRef<GoongMarker | null>(null);
  const endMarkerRef = useRef<GoongMarker | null>(null);
  const userMarkerRef = useRef<GoongMarker | null>(null);
  const routeLayerIdsRef = useRef<string[]>([]);
  const routeSourceIdsRef = useRef<string[]>([]);
  /** Incremented on each new search; stale searches check this to self-cancel */
  const searchTokenRef = useRef(0);
  /** Session-scoped geocode cache: address string → coordinates. Avoids re-fetching for unchanged fields. */
  const geocodeCacheRef = useRef<Map<string, { lat: number; lng: number }>>(
    new Map(),
  );
  /** Tracks click/hover handlers registered on route layers so they can be removed on redraw. */
  const routeClickHandlersRef = useRef<
    Array<{ layerId: string; type: string; handler: (e: unknown) => void }>
  >([]);

  const {
    userLocation,
    setUserLocation,
    isLocationOn,
    setIsLocationOn,
    setHubs,
    setNearbyHubs,
    startAddress,
    setStartAddress,
    endAddress,
    setEndAddress,
    setCurrentLocationUsage,
    maxRoutes,
    setRouteInfoList,
    selectedRouteIndex,
    setSelectedRouteIndex,
    setIsRouteInfoVisible,
    clearDirections,
    clearRouteResults,
    setIsRouteLoading,
    isMapReady,
    setIsMapReady,
  } = useMapStore();

  // ── Notifications ──────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback(
    (type: Notification['type'], message: string) => {
      const id = ++notifCounter;
      setNotifications((prev) => [...prev.slice(-2), { id, type, message }]); // max 3 at a time
      setTimeout(
        () => setNotifications((prev) => prev.filter((n) => n.id !== id)),
        4000,
      );
    },
    [],
  );

  const dismissNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // ── Load mock hubs ─────────────────────────────────────────────────────────
  useEffect(() => {
    setHubs(MOCK_HUBS);
  }, [setHubs]);

  // ── Silent geolocation on mount ────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        setUserLocation({ lat: coords.latitude, lng: coords.longitude }),
      () => {},
    );
  }, [setUserLocation]);

  // ── Initialise map ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current) return;
    goongjs.accessToken = maptilesKey;

    const map = new goongjs.Map({
      container: mapContainerRef.current,
      style: `https://tiles.goong.io/assets/goong_map_web.json?api_key=${maptilesKey}`,
      center: [106.69516, 10.77543],
      zoom: 13,
    });

    map.addControl(new goongjs.NavigationControl(), 'bottom-right');
    map.addControl(new goongjs.ScaleControl(), 'bottom-left');

    map.on('load', () => {
      mapRef.current = map;
      setIsMapReady(true);
      requestAnimationFrame(() => map.resize());

      // Hub markers
      MOCK_HUBS.forEach((hub) => {
        const el = document.createElement('div');
        el.title = hub.name;
        el.style.cssText = 'width:40px;height:40px;cursor:pointer;';

        const inner = document.createElement('div');
        inner.style.cssText = [
          'width:40px;height:40px;',
          'background:#059669;',
          'border:3px solid white;',
          'border-radius:50%;',
          'box-shadow:0 2px 10px rgba(0,0,0,0.3);',
          'display:flex;align-items:center;justify-content:center;',
          'transition:transform 0.15s ease,box-shadow 0.15s ease;',
        ].join('');

        inner.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>`;

        el.appendChild(inner);

        el.addEventListener('mouseenter', () => {
          inner.style.transform = 'scale(1.18)';
          inner.style.boxShadow = '0 6px 24px rgba(5,150,105,0.5)';
        });
        el.addEventListener('mouseleave', () => {
          inner.style.transform = '';
          inner.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
        });
        el.addEventListener('click', () => {
          useMapStore.getState().openHubModal(hub);
          map.flyTo({
            center: [hub.longitude, hub.latitude],
            zoom: 16,
            essential: true,
          });
        });

        new goongjs.Marker({ element: el })
          .setLngLat([hub.longitude, hub.latitude])
          .addTo(map);
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
      setIsMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── User location marker sync ──────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;

    if (!userMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'user-location-marker';
      el.innerHTML = `
        <div style="position:relative;width:20px;height:20px;">
          <div style="
            position:absolute;inset:0;background:#0EA5E9;border-radius:50%;
            border:3px solid white;box-shadow:0 0 10px rgba(0,0,0,0.3);z-index:2;
          "></div>
          <div style="
            position:absolute;inset:-6px;background:rgba(14,165,233,0.3);
            border-radius:50%;animation:ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;z-index:1;
          "></div>
        </div>
      `;
      userMarkerRef.current = new goongjs.Marker({ element: el })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map);
    } else {
      userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
    }
  }, [userLocation, isMapReady]);

  // ── Redraw routes when selected index changes ──────────────────────────────
  useEffect(() => {
    const { routeInfoList: routes } = useMapStore.getState();
    if (routes.length > 0 && selectedRouteIndex < routes.length) {
      drawRoutes(routes, selectedRouteIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRouteIndex]);
  // ── Auto-clear routes when either address field becomes empty ───────────────
  useEffect(() => {
    // Both filled — nothing to clear
    if (startAddress.trim() && endAddress.trim()) return;

    // Cancel any in-flight search so stale results won’t re-draw routes
    searchTokenRef.current++;
    setIsRouteLoading(false);

    // Remove route layers from the map
    const map = mapRef.current;
    if (
      (routeLayerIdsRef.current.length > 0 ||
        routeSourceIdsRef.current.length > 0) &&
      map
    ) {
      routeClickHandlersRef.current.forEach(({ layerId, type, handler }) => {
        if (map.getLayer(layerId)) map.off(type, layerId, handler);
      });
      routeClickHandlersRef.current = [];
      routeLayerIdsRef.current.forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id);
      });
      routeSourceIdsRef.current.forEach((id) => {
        if (map.getSource(id)) map.removeSource(id);
      });
      routeLayerIdsRef.current = [];
      routeSourceIdsRef.current = [];
    }

    // Remove markers for whichever field was cleared
    if (!startAddress.trim()) {
      startMarkerRef.current?.remove();
      startMarkerRef.current = null;
    }
    if (!endAddress.trim()) {
      endMarkerRef.current?.remove();
      endMarkerRef.current = null;
    }

    clearRouteResults();
  }, [startAddress, endAddress, clearRouteResults, setIsRouteLoading]);
  // ── Marker helpers ─────────────────────────────────────────────────────────
  const createMarkerEl = (color: string, isDot?: boolean) => {
    const el = document.createElement('div');
    el.innerHTML = `
      <div style="position:relative;width:28px;height:36px">
        <div style="
          width:26px;height:26px;
          background:${color};border:3px solid white;
          border-radius:${isDot ? '50%' : '50% 50% 50% 0'};
          transform:${isDot ? 'none' : 'rotate(-45deg)'};
          box-shadow:0 3px 10px rgba(0,0,0,0.28);
          position:absolute;top:0;left:0;
        ">
          <div style="
            width:8px;height:8px;background:white;border-radius:50%;
            position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)
          "></div>
        </div>
      </div>`;
    return el;
  };

  const createStartMarker = useCallback(
    (lngLat: [number, number]): GoongMarker | null => {
      const map = mapRef.current;
      if (!map) return null;
      return new goongjs.Marker({
        element: createMarkerEl('#10B981'),
        anchor: 'bottom',
      })
        .setLngLat(lngLat)
        .addTo(map);
    },
    [],
  );

  const createEndMarker = useCallback(
    (lngLat: [number, number]): GoongMarker | null => {
      const map = mapRef.current;
      if (!map) return null;
      return new goongjs.Marker({
        element: createMarkerEl('#EF4444'),
        anchor: 'bottom',
      })
        .setLngLat(lngLat)
        .addTo(map);
    },
    [],
  );

  // ── Route helpers ──────────────────────────────────────────────────────────
  const clearAllRoutes = useCallback(() => {
    const map = mapRef.current;
    if (map) {
      // Remove click/hover handlers before removing layers
      routeClickHandlersRef.current.forEach(({ layerId, type, handler }) => {
        if (map.getLayer(layerId)) map.off(type, layerId, handler);
      });
      routeClickHandlersRef.current = [];
      // Layers MUST be removed before their sources
      routeLayerIdsRef.current.forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id);
      });
      routeSourceIdsRef.current.forEach((id) => {
        if (map.getSource(id)) map.removeSource(id);
      });
      routeLayerIdsRef.current = [];
      routeSourceIdsRef.current = [];
    }
    startMarkerRef.current?.remove();
    startMarkerRef.current = null;
    endMarkerRef.current?.remove();
    endMarkerRef.current = null;
    clearDirections();
  }, [clearDirections]);

  const drawRoutes = useCallback((infos: RouteInfo[], activeIdx: number) => {
    const map = mapRef.current;
    if (!map) return;

    // Clean up existing click/hover handlers before removing layers
    routeClickHandlersRef.current.forEach(({ layerId, type, handler }) => {
      if (map.getLayer(layerId)) map.off(type, layerId, handler);
    });
    routeClickHandlersRef.current = [];

    // Remove existing layers then sources
    routeLayerIdsRef.current.forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    routeSourceIdsRef.current.forEach((id) => {
      if (map.getSource(id)) map.removeSource(id);
    });
    routeLayerIdsRef.current = [];
    routeSourceIdsRef.current = [];

    // Draw inactive routes first (behind active)
    infos.forEach((info, idx) => {
      if (idx === activeIdx) return;
      const sourceId = `route-source-${idx}`;
      const layerId = `route-layer-${idx}`;
      const hitLayerId = `route-hit-${idx}`;

      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: info.coordinates },
          properties: {},
        },
      });

      // Visible dim line
      map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': ROUTE_INACTIVE_COLOR, // always gray regardless of index
          'line-width': 4,
          'line-opacity': 0.5,
        },
      });

      // Wide transparent hit-area layer — makes it easy to click narrow lines
      map.addLayer({
        id: hitLayerId,
        type: 'line',
        source: sourceId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-width': 24, 'line-opacity': 0 },
      });

      // Click → switch active route (effect on selectedRouteIndex will redraw)
      const clickHandler = () => {
        useMapStore.getState().setSelectedRouteIndex(idx);
      };
      map.on('click', hitLayerId, clickHandler);
      routeClickHandlersRef.current.push({
        layerId: hitLayerId,
        type: 'click',
        handler: clickHandler,
      });

      // Hover → pointer cursor + highlight the inactive route
      const enterHandler = () => {
        map.getCanvas().style.cursor = 'pointer';
        if (map.getLayer(layerId)) {
          map.setPaintProperty(layerId, 'line-opacity', 0.85);
          map.setPaintProperty(layerId, 'line-width', 6);
          map.setPaintProperty(layerId, 'line-color', ROUTE_ACTIVE_COLOR); // preview blue
        }
      };
      map.on('mouseenter', hitLayerId, enterHandler);
      routeClickHandlersRef.current.push({
        layerId: hitLayerId,
        type: 'mouseenter',
        handler: enterHandler,
      });

      const leaveHandler = () => {
        map.getCanvas().style.cursor = '';
        if (map.getLayer(layerId)) {
          map.setPaintProperty(layerId, 'line-opacity', 0.5);
          map.setPaintProperty(layerId, 'line-width', 4);
          map.setPaintProperty(layerId, 'line-color', ROUTE_INACTIVE_COLOR);
        }
      };
      map.on('mouseleave', hitLayerId, leaveHandler);
      routeClickHandlersRef.current.push({
        layerId: hitLayerId,
        type: 'mouseleave',
        handler: leaveHandler,
      });

      routeSourceIdsRef.current.push(sourceId);
      routeLayerIdsRef.current.push(layerId, hitLayerId);
    });

    // Draw active route on top
    const activeInfo = infos[activeIdx];
    if (activeInfo) {
      const sourceId = `route-source-${activeIdx}`;
      const layerId = `route-layer-${activeIdx}`;
      // Casing (outline)
      const casingId = `${layerId}-casing`;
      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: activeInfo.coordinates },
          properties: {},
        },
      });
      map.addLayer({
        id: casingId,
        type: 'line',
        source: sourceId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#fff', 'line-width': 9, 'line-opacity': 0.8 },
      });
      map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': ROUTE_ACTIVE_COLOR,
          'line-width': 6,
          'line-opacity': 1,
        },
      });
      routeSourceIdsRef.current.push(sourceId);
      routeLayerIdsRef.current.push(casingId, layerId);
    }
  }, []);

  const parseRoutes = useCallback(
    (
      rawRoutes: GoongRoute[],
      limit: number,
      exactStart?: [number, number],
      exactEnd?: [number, number],
    ): RouteInfo[] =>
      rawRoutes.slice(0, limit).map((r, idx) => {
        const leg = r.legs?.[0] ?? {};
        const decoded = polyline.decode(r.overview_polyline.points);
        const coordinates: [number, number][] = decoded.map(([lt, ln]) => [
          ln,
          lt,
        ]);

        // Connect the route exactly to the markers if provided
        if (exactStart && coordinates.length > 0)
          coordinates.unshift(exactStart);
        if (exactEnd && coordinates.length > 0) coordinates.push(exactEnd);

        const steps = (leg.steps ?? []).map((s) => ({
          instruction: stripHtml(s.html_instructions ?? ''),
          distance: s.distance?.text ?? '',
          duration: s.duration?.text ?? '',
        }));
        return {
          index: idx,
          distance: leg.distance?.text ?? '',
          distanceValue: leg.distance?.value ?? 0,
          duration: leg.duration?.text ?? '',
          durationValue: leg.duration?.value ?? 0,
          steps,
          summary: r.summary || `Tuyến ${idx + 1}`,
          coordinates,
        };
      }),
    [],
  );

  // ── Geocoding helpers ──────────────────────────────────────────────────────
  const getCoordinates = useCallback(
    async (address: string): Promise<{ lat: number; lng: number } | null> => {
      const key = address.trim().toLowerCase();
      const cached = geocodeCacheRef.current.get(key);
      if (cached) return cached;
      try {
        const res = await axios.get(
          `https://rsapi.goong.io/geocode?address=${encodeURIComponent(address)}&api_key=${apiKey}`,
        );
        const loc = res.data?.results?.[0]?.geometry?.location;
        if (loc) {
          const result = { lat: loc.lat, lng: loc.lng };
          geocodeCacheRef.current.set(key, result);
          return result;
        }
        return null;
      } catch {
        return null;
      }
    },
    [],
  );

  const reverseGeocode = useCallback(
    async (lat: number, lng: number): Promise<string | null> => {
      try {
        const res = await axios.get(
          `https://rsapi.goong.io/geocode?latlng=${lat},${lng}&api_key=${apiKey}`,
        );
        return res.data?.results?.[0]?.formatted_address ?? null;
      } catch {
        return null;
      }
    },
    [],
  );

  // ── Location toggle ────────────────────────────────────────────────────────
  const handleLocationToggle = useCallback(() => {
    if (!navigator.geolocation) {
      showNotification('error', 'Trình duyệt không hỗ trợ định vị.');
      return;
    }
    if (isLocationOn) {
      setIsLocationOn(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const loc = { lat: coords.latitude, lng: coords.longitude };
        setUserLocation(loc);
        setIsLocationOn(true);
        mapRef.current?.flyTo({
          center: [loc.lng, loc.lat],
          zoom: 15,
          essential: true,
        });
      },
      () =>
        showNotification(
          'error',
          'Không thể lấy vị trí. Vui lòng kiểm tra cài đặt trình duyệt.',
        ),
    );
  }, [isLocationOn, setIsLocationOn, setUserLocation, showNotification]);

  // ── Get current location for direction input ───────────────────────────────
  const getCurrentLocation = useCallback(
    (isStart: boolean) => {
      if (!navigator.geolocation) {
        showNotification('error', 'Trình duyệt không hỗ trợ định vị.');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          const loc = { lat: coords.latitude, lng: coords.longitude };
          setUserLocation(loc);
          const address = await reverseGeocode(loc.lat, loc.lng);
          if (!address) return;
          // Pre-populate geocode cache with exact GPS coordinates so the next route
          // search gets an instant cache hit instead of re-calling the geocode API.
          geocodeCacheRef.current.set(address.trim().toLowerCase(), loc);
          if (isStart) {
            setStartAddress(address);
            setCurrentLocationUsage('start');
            startMarkerRef.current?.remove();
            startMarkerRef.current = createStartMarker([loc.lng, loc.lat]);
          } else {
            setEndAddress(address);
            setCurrentLocationUsage('end');
            endMarkerRef.current?.remove();
            endMarkerRef.current = createEndMarker([loc.lng, loc.lat]);
          }
        },
        () => showNotification('error', 'Không thể lấy vị trí hiện tại.'),
      );
    },
    [
      setUserLocation,
      reverseGeocode,
      setStartAddress,
      setEndAddress,
      setCurrentLocationUsage,
      createStartMarker,
      createEndMarker,
      showNotification,
    ],
  );

  // ── Route search ───────────────────────────────────────────────────────────
  const handleRouteSearch = useCallback(async () => {
    if (!startAddress.trim() || !endAddress.trim()) {
      showNotification('error', 'Vui lòng nhập đầy đủ địa chỉ.');
      return;
    }
    // Token-based cancellation: only the latest search's results are applied
    const token = ++searchTokenRef.current;
    setIsRouteLoading(true);
    try {
      const [startLoc, endLoc] = await Promise.all([
        getCoordinates(startAddress),
        getCoordinates(endAddress),
      ]);
      if (token !== searchTokenRef.current) return;

      if (!startLoc || !endLoc) {
        showNotification(
          'error',
          'Không tìm thấy địa chỉ, vui lòng kiểm tra lại.',
        );
        return;
      }
      const isSameCoord =
        Math.abs(startLoc.lat - endLoc.lat) < 0.0001 &&
        Math.abs(startLoc.lng - endLoc.lng) < 0.0001;
      if (isSameCoord) {
        showNotification('error', 'Điểm đến phải khác với điểm xuất phát.');
        return;
      }

      // Always replace both markers so no stale pin is ever left on the map
      startMarkerRef.current?.remove();
      startMarkerRef.current = createStartMarker([startLoc.lng, startLoc.lat]);
      endMarkerRef.current?.remove();
      endMarkerRef.current = createEndMarker([endLoc.lng, endLoc.lat]);

      const res = await axios.get(
        `https://rsapi.goong.io/Direction?origin=${startLoc.lat},${startLoc.lng}&destination=${endLoc.lat},${endLoc.lng}&vehicle=${useMapStore.getState().vehicleType ?? 'car'}&alternatives=true&api_key=${apiKey}`,
      );
      if (token !== searchTokenRef.current) return;

      const rawRoutes: GoongRoute[] = res.data.routes ?? [];
      if (!rawRoutes.length) {
        showNotification('error', 'Không tìm thấy tuyến đường phù hợp.');
        return;
      }

      const infos = parseRoutes(
        rawRoutes,
        maxRoutes,
        [startLoc.lng, startLoc.lat],
        [endLoc.lng, endLoc.lat],
      );
      setRouteInfoList(infos);
      setSelectedRouteIndex(0);
      setIsRouteInfoVisible(true);
      drawRoutes(infos, 0);
      mapRef.current?.fitBounds(
        [
          [startLoc.lng, startLoc.lat],
          [endLoc.lng, endLoc.lat],
        ],
        { padding: FIT_BOUNDS_PADDING },
      );
    } catch (e) {
      if (token === searchTokenRef.current) {
        console.error(e);
        showNotification('error', 'Có lỗi khi tìm đường, vui lòng thử lại.');
      }
    } finally {
      if (token === searchTokenRef.current) {
        setIsRouteLoading(false);
      }
    }
  }, [
    startAddress,
    endAddress,
    getCoordinates,
    createStartMarker,
    createEndMarker,
    maxRoutes,
    parseRoutes,
    setRouteInfoList,
    setSelectedRouteIndex,
    setIsRouteInfoVisible,
    drawRoutes,
    showNotification,
    setIsRouteLoading,
  ]);

  // ── Nearby hubs ────────────────────────────────────────────────────────────
  const handleFindNearbyHubs = useCallback((): HubWithDistance[] => {
    if (!userLocation) return [];
    return MOCK_HUBS.map((hub) => ({
      ...hub,
      distance: haversineDistance(
        userLocation.lat,
        userLocation.lng,
        hub.latitude,
        hub.longitude,
      ),
    }))
      .filter((h) => h.distance <= NEARBY_RADIUS_KM)
      .sort((a, b) => a.distance - b.distance);
  }, [userLocation]);

  useEffect(() => {
    setNearbyHubs(handleFindNearbyHubs());
  }, [userLocation, setNearbyHubs, handleFindNearbyHubs]);

  // ── Navigate to hub ────────────────────────────────────────────────────────
  const handleNavigateToHub = useCallback(
    async (hub: Hub) => {
      if (!userLocation) {
        showNotification(
          'error',
          'Vui lòng bật định vị để sử dụng tính năng này.',
        );
        return;
      }
      clearAllRoutes();
      try {
        const currentAddress = await reverseGeocode(
          userLocation.lat,
          userLocation.lng,
        );
        if (!currentAddress) return;
        setStartAddress(currentAddress);
        setEndAddress(hub.address);
        setCurrentLocationUsage('start');
        useMapStore.getState().setActiveTab('direction');

        startMarkerRef.current = createStartMarker([
          userLocation.lng,
          userLocation.lat,
        ]);
        endMarkerRef.current = createEndMarker([hub.longitude, hub.latitude]);

        const res = await axios.get(
          `https://rsapi.goong.io/Direction?origin=${userLocation.lat},${userLocation.lng}&destination=${hub.latitude},${hub.longitude}&vehicle=${useMapStore.getState().vehicleType ?? 'car'}&alternatives=true&api_key=${apiKey}`,
        );
        const rawRoutes: GoongRoute[] = res.data.routes ?? [];
        if (!rawRoutes.length) {
          showNotification('error', 'Không tìm thấy tuyến đường đến hub.');
          return;
        }

        const infos = parseRoutes(
          rawRoutes,
          maxRoutes,
          [userLocation.lng, userLocation.lat],
          [hub.longitude, hub.latitude],
        );
        setRouteInfoList(infos);
        setSelectedRouteIndex(0);
        setIsRouteInfoVisible(true);
        drawRoutes(infos, 0);
        mapRef.current?.fitBounds(
          [
            [userLocation.lng, userLocation.lat],
            [hub.longitude, hub.latitude],
          ],
          { padding: FIT_BOUNDS_PADDING },
        );
      } catch {
        showNotification(
          'error',
          'Có lỗi khi tìm đường đến hub, vui lòng thử lại.',
        );
      }
    },
    [
      userLocation,
      clearAllRoutes,
      reverseGeocode,
      setStartAddress,
      setEndAddress,
      setCurrentLocationUsage,
      createStartMarker,
      createEndMarker,
      maxRoutes,
      parseRoutes,
      setRouteInfoList,
      setSelectedRouteIndex,
      setIsRouteInfoVisible,
      drawRoutes,
      showNotification,
    ],
  );

  const handleFlyToHub = useCallback((hub: Hub) => {
    mapRef.current?.flyTo({
      center: [hub.longitude, hub.latitude],
      zoom: 16,
      essential: true,
    });
  }, []);

  const handleSelectRoute = useCallback(
    (idx: number) => setSelectedRouteIndex(idx),
    [setSelectedRouteIndex],
  );

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      {/* Map */}
      <div ref={mapContainerRef} style={{ position: 'absolute', inset: 0 }} />

      <MapSidebar
        onRouteSearch={handleRouteSearch}
        onFlyToHub={handleFlyToHub}
        onNavigateToHub={handleNavigateToHub}
        onGetCurrentLocation={getCurrentLocation}
        onSelectRoute={handleSelectRoute}
        onClearRoute={clearAllRoutes}
      />

      <LocationButton onGetLocation={handleLocationToggle} />

      <HubModal onNavigateToHub={handleNavigateToHub} />

      {/* Toast notifications stack */}
      <div className="fixed bottom-24 md:bottom-16 right-4 z-50 flex flex-col gap-2 items-end pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`
              flex items-start gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-sm font-medium
              border max-w-xs w-full pointer-events-auto
              animate-in slide-in-from-right-4 fade-in duration-300
              ${
                n.type === 'error'
                  ? 'bg-white dark:bg-slate-900 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                  : n.type === 'success'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    : 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800'
              }
            `}
          >
            {n.type === 'error' ? (
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2
                size={16}
                className="text-emerald-500 shrink-0 mt-0.5"
              />
            )}
            <span className="flex-1 leading-snug">{n.message}</span>
            <button
              onClick={() => dismissNotification(n.id)}
              className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapView;
