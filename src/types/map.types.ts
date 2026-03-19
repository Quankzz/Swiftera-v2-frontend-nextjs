// Combines Product + ProductItem for map display (denormalized UI view)
export interface MapProductItem {
  product_item_id: string;
  product_id: string;
  name: string;
  category: string;
  current_daily_price: number;
  deposit_amount: number;
  description?: string;
  image_url?: string;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
}

export interface Hub {
  hub_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius_km?: number;
  phone_number?: string;
  open_hours?: string;
  total_products: number;
  available_products: number;
  image_url?: string;
  products: MapProductItem[];
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
