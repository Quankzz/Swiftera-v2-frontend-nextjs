/**
 * UI model for a hub node.
 * Maps 1-to-1 to the backend Hub entity fields (see docs/05_DANH_MUC_CHI_TIET_TRUONG_DU_LIEU.md).
 * `address` is a single computed string (addressLine + ward + district + city)
 * assembled by the API adapter for display convenience.
 */
export interface Hub {
  hub_id: string; // hubId
  code: string; // code
  name: string; // name
  address: string; // computed: addressLine + ward + district + city
  latitude: number | null; // latitude
  longitude: number | null; // longitude
  phone: string | null; // phone
  is_active: boolean; // isActive
}

export interface HubWithDistance extends Hub {
  distance: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
}

export interface RouteStep {
  instruction: string;
  distance: string;
  duration: string;
}

export interface RouteInfo {
  index: number;
  distance: string;
  distanceValue: number;
  duration: string;
  durationValue: number;
  steps: RouteStep[];
  summary: string;
  coordinates: [number, number][];
}
