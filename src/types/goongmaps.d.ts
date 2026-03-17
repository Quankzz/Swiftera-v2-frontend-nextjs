declare module '@goongmaps/goong-js' {
  export interface LngLatLike {
    lng: number;
    lat: number;
  }

  export type LngLatBoundsLike =
    | [[number, number], [number, number]]
    | LngLatBounds;

  export class LngLat {
    lng: number;
    lat: number;
    constructor(lng: number, lat: number);
  }

  export class LngLatBounds {
    constructor(
      sw?: LngLatLike | [number, number],
      ne?: LngLatLike | [number, number],
    );
    extend(obj: LngLatLike | [number, number]): this;
  }

  export interface MapOptions {
    container: string | HTMLElement;
    style?: string;
    center?: [number, number] | LngLatLike;
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    bearing?: number;
    pitch?: number;
    attributionControl?: boolean;
  }

  export interface FlyToOptions {
    center?: [number, number] | LngLatLike;
    zoom?: number;
    bearing?: number;
    pitch?: number;
    speed?: number;
    curve?: number;
    essential?: boolean;
  }

  export interface FitBoundsOptions {
    padding?:
      | number
      | { top: number; bottom: number; left: number; right: number };
    maxZoom?: number;
    offset?: [number, number];
    duration?: number;
  }

  export interface GeoJSONSource {
    setData(data: GeoJSON.FeatureCollection | GeoJSON.Feature): void;
  }

  export type AnySourceData =
    | { type: 'geojson'; data: object }
    | { type: 'vector'; url?: string; tiles?: string[] }
    | { type: 'raster'; url?: string; tiles?: string[]; tileSize?: number }
    | {
        type: 'image';
        url: string;
        coordinates: [
          [number, number],
          [number, number],
          [number, number],
          [number, number],
        ];
      };

  export interface Layer {
    id: string;
    type:
      | 'fill'
      | 'line'
      | 'symbol'
      | 'circle'
      | 'background'
      | 'raster'
      | 'fill-extrusion';
    source?: string;
    filter?: unknown[];
    layout?: Record<string, unknown>;
    paint?: Record<string, unknown>;
    minzoom?: number;
    maxzoom?: number;
  }

  export class Map {
    constructor(options: MapOptions);
    on(type: string, listener: (...args: unknown[]) => void): this;
    off(type: string, listener: (...args: unknown[]) => void): this;
    flyTo(options: FlyToOptions): this;
    fitBounds(bounds: LngLatBoundsLike, options?: FitBoundsOptions): this;
    addSource(id: string, source: AnySourceData): this;
    removeSource(id: string): this;
    getSource(id: string): unknown;
    addLayer(layer: Layer, before?: string): this;
    removeLayer(id: string): this;
    getLayer(id: string): Layer | undefined;
    addControl(control: IControl, position?: string): this;
    remove(): void;
    getCanvas(): HTMLCanvasElement;
    getCenter(): LngLat;
    getZoom(): number;
    resize(): this;
  }

  export interface IControl {
    onAdd(map: Map): HTMLElement;
    onRemove(map: Map): void;
  }

  export interface MarkerOptions {
    element?: HTMLElement;
    anchor?: string;
    offset?: [number, number];
    draggable?: boolean;
  }

  export class Marker {
    constructor(options?: MarkerOptions | HTMLElement);
    setLngLat(lngLat: [number, number] | LngLatLike): this;
    getLngLat(): LngLat;
    addTo(map: Map): this;
    remove(): this;
    getElement(): HTMLElement;
    setPopup(popup: Popup): this;
    getPopup(): Popup;
    togglePopup(): this;
  }

  export interface PopupOptions {
    closeButton?: boolean;
    closeOnClick?: boolean;
    anchor?: string;
    offset?: number | [number, number];
    maxWidth?: string;
  }

  export class Popup {
    constructor(options?: PopupOptions);
    setLngLat(lngLat: [number, number] | LngLatLike): this;
    setHTML(html: string): this;
    setText(text: string): this;
    addTo(map: Map): this;
    remove(): this;
    isOpen(): boolean;
  }

  export class NavigationControl implements IControl {
    constructor(options?: {
      showCompass?: boolean;
      showZoom?: boolean;
      visualizePitch?: boolean;
    });
    onAdd(map: Map): HTMLElement;
    onRemove(map: Map): void;
  }

  export class ScaleControl implements IControl {
    constructor(options?: { maxWidth?: number; unit?: string });
    onAdd(map: Map): HTMLElement;
    onRemove(map: Map): void;
  }

  export class GeolocateControl implements IControl {
    constructor(options?: object);
    onAdd(map: Map): HTMLElement;
    onRemove(map: Map): void;
  }

  let accessToken: string;

  const _default: {
    Map: typeof Map;
    Marker: typeof Marker;
    Popup: typeof Popup;
    NavigationControl: typeof NavigationControl;
    ScaleControl: typeof ScaleControl;
    GeolocateControl: typeof GeolocateControl;
    accessToken: string;
  };

  export default _default;
}
