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

// ─── constants ────────────────────────────────────────────────────────────────
const ROUTE_COLORS = ['#007AFF', '#6B7280', '#9CA3AF'];
const NEARBY_RADIUS_KM = 15;

// ─── helpers ──────────────────────────────────────────────────────────────────
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

// ─── Goong API response types ─────────────────────────────────────────────────
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

// ─── component ────────────────────────────────────────────────────────────────
const MapView: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoongMapInstance | null>(null);
  const startMarkerRef = useRef<GoongMarker | null>(null);
  const endMarkerRef = useRef<GoongMarker | null>(null);
  const routeLayersRef = useRef<string[]>([]);

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
    currentLocationUsage,
    setCurrentLocationUsage,
    maxRoutes,
    routeInfoList,
    setRouteInfoList,
    selectedRouteIndex,
    setSelectedRouteIndex,
    setIsRouteInfoVisible,
    clearDirections,
    setIsMapReady,
  } = useMapStore();

  // ── Toast notifications ──────────────────────────────────────────────────
  const [notification, setNotification] = useState<{
    type: 'error' | 'info';
    message: string;
  } | null>(null);

  const showNotification = useCallback(
    (type: 'error' | 'info', message: string) => {
      setNotification({ type, message });
      setTimeout(() => setNotification(null), 3500);
    },
    [],
  );

  // ── Load mock hubs ────────────────────────────────────────────────────────
  useEffect(() => {
    setHubs(MOCK_HUBS);
  }, [setHubs]);

  // ── Read geolocation silently on mount ────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        setUserLocation({ lat: coords.latitude, lng: coords.longitude }),
      () => {},
    );
  }, [setUserLocation]);

  // ── Initialise map ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current) return;
    goongjs.accessToken = maptilesKey;

    const map = new goongjs.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.goong.io/assets/goong_map_web.json',
      center: [106.69516, 10.77543],
      zoom: 13,
    });

    map.addControl(new goongjs.NavigationControl(), 'bottom-right');
    map.addControl(new goongjs.ScaleControl(), 'bottom-left');

    map.on('load', () => {
      mapRef.current = map;
      setIsMapReady(true);
      // Force the map to recalculate dimensions from the DOM after layout paint
      requestAnimationFrame(() => map.resize());

      // Hub markers
      MOCK_HUBS.forEach((hub) => {
        const el = document.createElement('div');
        el.title = hub.name;
        el.style.cssText = [
          'width:36px;height:36px;background:#059669;',
          'border:3px solid white;border-radius:50%;',
          'box-shadow:0 2px 8px rgba(0,0,0,0.35);cursor:pointer;',
          'display:flex;align-items:center;justify-content:center;',
          'transition:transform 0.15s;',
        ].join('');
        el.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.2)';
        });
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
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

  // ── Redraw routes when selected index changes ─────────────────────────────
  useEffect(() => {
    const { routeInfoList: routes } = useMapStore.getState();
    if (routes.length > 0 && selectedRouteIndex < routes.length) {
      drawRoutes(routes, selectedRouteIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRouteIndex]);

  // ── Marker creators ───────────────────────────────────────────────────────
  const createStartMarker = useCallback(
    (lngLat: [number, number]): GoongMarker | null => {
      const map = mapRef.current;
      if (!map) return null;
      const el = document.createElement('div');
      el.innerHTML = `
      <div style="position:relative;width:28px;height:36px">
        <div style="
          width:26px;height:26px;
          background:#10B981;border:3px solid white;
          border-radius:50% 50% 50% 0;transform:rotate(-45deg);
          box-shadow:0 3px 8px rgba(0,0,0,0.3);
          position:absolute;top:0;left:0;
        ">
          <div style="
            width:9px;height:9px;background:white;border-radius:50%;
            position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)
          "></div>
        </div>
      </div>`;
      return new goongjs.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(lngLat)
        .addTo(map);
    },
    [],
  );

  const createEndMarker = useCallback(
    (lngLat: [number, number]): GoongMarker | null => {
      const map = mapRef.current;
      if (!map) return null;
      const el = document.createElement('div');
      el.innerHTML = `
      <div style="position:relative;width:28px;height:36px">
        <div style="
          width:26px;height:26px;
          background:#EF4444;border:3px solid white;
          border-radius:50% 50% 50% 0;transform:rotate(-45deg);
          box-shadow:0 3px 8px rgba(0,0,0,0.3);
          position:absolute;top:0;left:0;
        ">
          <div style="
            width:9px;height:9px;background:white;border-radius:50%;
            position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)
          "></div>
        </div>
      </div>`;
      return new goongjs.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(lngLat)
        .addTo(map);
    },
    [],
  );

  // ── Draw multiple routes ─────────────────────────────────────────────────
  const drawRoutes = useCallback((routes: RouteInfo[], selectedIdx: number) => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old layers
    routeLayersRef.current.forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
      if (map.getSource(id)) map.removeSource(id);
    });
    routeLayersRef.current = [];

    // Draw non-selected (gray, behind)
    routes.forEach((route, idx) => {
      if (idx === selectedIdx) return;
      const id = `route-${idx}`;
      map.addSource(id, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: route.coordinates },
        },
      });
      map.addLayer({
        id,
        type: 'line',
        source: id,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': ROUTE_COLORS[idx] ?? '#9CA3AF',
          'line-width': 4,
          'line-opacity': 0.65,
        },
      });
      routeLayersRef.current.push(id);
    });

    // Draw selected (blue, on top)
    const selId = `route-${selectedIdx}`;
    map.addSource(selId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routes[selectedIdx].coordinates,
        },
      },
    });
    map.addLayer({
      id: selId,
      type: 'line',
      source: selId,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': ROUTE_COLORS[0],
        'line-width': 6,
        'line-opacity': 1,
      },
    });
    // Casing layer (outline) for selected route
    const casingId = `${selId}-casing`;
    map.addSource(casingId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routes[selectedIdx].coordinates,
        },
      },
    });
    map.addLayer(
      {
        id: casingId,
        type: 'line',
        source: casingId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#ffffff',
          'line-width': 10,
          'line-opacity': 0.5,
        },
      },
      selId, // insert below the blue line
    );
    routeLayersRef.current.push(casingId, selId);
  }, []);

  // ── Clear everything ──────────────────────────────────────────────────────
  const clearAllRoutes = useCallback(() => {
    const map = mapRef.current;
    if (map) {
      routeLayersRef.current.forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id);
        if (map.getSource(id)) map.removeSource(id);
      });
      routeLayersRef.current = [];
    }
    startMarkerRef.current?.remove();
    startMarkerRef.current = null;
    endMarkerRef.current?.remove();
    endMarkerRef.current = null;
    clearDirections();
  }, [clearDirections]);

  // ── Geocode ───────────────────────────────────────────────────────────────
  const getCoordinates = useCallback(async (address: string) => {
    const res = await axios.get(
      `https://rsapi.goong.io/Geocode?address=${encodeURIComponent(address)}&api_key=${apiKey}`,
    );
    return (
      (res.data.results?.[0]?.geometry?.location as {
        lat: number;
        lng: number;
      }) ?? null
    );
  }, []);

  const reverseGeocode = useCallback(
    async (lat: number, lng: number): Promise<string | null> => {
      const res = await axios.get(
        `https://rsapi.goong.io/Geocode?latlng=${lat},${lng}&api_key=${apiKey}`,
      );
      return (res.data.results?.[0]?.formatted_address as string) ?? null;
    },
    [],
  );

  // ── Show user dot on map ──────────────────────────────────────────────────
  const showUserLocationOnMap = useCallback((lng: number, lat: number) => {
    const map = mapRef.current;
    if (!map) return;
    ['user-dot', 'user-pulse', 'user-heading', 'user-pulse-outer'].forEach(
      (id) => {
        if (map.getLayer(id)) map.removeLayer(id);
      },
    );
    if (map.getSource('user-location')) map.removeSource('user-location');
    map.addSource('user-location', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: {},
      },
    });
    map.addLayer({
      id: 'user-pulse-outer',
      type: 'circle',
      source: 'user-location',
      paint: {
        'circle-radius': 24,
        'circle-color': '#BFDBFE',
        'circle-opacity': 0.4,
        'circle-blur': 0.8,
      },
    });
    map.addLayer({
      id: 'user-pulse',
      type: 'circle',
      source: 'user-location',
      paint: {
        'circle-radius': 16,
        'circle-color': '#3B82F6',
        'circle-opacity': 0.3,
        'circle-blur': 0.5,
      },
    });
    map.addLayer({
      id: 'user-heading',
      type: 'circle',
      source: 'user-location',
      paint: {
        'circle-radius': 10,
        'circle-color': '#1D4ED8',
        'circle-opacity': 0.5,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
      },
    });
    map.addLayer({
      id: 'user-dot',
      type: 'circle',
      source: 'user-location',
      paint: {
        'circle-radius': 6,
        'circle-color': '#1E40AF',
        'circle-stroke-color': '#fff',
        'circle-stroke-width': 3,
      },
    });
    map.flyTo({ center: [lng, lat], zoom: 16, essential: true });
  }, []);

  // ── Get / use current location ────────────────────────────────────────────
  const getCurrentLocation = useCallback(
    async (isStart?: boolean) => {
      if (!navigator.geolocation) {
        showNotification('error', 'Trình duyệt không hỗ trợ định vị.');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async ({ coords: { latitude, longitude } }) => {
          setUserLocation({ lat: latitude, lng: longitude });
          setIsLocationOn(true);
          try {
            if (isStart !== undefined) {
              const address = await reverseGeocode(latitude, longitude);
              if (address) {
                if (isStart) {
                  setStartAddress(address);
                  setCurrentLocationUsage('start');
                  startMarkerRef.current?.remove();
                  startMarkerRef.current = createStartMarker([
                    longitude,
                    latitude,
                  ]);
                } else {
                  setEndAddress(address);
                  setCurrentLocationUsage('end');
                  endMarkerRef.current?.remove();
                  endMarkerRef.current = createEndMarker([longitude, latitude]);
                }
              }
            }
            showUserLocationOnMap(longitude, latitude);
          } catch {
            /* geocode errors are non-critical */
          }
        },
        () =>
          showNotification(
            'error',
            'Không thể lấy vị trí. Vui lòng kiểm tra quyền truy cập vị trí trong trình duyệt.',
          ),
        { timeout: 10000, maximumAge: 60000 },
      );
    },
    [
      setUserLocation,
      setIsLocationOn,
      reverseGeocode,
      setStartAddress,
      setCurrentLocationUsage,
      createStartMarker,
      setEndAddress,
      createEndMarker,
      showUserLocationOnMap,
      showNotification,
    ],
  );

  // ── Window resize → resize map ──────────────────────────────────────────
  useEffect(() => {
    const onResize = () => mapRef.current?.resize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Watch store flag for sidebar pin button clicks
  useEffect(() => {
    if (currentLocationUsage === 'start') getCurrentLocation(true);
    else if (currentLocationUsage === 'end') getCurrentLocation(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocationUsage]);

  const handleLocationToggle = useCallback(() => {
    if (isLocationOn) setIsLocationOn(false);
    else getCurrentLocation();
  }, [isLocationOn, setIsLocationOn, getCurrentLocation]);

  // ── Parse API routes ──────────────────────────────────────────────────────
  const parseRoutes = useCallback(
    (rawRoutes: GoongRoute[], limit: number): RouteInfo[] =>
      rawRoutes.slice(0, limit).map((r, idx) => {
        const leg = r.legs?.[0] ?? {};
        const decoded = polyline.decode(r.overview_polyline.points);
        const coordinates: [number, number][] = decoded.map(([lt, ln]) => [
          ln,
          lt,
        ]);
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

  // ── Route search ──────────────────────────────────────────────────────────
  const handleRouteSearch = useCallback(async () => {
    if (!startAddress || !endAddress) {
      showNotification('error', 'Vui lòng nhập đầy đủ địa chỉ.');
      return;
    }
    try {
      const [startLoc, endLoc] = await Promise.all([
        getCoordinates(startAddress),
        getCoordinates(endAddress),
      ]);
      if (!startLoc || !endLoc) {
        showNotification(
          'error',
          'Không tìm thấy địa chỉ, vui lòng kiểm tra lại.',
        );
        return;
      }

      if (currentLocationUsage !== 'start') {
        startMarkerRef.current?.remove();
        startMarkerRef.current = createStartMarker([
          startLoc.lng,
          startLoc.lat,
        ]);
      }
      if (currentLocationUsage !== 'end') {
        endMarkerRef.current?.remove();
        endMarkerRef.current = createEndMarker([endLoc.lng, endLoc.lat]);
      }

      const res = await axios.get(
        `https://rsapi.goong.io/Direction?origin=${startLoc.lat},${startLoc.lng}&destination=${endLoc.lat},${endLoc.lng}&vehicle=car&alternatives=true&api_key=${apiKey}`,
      );
      const rawRoutes: GoongRoute[] = res.data.routes ?? [];
      if (!rawRoutes.length) {
        showNotification('error', 'Không tìm thấy tuyến đường phù hợp.');
        return;
      }

      const infos = parseRoutes(rawRoutes, maxRoutes);
      setRouteInfoList(infos);
      setSelectedRouteIndex(0);
      setIsRouteInfoVisible(true);
      drawRoutes(infos, 0);

      mapRef.current?.fitBounds(
        [
          [startLoc.lng, startLoc.lat],
          [endLoc.lng, endLoc.lat],
        ],
        { padding: { top: 80, bottom: 80, left: 400, right: 80 } },
      );
    } catch (e) {
      console.error(e);
      showNotification('error', 'Có lỗi khi tìm đường, vui lòng thử lại.');
    }
  }, [
    startAddress,
    endAddress,
    currentLocationUsage,
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
  ]);

  // ── Find nearby hubs ──────────────────────────────────────────────────────
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

  // ── Navigate to hub ───────────────────────────────────────────────────────
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
          `https://rsapi.goong.io/Direction?origin=${userLocation.lat},${userLocation.lng}&destination=${hub.latitude},${hub.longitude}&vehicle=car&alternatives=true&api_key=${apiKey}`,
        );
        const rawRoutes: GoongRoute[] = res.data.routes ?? [];
        if (!rawRoutes.length) {
          showNotification('error', 'Không tìm thấy tuyến đường đến hub.');
          return;
        }

        const infos = parseRoutes(rawRoutes, maxRoutes);
        setRouteInfoList(infos);
        setSelectedRouteIndex(0);
        setIsRouteInfoVisible(true);
        drawRoutes(infos, 0);

        mapRef.current?.fitBounds(
          [
            [userLocation.lng, userLocation.lat],
            [hub.longitude, hub.latitude],
          ],
          { padding: { top: 80, bottom: 80, left: 400, right: 80 } },
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
    (idx: number) => {
      setSelectedRouteIndex(idx);
    },
    [setSelectedRouteIndex],
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
      }}
    >
      {/* Map container – fills parent fixed container */}
      <div
        ref={mapContainerRef}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Sidebar */}
      <MapSidebar
        onRouteSearch={handleRouteSearch}
        onFlyToHub={handleFlyToHub}
        onNavigateToHub={handleNavigateToHub}
        onGetCurrentLocation={getCurrentLocation}
        onSelectRoute={handleSelectRoute}
        onClearRoute={clearAllRoutes}
      />

      {/* Location button */}
      <LocationButton onGetLocation={handleLocationToggle} />

      {/* Hub detail modal */}
      <HubModal />

      {/* Toast notification */}
      {notification && (
        <div
          className={`fixed bottom-24 md:bottom-16 right-4 z-50 px-4 py-3 rounded-xl shadow-xl text-sm font-medium border max-w-xs ${
            notification.type === 'error'
              ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
              : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
          }`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default MapView;
