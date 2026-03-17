export interface ProductItem {
  id: string;
  name: string;
  category: string;
  dailyPrice: number;
  depositAmount: number;
  description: string;
  imageUrl: string;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
}

export interface Hub {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phoneNumber?: string;
  openHours?: string;
  totalProducts: number;
  availableProducts: number;
  imageUrl?: string;
  products: ProductItem[];
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
