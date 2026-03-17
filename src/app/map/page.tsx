'use client';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 shrink-0 items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3 mx-auto" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Đang tải bản đồ...
        </p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  return <MapView />;
}
