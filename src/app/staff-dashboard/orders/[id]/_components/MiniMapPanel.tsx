'use client';

import React from 'react';
import { Navigation, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DeliveryMiniMap } from './DeliveryMiniMap';
import { fmtDatetime } from './utils';

interface MiniMapPanelProps {
  title: string;
  destLat?: number;
  destLng?: number;
  destAddress?: string;
  staffLat?: number;
  staffLng?: number;
  staffLocAt?: string;
  destPinColor?: 'red' | 'green';
  destLabel?: string;
}

export function MiniMapPanel({
  title,
  destLat,
  destLng,
  destAddress,
  staffLat,
  staffLng,
  staffLocAt,
  destPinColor = 'red',
  destLabel,
}: MiniMapPanelProps) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-md flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30 shrink-0">
        <div className="flex items-center gap-2">
          <Navigation className="size-4 text-theme-primary-start" />
          <p className="text-sm font-bold text-foreground">{title}</p>
        </div>
        {staffLocAt && (
          <p className="text-[11px] text-muted-foreground hidden lg:block">
            GPS: {fmtDatetime(staffLocAt)}
          </p>
        )}
      </div>

      {/* Map body */}
      <div className="p-2.5 flex-1 min-h-0">
        <DeliveryMiniMap
          destLat={destLat}
          destLng={destLng}
          destAddress={destAddress}
          staffLat={staffLat}
          staffLng={staffLng}
          destPinColor={destPinColor}
          destLabel={destLabel}
          mapHeightClass="h-48 sm:h-[55vh] lg:h-full lg:min-h-0"
        />
      </div>

      {/* GPS footer */}
      <div className="px-4 py-3 border-t border-border flex items-center gap-3 bg-card shrink-0">
        <div
          className={cn(
            'size-2.5 rounded-full shrink-0 transition-colors',
            staffLocAt && staffLat != null && staffLng != null
              ? 'bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]'
              : 'bg-muted-foreground/40',
          )}
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground">
            {staffLocAt && staffLat != null && staffLng != null
              ? 'GPS đang theo dõi'
              : 'Đang lấy vị trí...'}
          </p>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
            {staffLocAt
              ? `Cập nhật: ${fmtDatetime(staffLocAt)}`
              : 'Vui lòng cho phép truy cập vị trí'}
          </p>
        </div>
        {(!staffLocAt || staffLat == null || staffLng == null) && (
          <Loader2 className="size-4 text-muted-foreground animate-spin shrink-0" />
        )}
      </div>
    </div>
  );
}
