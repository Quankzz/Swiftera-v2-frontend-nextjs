'use client';

/**
 * DeliveredWorkflow — Trạng thái DELIVERED
 *
 * Staff đã giao hàng thành công. Hiển thị xác nhận giao hàng, cho phép
 * chụp ảnh bàn giao làm bằng chứng (local state), và giải thích bước tiếp theo:
 * khách nhấn "Đã nhận hàng" → đơn chuyển sang IN_USE (không hiện ở dashboard staff).
 * Khi khách nhấn "Trả hàng" → PENDING_PICKUP → staff bắt đầu workflow thu hồi.
 */

import React, { useState } from 'react';
import Image from 'next/image';
import {
  CheckCircle2,
  Package,
  Camera,
  Info,
  User,
  Phone,
  Calendar,
  Hash,
} from 'lucide-react';
import { WorkflowBanner } from '../WorkflowBanner';
import { Section } from '../Section';
import { InfoRow } from '../InfoRow';
import { CameraCapture } from '../CameraCapture';
import type { DashboardOrder } from '@/types/dashboard.types';
import { fmtDate } from '../utils';

export function DeliveredWorkflow({ order }: { order: DashboardOrder }) {
  const [handoverPhotos, setHandoverPhotos] = useState<string[]>([]);

  return (
    <div className="flex flex-col gap-4">
      <WorkflowBanner
        icon={CheckCircle2}
        title="Đã giao hàng thành công"
        desc="Thiết bị đã được bàn giao cho khách hàng. Đang chờ khách xác nhận đã nhận hàng trên ứng dụng."
        variant="success"
      />

      {/* ── Handover Photo Evidence ── */}
      <Section
        title="Ảnh bàn giao (bằng chứng giao hàng)"
        icon={Camera}
        defaultOpen
      >
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          Chụp ảnh xác nhận bàn giao thiết bị cho khách để lưu làm bằng chứng.
          Bao gồm ảnh thiết bị đang được cầm/nhận bởi khách, ảnh hóa đơn (nếu
          có).
        </p>
        <CameraCapture
          photos={handoverPhotos}
          onAdd={(url) => setHandoverPhotos((p) => [...p, url])}
          onRemove={(i) =>
            setHandoverPhotos((p) => p.filter((_, j) => j !== i))
          }
          label="Chụp ảnh bàn giao cho khách"
        />
        {handoverPhotos.length > 0 && (
          <p className="text-xs text-success font-semibold flex items-center gap-1.5 mt-3">
            <CheckCircle2 className="size-3.5" />
            {handoverPhotos.length} ảnh bằng chứng đã chụp
          </p>
        )}
      </Section>

      {/* ── Next Step Info ── */}
      <div className="rounded-2xl border border-info/30 bg-info/5 p-4 flex items-start gap-3">
        <Info className="size-5 text-info shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-foreground mb-1.5">
            Quy trình tiếp theo
          </p>
          <ol className="text-sm text-muted-foreground leading-relaxed space-y-1.5 list-none">
            <li className="flex items-start gap-2">
              <span className="size-4 rounded-full bg-info/20 text-info text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              Khách hàng sẽ xác nhận đã nhận được hàng trên ứng dụng → Đơn
              chuyển sang <strong className="text-foreground">Đang thuê</strong>
            </li>
            <li className="flex items-start gap-2">
              <span className="size-4 rounded-full bg-info/20 text-info text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              Khi khách nhấn &quot;Trả hàng&quot; → Đơn chuyển sang{' '}
              <strong className="text-foreground">Chờ thu hồi</strong> và xuất
              hiện trong mục thu hồi của bạn
            </li>
          </ol>
        </div>
      </div>

      {/* ── Order Summary ── */}
      <Section title="Thông tin đơn hàng" icon={User} defaultOpen={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-3">
          <InfoRow
            icon={User}
            label="Khách hàng"
            value={order.renter.full_name}
          />
          <InfoRow
            icon={Phone}
            label="Điện thoại"
            value={order.renter.phone_number}
          />
          <InfoRow
            icon={Calendar}
            label="Ngày bắt đầu"
            value={fmtDate(order.start_date)}
          />
          <InfoRow
            icon={Calendar}
            label="Hạn trả"
            value={fmtDate(order.end_date)}
          />
        </div>
      </Section>

      {/* ── Items Delivered ── */}
      <Section
        title={`Thiết bị đã giao (${order.items.length})`}
        icon={Package}
        defaultOpen={false}
      >
        <div className="flex flex-col divide-y divide-border/40 pt-2">
          {order.items.map((item) => (
            <div
              key={item.rental_order_item_id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="relative size-10 shrink-0 rounded-lg overflow-hidden border border-border bg-muted">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.product_name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <div className="size-full flex items-center justify-center">
                    <Camera className="size-3.5 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {item.product_name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Hash className="size-3 text-muted-foreground" />
                  <p className="text-xs font-mono text-muted-foreground">
                    {item.serial_number}
                  </p>
                </div>
              </div>
              <CheckCircle2 className="size-5 text-success shrink-0" />
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
