import { create } from 'zustand';
import type {
  Hub,
  HubWithDistance,
  UserLocation,
  RouteInfo,
} from '@/types/map.types';

interface MapState {
  isMapReady: boolean;
  setIsMapReady: (ready: boolean) => void;

  // User location
  userLocation: UserLocation | null;
  setUserLocation: (location: UserLocation | null) => void;
  isLocationOn: boolean;
  setIsLocationOn: (on: boolean) => void;

  // Hubs
  hubs: Hub[];
  setHubs: (hubs: Hub[]) => void;

  // Nearby hubs
  nearbyHubs: HubWithDistance[];
  setNearbyHubs: (hubs: HubWithDistance[]) => void;

  // Hub modal
  selectedHub: Hub | null;
  isHubModalOpen: boolean;
  openHubModal: (hub: Hub) => void;
  closeHubModal: () => void;

  // Direction inputs
  startAddress: string;
  setStartAddress: (address: string) => void;
  endAddress: string;
  setEndAddress: (address: string) => void;
  currentLocationUsage: 'start' | 'end' | null;
  setCurrentLocationUsage: (usage: 'start' | 'end' | null) => void;
  swapAddresses: () => void;

  // Sidebar UI
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  activeTab: 'search' | 'direction';
  setActiveTab: (tab: 'search' | 'direction') => void;

  // Route options
  maxRoutes: 1 | 2 | 3;
  setMaxRoutes: (n: 1 | 2 | 3) => void;
  routeFilterActive: boolean;
  setRouteFilterActive: (active: boolean) => void;

  // Route results
  routeInfoList: RouteInfo[];
  setRouteInfoList: (routes: RouteInfo[]) => void;
  selectedRouteIndex: number;
  setSelectedRouteIndex: (idx: number) => void;
  isRouteInfoVisible: boolean;
  setIsRouteInfoVisible: (visible: boolean) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Actions
  clearDirections: () => void;
  /** Clear only route results (not addresses) — used for partial resets */
  clearRouteResults: () => void;
  isRouteLoading: boolean;
  setIsRouteLoading: (loading: boolean) => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  isMapReady: false,
  setIsMapReady: (ready) => set({ isMapReady: ready }),

  userLocation: null,
  setUserLocation: (location) => set({ userLocation: location }),
  isLocationOn: false,
  setIsLocationOn: (on) => set({ isLocationOn: on }),

  hubs: [],
  setHubs: (hubs) => set({ hubs }),

  nearbyHubs: [],
  setNearbyHubs: (hubs) => set({ nearbyHubs: hubs }),

  selectedHub: null,
  isHubModalOpen: false,
  openHubModal: (hub) => set({ selectedHub: hub, isHubModalOpen: true }),
  closeHubModal: () => set({ isHubModalOpen: false, selectedHub: null }),

  startAddress: '',
  setStartAddress: (address) => set({ startAddress: address }),
  endAddress: '',
  setEndAddress: (address) => set({ endAddress: address }),
  currentLocationUsage: null,
  setCurrentLocationUsage: (usage) => set({ currentLocationUsage: usage }),
  swapAddresses: () => {
    const { startAddress, endAddress, currentLocationUsage } = get();
    const swappedUsage =
      currentLocationUsage === 'start'
        ? 'end'
        : currentLocationUsage === 'end'
          ? 'start'
          : null;
    set({
      startAddress: endAddress,
      endAddress: startAddress,
      currentLocationUsage: swappedUsage,
    });
  },

  isSidebarOpen: true,
  setIsSidebarOpen: (open) => set({ isSidebarOpen: open }),
  activeTab: 'direction',
  setActiveTab: (tab) => set({ activeTab: tab }),

  maxRoutes: 2,
  setMaxRoutes: (n) => set({ maxRoutes: n }),
  routeFilterActive: true,
  setRouteFilterActive: (active) => set({ routeFilterActive: active }),

  routeInfoList: [],
  setRouteInfoList: (routes) => set({ routeInfoList: routes }),
  selectedRouteIndex: 0,
  setSelectedRouteIndex: (idx) => set({ selectedRouteIndex: idx }),
  isRouteInfoVisible: false,
  setIsRouteInfoVisible: (visible) => set({ isRouteInfoVisible: visible }),

  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  clearDirections: () =>
    set({
      startAddress: '',
      endAddress: '',
      currentLocationUsage: null,
      routeInfoList: [],
      selectedRouteIndex: 0,
      isRouteInfoVisible: false,
    }),

  clearRouteResults: () =>
    set({
      routeInfoList: [],
      selectedRouteIndex: 0,
      isRouteInfoVisible: false,
    }),

  isRouteLoading: false,
  setIsRouteLoading: (loading) => set({ isRouteLoading: loading }),
}));
